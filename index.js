const Util = require('util');
const Fs = require('fs');
const Postgres = require('pg');

const internals = {};


// TODO NEED ERROR HANDLING
// TODO IS SETTING PGDBNAME TO postgres A SAFE DEFAULT???? i think so?

internals.configure = async () => {

  // Postgres' root database on installing is named postgres
  // We assume that's the DB to which people want to connect unless specified
  // instead of using pg's default of process.env.USER, which, at least in my
  // limited experience, tends to trigger an error from trying to connect
  // to a non-existent because database names and user names don't typically correspond
  process.env.PGDATABASE = process.env.PGDATABASE || 'postgres';

  // https://www.postgresql.org/docs/10/sql-createrole.html
  // "A null password can optionally be written explicitly as PASSWORD NULL."
  process.env.DB_PASSWORD = process.env.DB_PASSWORD || null;

  const envfilePath = process.env[3] === '--e' && process.env[4];
  const configFile = await Util.promisify(Fs.readFile)(`${__dirname}/${envfilePath || '.env'}`);
  internals.parseConfigFile(configFile);
}

internals.parseConfigFile = (src) => {

  return src.toString()
    .split('\n')
    .forEach((ln) => {
      // if a line starts w/ that value
      // NOTE Regex bic'd straight from dotenv, all credit there
      const potentialConf = ln.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (potentialConf !== null) {
        const configKey = potentialConf[1];

        // Validation
        if (internals.VALID_CONFIG.hasOwnProperty(configKey) && internals.VALID_CONFIG[configKey]()) {
          process.env[configKey] = potentialConf[2];
        }
      }

      return conf;
    });
}

// https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS
// Bare-bones configuration validation to catch simple, predictable SQL errors outside of Postgres
// Namely, that values required for these commands to run are present
// and that values provided are strings, the most general requirement of SQL identifiers
internals.VALID_CONFIG = {
  DB_NAME: () => process.env.DB_NAME && typeof process.env.DB_NAME === 'string',
  DB_USER: () => process.env.DB_USER && typeof process.env.DB_USER === 'string',
  DB_PASSWORD: () => process.env.DB_PASSWORD ? typeof process.env.DB_PASSWORD === 'string' : true,
  DB_EXTENSIONS: () => {

      const exts = process.env.DB_EXTENSIONS;

      if (!exts) {
        return true;
      }

      return Array.isArray(exts) ? exts.every((ex) => typeof ex === 'string') : exts === 'string';
  }
};

module.exports = async () => {

  // TODO Add error handling
  await internals.configure();

  // TODO Make nomenclature consistent; are these queries or commands?
  const preparedCommands = internals.queries.reduce((set, q) => {

    if (q.type === 'admin') {
      set.admin.push(internals.prepareCommand(q));
    }

    if (q.type === 'extensions') {
      set.extensions.push(...internals.prepareExtensions(q));
    }

    return set;
  }, {
    admin: [],
    extensions: []
  });

  // TODO Show prepared queries to user so they can confirm

  let client;

  client = new Postgres.Client();
  await client.connect();
  // TODO Fix these loops / async function looping
  // TODO Switch to using pg's built-in query param method
  preparedQueries.admin.forEach(async (q) => {
    await client.query(q);
  });
  await client.end();

  // TODO Way to do this without new connection?
  client = new Postgres.Client({ database: process.env.DB_NAME })
  await client.connect();
  preparedQueries.extensions.forEach(async (q) => {
    await client.query(q);
  });
  await client.end();

  // TODO client.end needs to come in a finally clause
};

internals.queries = {
    admin: [
      {
        text: 'CREATE DATABASE $1',
        values: [process.env.DB_NAME]
      },
      // TODO NEED TO MAKE LOGIN PASSWORD PART OPTIONAL
      {
        text: 'CREATE USER $1 WITH LOGIN PASSWORD $2',
        values: [process.env.DB_USER, process.env.DB_PASSWORD]
      },
      {
        text: 'GRANT ALL PRIVILEGES ON DATABASE $1 TO $2',
        values: [process.env.DB_NAME, process.env.DB_USER]
      }
    ],
    extensions: [
      {
        text: 'CREATE EXTENSION IF NOT EXISTS $1',
        values: ['DB_EXTENSIONS']
      }
    ]
};

internals.prepareCommand = ({command, params}) => {

  // TODO unshit this regex
  // TODO Will this break depending on values of env vars?
  const parser = /\s(\$\d)\s?/g;
  const escape = (new Postgres.Client()).escapeIdentifier;
  let match;
  let i = 0;
  let prepared = command;

  while (match = parser.exec(prepared), i < params.length) {
    prepared = prepared.replace(match[1], escape(process.env[params[i]]));
    i++;
  }

  return prepared;
};

internals.prepareExtensions = ({ command, params }) => {

  const exts = process.env[params];
  if (!Array.isArray(exts)) {
    return [internals.prepareCommand({ command, params })];
  }

  const escape = (new Postgres.Client()).escapeIdentifier;
  return exts.map((ex, i) => {

    // TODO Needs to be here? Any issue with running replace on same string multiple times?
    let cmd = command;
    cmd.replace('$1', escape(process.env[params[0]][i]));
  });
};
