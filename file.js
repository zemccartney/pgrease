// What errors can happen?

// What do they mean?

// What can we do about them?

'use strict';

const Bounce = require('@hapi/bounce');
const Fs = require('fs');
const Joi = require('@hapi/joi');
const Path = require('path');
const Util = require('util');

const read = Util.promisify(Fs.readFile);

// require.resolve????

// Input validation??? WHAT TO DO THERE???

// TODO Add unhandledPromiseRejection handler
// TODO I want prog / system errors to show loudly / report as possible bugs to user
// TODO I want operational erros to surface to user w/ diagnosis and recommendation for fix
// operational errors that require user intervention to get around

async function parseEnv (options) {
  // TODO Allow specifying path to file / args
  let env;
  try {
    // TODO Is process.cwd() right?
    // TODO Need to test this more extensively, not sure what cases this will
    // actually handle
    const path = options.path && Path.resolve(process.cwd(), options.path);
    env = await read(`${path || process.cwd()}/.env`, 'utf8');
  } catch (e) {
    // (very dumb) programmer error
    // TODO necessary? Overkill?
    Bounce.rethrow(e, 'system', { decorate: { type: 'programmer' } });

    // Anticipated operational errors
    if (e.code === 'ENOENT' || e.code === 'EACCES') {
      // TODO replace w/ call to centralized error handler
      console.error(e, 'WEENS');
      process.exit(1);
    }

    // Unanticipated operational error
    // Could be due to state of user's system e.g. memory, file descriptor count, etc.
    throw e;
  }

  // Empty .env file, nothing more to do here
  if (env.length === 0) {
    // TODO What should we do here?
    console.log('empty .env file!');
  }

  // Check state of current env (e.g. cl, other program)
  // Load only non-existent values

  // Default to node-pg's env defaults...except for PGDATABASE
  // CLI args take highest precedence
  // use DB* as aliases for PG
  // If both are presenting / conflicting....
    // Evaluate precedence
    // If equal...randomly go w/ PG* val
  // End w/ .env configured....NO! NOT AS PG EXPECTS
  // Remember....these values are NOT for connecting
      // HOW DO WE USE THIS CONFIGURATION? WHAT DO WE WANT OUT OF THESE VALUES?

        // - to configure SQL commands
        // - to determine the DB to which we later connect, otherwise using the
        // same creds as our initial connection
        // TODO Offer way to parameterize initial connection .... HOW? WHAT ARE THE REQUIREMENTS?

      // Note how we fallback to pg's defaults
      // Not how user can therefore input PG vars to override initial connection config

  // What's my opinion about requirements of env file contents?
  // TODO DEPENDS ON WHAT QUERIES WE ULTIMATELY WRITE...THAT'S OUR OPINION
  const config = env.toString()
    .split('\n')
    .reduce((config, line) => {
      // TODO WHY IS LAST LINE, EMPTY LINE, BEING READ (AND CAUSING DESTRUCTURING TO FAIL)?
      if (!line) {
        return config;
      }

      // if a line starts w/ that value
      // NOTE Regex bic'd straight from dotenv, all credit there
      // TODO Any way to break this regex?
      const [_, key, value] = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

      return {
        ...config, // TODO Is this ordering right? Possibility of overrides?
        [key]: value
      };
    }, {});

  if (!config.DB_NAME) {
    // TODO Reread Joyent error handling, figure out what to do here
    throw new Error('You must specify a the name of the database to create');
  }

  for (const [key, value] of Object.entries(config)) {
    process.env[key] = value;
  }

  // If no user, ignore password command, create database as connection user
  // Which depends on....what?
  // If no password....what happens when we create a passwordless user? Depends on pg auth mechanism setup?


  // TODO need to await?
  // TODO NOTE WE'RE REALLY JUST CHECKING FOR PRESENCE, I think?
  // Letting the input pass through to the db, let the DB handle validity
  // NOTE WE'RE LEAVING VALIDATION TO THE DATABASE
  // TODO How can user specify an array of extensions in their .env file?
  /*await Joi.validate({
    DB_NAME: Joi.string().required(),
    DB_USER: Joi.string(),
    // Forbidden if no user?
    DB_PASSWORD: Joi.string(),
    DB_EXTENSIONS: Joi.array().items(Joi.string()).single()
    // TODO ARE WE APPROPRIATELY DEALING W/ EXTENSIONS AS ARRAY STRING?
  }, config);*/
}

module.exports = async function (options) {
  try {
    await parseEnv(options || {});
  } catch (e) {
    console.error(e);
    console.log('FUCK');
  }
};

/* Commented out b/c still figuring out how to wire together steps
(async function () {
  console.log(process.argv);
  const options = {
    path: process.env[3]
  };
  try {
    await parseEnv(options);
  } catch (e) {
    console.error(e);
    console.log('FUCK');
  }
})();*/
