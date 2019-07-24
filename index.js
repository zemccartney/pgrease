const Util = require('util');
const Fs = require('fs');
const Postgres = require('pg');

const internals = {};


// TODO NEED ERROR HANDLING
// TODO IS SETTING PGDBNAME TO postgres A SAFE DEFAULT???? i think so?

internals.configure = async () => {

  const envfilePath = (process.env[3] === '--e' && process.env[4]) || `${__dirname}/.env`;
  const configFile = await Util.promisify(Fs.readFile)(envfilePath);
  internals.parseConfigFile(configFile);

  // TODO BUT WHAT IF SOMEONE TRIES TO SET THESE IN THE FILE?
  // TODO WHAT IF SOMEONE SETS VIA CL, BUT ALSO HAS IN .ENV? (CL TAKES PRECEDENCE)
  // Postgres' root database on installing is named postgres
  // We assume that's the DB to which people want to connect unless specified
  // instead of using pg's default of process.env.USER, which, at least in my
  // limited experience, tends to trigger an error from trying to connect
  // to a non-existent database because database names and user names don't typically correspond
  // TODO Possible to run CREATE DATABASE under any other DB?
  // TODO Does this matter? How does the database to which we connect
  // affect how CREATE DATABASE runs
  process.env.PGDATABASE = process.env.PGDATABASE || 'postgres';

  // https://www.postgresql.org/docs/10/sql-createrole.html
  // "A null password can optionally be written explicitly as PASSWORD NULL."
  process.env.DB_PASSWORD = process.env.DB_PASSWORD || null;
}

internals.parseConfigFile = (src) => {

  return src.toString()
    .split('\n')
    .forEach((ln) => {

      // TODO WHY IS LAST LINE, EMPTY LINE, BEING READ (AND CAUSING DESTRUCTURING TO FAIL)?
      if (!ln) {
        return;
      }

      // if a line starts w/ that value
      // NOTE Regex bic'd straight from dotenv, all credit there
      // TODO Any way to break this regex?
      const [_, key, value] = ln.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      // Validation
      // TODO Throw validation errors please
      // TODO Use node's native assertions lib? How does that work?
      // TODO Are these rules compliant with pg syntax? READ THEIR DOCS, cite resource here
      // TODO What are other approaches to validation e.g. joi, ts, ajv, jsonschema?
          // why not node assertions?
      if (internals.VALID_CONFIG.hasOwnProperty(key) && internals.VALID_CONFIG[key](value)) {

          if (value) {
              process.env[key] = value;
          }
      }
    });
}

// https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS
// Bare-bones configuration validation to catch simple, predictable SQL errors outside of Postgres
// Namely, that values required for these commands to run are present
// and that values provided are strings, the most general requirement of SQL identifiers
internals.VALID_CONFIG = {
  // Required
  DB_NAME: (val) => val && typeof val === 'string',
  // Required
  DB_USER: (val) => val && typeof val === 'string',
  // Optional
  DB_PASSWORD: (val) => val ? typeof val === 'string' : true,
  // Optional
  DB_EXTENSIONS: (val) => {

      if (!val) {
        return true;
      }

      return Array.isArray(val) ? val.every((ext) => typeof ext === 'string') : typeof val === 'string';
  }
};

