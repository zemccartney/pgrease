'use strict';
/**

Configuration Module — Sources configuration variables and stores them in
the process' environment.

Order of precedence for configuration source checking:

1. process.env e.g. set via CLI args (DB_NAME=test pgrease)
2. CLI flags (as documented in cli.js)
3. .env file

We do not validate the user's input we set on the environment because
we will later attempt to input that data to a Postgres server to setup
a database for the user. We will rely on the database to validate input
instead of trying to accurately duplicate the database's validation logic
for the sake of catching invalid input errors slightly earlier.

configFile (optional) — A string representing the path to .env file (excluding .env at end)

dbConf (optional) — An object containing database configuration variables. Its data will
be set on process.env only if it's properties match our configruation variable naming
conventions e.g. { DB_NAME, DB_USER, DB_PASSWORD, DB_EXTENSIONS }

This function will fail expectedly with a ConfigurationError if:

- The user provided an invalid config source. Right now, this type of
error stems only from the .env file being somehow unusable (empty, not found, insufficient perms)

- The user hasn't provided sufficient configuration between all valid sources.
Really, just if DB_NAME is missing at the end, as DB_NAME is variable necessary
for creating a database and we consider creating a database sufficient for completing
pgrease's goal (though the user may consider just a database insufficient; this
signals malformed use e.g. commented-out variables in the .env file or CLI arg typos)
**/

const Assert = require('assert').strict;
const Belt = require('./belt');
const Bounce = require('@hapi/bounce');
const Fs = require('fs');
const Path = require('path');
const Util = require('util');

// Module globals
const VALID_CONFIG_VARS = [
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'DB_EXTENSIONS'
];
const ERROR_NAME = 'ConfigurationError';

// Module custom functions
const ConfigurationError = Belt.nameError(ERROR_NAME);
const read = Util.promisify(Fs.readFile);

module.exports = async (dbConf, configFile) => {
  // We don't require either argument, as user could supply
  // all configuration via CLI

  // First, attempt to derive config from CLI flags
  if (dbConf) {
    Assert(
      typeof dbConf === 'object' && !Array.isArray(dbConf),
      'database configuration must be an object'
    );
    // TODO for...of vs. for...in?
    for (const [key, confv] of Object.entries(dbConf)) {
      // We don't override any set configuration, letting CLI args take precedence
      if (VALID_CONFIG_VARS.includes(key) && !process.env[key]) {
        process.env[key] = confv;
      }
    }
  }

  // Now source configuration from a .env file if specified
  if (configFile) {
    Assert(typeof configFile === 'string', 'config file path must be a string');
    // TODO Any other constraints to put on path?
    // TODO Need to test this more extensively,
    // not sure what cases this will actually handle
    // TODO Security considerations?
    const path = Path.resolve(process.cwd(), configFile);

    try {
      // TODO DOCUMENT THIS ASSUMPTION OF .env
      const env = await read(`${path}/.env`, 'utf8');

      // Empty .env file, nothing more to do here
      // ConfigurationError, not AssertionError, as the responsibility for fixing
      // this error would be the user's, not the programmer's
      Assert(env && env.length > 0, ConfigurationError(`.env file found at ${path} is empty`));

      env.toString()
        .split('\n')
        .forEach((line) => {
          // Empty line
          if (!line) {
            return;
          }

          // if a line starts w/ that value
          // NOTE Regex bic'd straight from dotenv, all credit there
          // TODO Any way to break this regex?
          const [, key, value] = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

          // TODO Document that CLI-set env vars take precedence, no overrides
          // TODO Test that this leaves process.env intact EXCEPT FOR these values
          if (VALID_CONFIG_VARS.includes(key)) {
            // TODO Remember to incorporate PG env vars
            !process.env[key] && (process.env[key] = value);
          }
        });
    } catch (e) {
      // Throws either system errors (dumb mistakes) or unanticpated operational errors that
      // should be handled (also bug, but less dumb) e.g. issue w/ state of user's system (memory, file descriptor count, etc.)
      // We ignore these errors in order to format hopefully more informative
      // error messages to the user
      // TODO How do we test this?
      Bounce.ignore(e, [
        { code: 'ENOENT' },
        { code: 'EACCES' },
        { name: ERROR_NAME }
      ]);

      let fileErrMessage;

      // Anticipated operational errors
      if (e.code === 'ENOENT') {
        fileErrMessage = `.env file not found at ${path}`;
      } else if (e.code === 'EACCES') {
        fileErrMessage = `.env file found at ${path}, but insufficient permissions (pgrease requires read access)`;
      } else { // ConfigurationError (name === ERROR_NAME)
        fileErrMessage = e.message;
      }

      throw ConfigurationError(fileErrMessage);
    }
  }

  // Handles insufficient configuration from CLI
  if (!process.env.DB_NAME) {
    throw ConfigurationError('You must specify at least a database name (DB_NAME)');
  }
};
