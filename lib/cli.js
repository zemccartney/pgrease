'use strict';

const Bossy = require('@hapi/bossy');
const Bounce = require('@hapi/bounce');
const ConfigureEnv = require('./configure');
const Pkg = require('../package.json');
const Exec = require('./execute');


// TODO Do both - and -- versions of alias and non-alias work?
const definition = {
  h: {
    description: 'Show help',
    alias: 'help',
    type: 'boolean'
  },
  v: {
    description: 'Show version',
    alias: 'version',
    type: 'boolean'
  },
  f: {
    description: `Path to .env file containing configuration variables. Considered
    absolute only if the path begins with your OS' path separator. Otherwise, treated
    as relative to current working directory`,
    alias: 'file-config',
    type: 'string',
    default: null
  },
  d: {
    description: 'Name of the database to create',
    alias: 'database-name',
    type: 'string'
  },
  u: {
    description: 'Name of database user to create',
    alias: 'database-user',
    type: 'string'
  },
  p: {
    description: 'Password for specified database user',
    alias: 'database-password',
    type: 'string'
  },
  x: {
    description: 'Comma separated list of database extensions',
    alias: 'database-extensions',
    type: 'string'
  }
};

exports.run = async () => {
  const argv = Bossy.parse(definition);

  // TODO Test this
  if (argv instanceof Error) {
    console.error(argv.message);
    process.exit(1);
  }

  if (argv.help) {
    console.log(Bossy.usage(definition, 'pgrease [options]'));
    process.exit(0);
  }

  if (argv.version) {
    // TODO Does this look right?
    console.log(Pkg.version);
    process.exit(0);
  }

  try {
    await ConfigureEnv(
      {
        DB_NAME: argv.d,
        DB_USER: argv.u,
        DB_PASSWORD: argv.p,
        // TODO Document expectations for declaration of extensions (comma-separated list)
        // Arrays are serialized into cs-lists on assignment to process.env anyway
        // TODO How can user specify an array of extensions in their .env file?
        DB_EXTENSIONS: argv.x
      },
      argv.f
    );
    await Exec();
    // TODO Print what pgrease did to the user?
    console.log('pgrease complete — your database is ready to go');
  } catch (error) {
    Bounce.rethrow(error, 'system');
    switch (error.name) {
      // TODO I want operational errors to surface to user w/ diagnosis and recommendation for fix
      // operational errors that require user intervention to get around
    }
  }
};

/*
  For error handling, propagate failures to the client
  Describe which operation failed, why, and what happened already /
  if anything were cleaned up
*/