module.exports = async () => {

  // TODO Add error handling
  // How should we handle errors?
  // How do we need to clean up?
  // What state is the client in on a query error?
  // Does the connection automatically close if the process crashes?
  let client;
  try {
    await internals.configure();

    /**
      WHY WE CAN'T USE PARAMETERIZED QUERIES (or at least not out of the box)
      https://github.com/brianc/node-postgres/pull/396
    **/

    // TODO Show prepared queries to user so they can confirm?
    // Or is that a security issue re: showing login password?


    // We connect to the DB specified in process.env.PGDATABASE
    // See node-pg's defaults
    client = internals.getClient();
    await client.connect();
    const commands = internals.setupText();
    for (const c of commands) {
        await client.query(c);
    }
    await client.end();

    /**
      If query fails, we end our client
      If connection fails, then client isn't connected, so process shouldn't hang
      (monkey patch to test?)
    **/

    client = internals.getClient({ database: process.env.DB_NAME })
    await client.connect();
    await client.query(internals.prepareExtensions());
    await client.end();

    console.log('Database setup complete');
    // TODO Seems to work
    // BUT password not required; why?
    // To find conf file: SHOW hba_file;
    //https://askubuntu.com/questions/256534/how-do-i-find-the-path-to-pg-hba-conf-from-the-shell

    // Could catch all errors from script
    // Then try to connect, and catch and swallow
    // Then log a more helpful error message as possible?
    // Or just dump the error
    /*
      Possible errors:
        - syntax error
        - failed to connect / connection issue
        - resource already exists
            - error: role "postcone_jones" already exists
            - code: '42710'
        - insufficient privileges

        TODO See PostgresSQL CREATE DATABASE --> allow specifying different template?
    */
  } catch (e) {

      try {
          client.end()
          // TODO Use Bounce??? Read Eran's articles on errors in Promises
      } catch (socketAlreadyClosed) { /* Swallow the error, just making sure current connection is closed so process doesn't hang */}
      // TODO Though possible to end on drain, given that we're only submitting 1 query per client?

      console.error(e);
  }
};

internals.getClient = (overrides) => {

    const client = new Postgres.Client(overrides);
    client.on('error', () => {
        // We don't need to handle
        // Just catch
        // Only thing we want to prevent in error handling
        // is unclosed connections causing the process to hang
    });
    return client;
};


// TODO escapeLiteral on password?
// TODO This doesn't work — error: CREATE DATABASE cannot be executed from a function or multi-command string (25001)
// Note that password isn't escaped; does that work?
internals.setupText = () => {

    const { esc, escapeLiteral } = internals;

    const text = `CREATE DATABASE ${esc('DB_NAME')};
    CREATE USER ${esc('DB_USER')} ${process.env.DB_PASSWORD && `WITH LOGIN PASSWORD ${escapeLiteral(`${process.env.DB_PASSWORD}`)}`};
    GRANT ALL PRIVILEGES ON DATABASE ${esc('DB_NAME')} TO ${esc('DB_USER')};`;

    return text
      .split('\n')
      .map((cmd) => cmd.trim());
 };


  /*internals.prepareCommand = ({command, params}) => {

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
  };*/

// TODO Clean this up, don't repeat so much
internals.escapeIdentifier = (new Postgres.Client()).escapeIdentifier;
internals.escapeLiteral = (new Postgres.Client()).escapeLiteral;
internals.esc = (key) => internals.escapeIdentifier(process.env[key]);

// Written as functions because
// otherwise, references to env vars point at initial values (undefined)
// I think? TODO Figure this out
// Also allows additional logic / handling as needed... is that sensible?
internals.queries = [
    () => ({
      text: 'CREATE DATABASE $1',
      values: [process.env.DB_NAME]
    }),
    () => {

        // Password is optional for creating a user
        const text = `CREATE USER $1 ${process.env.DB_PASSWORD && 'WITH LOGIN PASSWORD $2'}`;
        const values = [process.env.DB_USER, process.env.DB_PASSWORD].filter((v) => v);
        console.log(process.env.DB_PASSWORD);
        return { text, values };
    },
    () => ({
      text: 'GRANT ALL PRIVILEGES ON DATABASE $1 TO $2',
      values: [process.env.DB_NAME, process.env.DB_USER]
    })
];

internals.prepareExtensions = () => {

  const { DB_EXTENSIONS: exts } = process.env;
  const text = 'CREATE EXTENSION IF NOT EXISTS $1;';

  if (!Array.isArray(exts)) {
    return text.replace('$1', internals.escapeIdentifier(exts));
  }

// TODO Any issue with running replace on same string multiple times?
  return exts
    .map((ex) => text.replace('$1', internals.escapeIdentifier(ex)))
    // node pg allows multiline commands
    .join();
};
