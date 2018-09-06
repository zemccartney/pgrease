const Util = require('util');
const Fs = require('fs');
const Postgres = require('pg');

const internals = {};

internals.determineConfiguration = async () => {

  // TODO Gross...don't harcode? Or make configurable somehow?
  const configFile = await internals.readFile('./.env');
  const parsed = internals.parseConfigFile(configFile);

  // TODO Make this suck less
  if (Object.keys(parsed).length !== internals.VALID_CONFIG.length) {
    throw new Error('insufficent configuration provided!')
  }

  return parsed;
}

internals.parseConfigFile = (src) => {

  return src.toString()
    .split('\n')
    .reduce((conf, ln) => {
      // if a line starts w/ that value
      // NOTE Regex bic'd straight from dotenv
      const potentialConf = ln.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (potentialConf !== null) {
        const configKey = potentialConf[1];
        if (internals.VALID_CONFIG.includes(configKey))
        return { ...conf, [configKey]: potentialConf[2] }
      }

      return conf;
    }, {})
}

internals.VALID_CONFIG = [
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  // TODO Actually support multiple
  'DB_EXTENSION'
];

module.exports = async () => {
  const config = await internals.determineConfiguration();
  await internals.performOperations(config);
}

internals.performOperations = async (conf) => {

  await internals.executeOperationSet([
    internals.createDatabase,
    internals.createUser,
    internals.setUserPerms
  ].map((op) => op(conf)));

  await internals.extendDatabase(conf);
};

internals.readFile = Util.promisify(Fs.readFile);

internals.getPGClient = (overrides) => {
  // TODO SUCCCCCCCCC
  // To overcome postgres' connection defaults...hmmm
  // assumes your user is a current role and has root access!!!
  // To overcome, could allow providing some sort of override?
  // postgres db always exists, unless manually deleted??? or maybe not?
  process.env.PGDATABASE = 'postgres';
  return new Postgres.Client({ ...overrides });
};


// TODO At least attempt some sort of input validation / null checking
internals.createDatabase = ({ DB_NAME }) => ({
  command: 'CREATE DATABASE $1',
  params: [DB_NAME]
});

// TODO This fails with syntax error at or near ""testing""
// PW is getting double-escaped for some reason; how to workaround?
/*internals.createUser = ({ DB_USER, DB_PASSWORD }) => ({
  command: 'CREATE USER $1 WITH LOGIN PASSWORD $2',
  params: [DB_USER, DB_PASSWORD]
});*/

internals.createUser = ({ DB_USER }) => ({
  command: 'CREATE USER $1',
  params: [DB_USER]
});

internals.setUserPerms = ({ DB_NAME, DB_USER }) => ({
  command: 'GRANT ALL PRIVILEGES ON DATABASE $1 TO $2',
  params: [DB_NAME, DB_USER]
});

// TODO Operation that requires its own client connection (to the new DB)
internals.extendDatabase = async (conf) => {

  const client = internals.getPGClient({ database: conf.DB_NAME });
  await client.connect();

  const command = 'CREATE EXTENSION IF NOT EXISTS $1';
  await client.query(internals.prepareCommand(command, [conf.DB_EXTENSION]));
  await client.end();
  return;
}

internals.executeOperationSet = async (ops) => {

  const client = internals.getPGClient();
  await client.connect();
  for (const op of ops) {
    const { command, params } = op;
    await client.query(internals.prepareCommand(command, params));
  }
  await client.end();
  return;
};

internals.prepareCommand = (command, params) => {

  // TODO unshit this regex
  const parser = /\s(\$\d)\s?/g;
  const escape = (new Postgres.Client()).escapeIdentifier;
  let match;
  let i = 0;
  let prepared = command;

  while (match = parser.exec(prepared), i < params.length) {
    prepared = prepared.replace(match[1], escape(params[i]));
    i++;
  }

  return prepared;
};


// What do we want to do? (listed in .env file)

  // Where is that file / what does it contain?
  // Read file, identify things to do

// Do things
  // Identify structural operation
  // Prepare operation
    // Prepare values
