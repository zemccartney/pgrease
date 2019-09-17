/*
**TOOLING**
- https://github.com/substack/tape
- https://medium.com/javascript-scene/why-i-use-tape-instead-of-mocha-so-should-you-6aa105d8eaf4
- https://medium.com/the-node-js-collection/rethinking-javascript-test-coverage-5726fb272949
// https://github.com/substack/tape/issues/381
*/

'use strict';

const Assert = require('assert').strict;
const Tape = require('tape'); // TODO Consider using tape-catch?

const ConfigureEnv = require('../lib/configure');

const fixtureDir = `${__dirname}/fixtures/configure`;
const resetEnv = () => {
  delete process.env.DB_NAME;
  delete process.env.DB_USER;
  delete process.env.DB_PASSWORD;
  delete process.env.DB_EXTENSIONS;
};


/**

ASSUME ALL TESTS ARE RUN FROM THE PROJECT'S ROOT
TODO Is this true?
**/

Tape('Fails if non-object is supplied as db configuration', async (t) => {
  await Assert.rejects(
    ConfigureEnv('nonobject'),
    {
      code: 'ERR_ASSERTION',
      message: 'database configuration must be an object'
    }
  );
  t.pass('correct error');
  t.end();
});

Tape('Fails if object of invalid type e.g. null or array is supplied as db configuration', async (t) => {
  await Assert.rejects(
    ConfigureEnv([]),
    {
      code: 'ERR_ASSERTION',
      message: 'database configuration must be an object'
    }
  );
  t.pass('correct error');
  t.end();
});

Tape('Fails if no configuration is provided', async (t) => {
  await Assert.rejects(
    ConfigureEnv(),
    {
      name: 'ConfigurationError',
      message: 'You must specify at least a database name (DB_NAME)'
    }
  );
  t.pass('correct error');
  t.end();
});

Tape('Succeeds if minimum necessary configuration is provided', async (t) => {
  // Simulates setting via CLI arg
  process.env.DB_NAME = 'test';
  await ConfigureEnv();
  t.equal(process.env.DB_NAME, 'test');
  resetEnv();
  t.end();
});

Tape('Succeeds when sufficient configuration provided via database configuration argument argument', async (t) => {
  await ConfigureEnv({ DB_NAME: 'dbcnf' });
  t.equal(process.env.DB_NAME, 'dbcnf');
  resetEnv();
  t.end();
});

Tape('Pre-set configuration isn\'t overwritten by database configuration argument', async (t) => {
  process.env.DB_NAME = 'gansett';
  process.env.DB_USER = 'usr';
  await ConfigureEnv({ DB_NAME: 'dbcnf', DB_USER: 'loser' });
  t.equal(process.env.DB_NAME, 'gansett');
  t.equal(process.env.DB_USER, 'usr');
  resetEnv();
  t.end();
});

Tape('Fails if database configuration argument does NOT provide sufficient configuration', async (t) => {
  await Assert.rejects(
    ConfigureEnv({ DB_USER: 'cone', DB_PASSWORD: 'post' }),
    {
      name: 'ConfigurationError',
      message: 'You must specify at least a database name (DB_NAME)'
    }
  );
  t.pass('correct error');
  t.end();
});

Tape('Ignores unknown configuration vars from database configuration argument', async (t) => {
  await ConfigureEnv({ DB_NAME: 'known', DB_MERFOLK: 'test' });
  t.equal(process.env.DB_NAME, 'known');
  t.equal(process.env.DB_MERFOLK, undefined);
  resetEnv();
  t.end();
});

Tape('Accepts all known configuration vars from database configuration argument', async (t) => {
  await ConfigureEnv({
    DB_NAME: 'nombre',
    DB_USER: 'usr',
    DB_PASSWORD: 'goldbug',
    DB_EXTENSIONS: 'free,real,estate'
  });
  t.equal(process.env.DB_NAME, 'nombre');
  t.equal(process.env.DB_USER, 'usr');
  t.equal(process.env.DB_PASSWORD, 'goldbug');
  t.equal(process.env.DB_EXTENSIONS, 'free,real,estate');
  resetEnv();
  t.end();
});

Tape('Can combine database configuration argument and pre-set vars to complete configuration', async (t) => {
  process.env.DB_USER = 'user';
  process.env.DB_PASSWORD = 'sasquatch';
  await ConfigureEnv({ DB_NAME: 'complete' });
  t.equal(process.env.DB_NAME, 'complete');
  t.equal(process.env.DB_USER, 'user');
  t.equal(process.env.DB_PASSWORD, 'sasquatch');
  resetEnv();
  t.end();
});

Tape('Derives configuration from a .env file using an absolute path', async (t) => {
  await ConfigureEnv(null, __dirname);
  t.equal(process.env.DB_NAME, 'first_test');
  t.equal(process.env.DB_USER, 'postcone_jones');
  t.equal(process.env.DB_PASSWORD, 'testing');
  t.equal(process.env.DB_EXTENSIONS, 'citext');
  resetEnv();
  t.end();
});

Tape('Derives configuration from a .env file using a relative path', async (t) => {
  await ConfigureEnv(null, './test');
  t.equal(process.env.DB_NAME, 'first_test');
  t.equal(process.env.DB_USER, 'postcone_jones');
  t.equal(process.env.DB_PASSWORD, 'testing');
  t.equal(process.env.DB_EXTENSIONS, 'citext');
  resetEnv();
  t.end();
});

Tape('Fails when a non-string is provided for .env file path', async (t) => {
  await Assert.rejects(
    ConfigureEnv(null, 5),
    {
      code: 'ERR_ASSERTION',
      message: 'config file path must be a string'
    }
  );
  t.pass('correct error');
  t.end();
});

Tape('Fails when .env file is not found', async (t) => {
  await Assert.rejects(
    ConfigureEnv(null, `${fixtureDir}/non-existent`),
    {
      name: 'ConfigurationError',
      message: `.env file not found at ${`${fixtureDir}/non-existent`}`
    }
  );
  t.pass('correct error');
  t.end();
});

// TODO File is non-VC-able with limited perms
// How can we modify perms in test? (need sudo?)
// OR: Lazy, just leave maintenance note
Tape('Fails when .env file is found, but not read-permitted', async (t) => {
  await Assert.rejects(
    ConfigureEnv(null, `${fixtureDir}/perms`),
    {
      name: 'ConfigurationError',
      message: `.env file found at ${`${fixtureDir}/perms`}, but insufficient permissions (pgrease requires read access)`
    }
  );
  t.pass('correct error');
  t.end();
});

Tape('Fails when .env file is found, but is empty', async (t) => {
  await Assert.rejects(
    ConfigureEnv(null, `${fixtureDir}/empty`),
    {
      name: 'ConfigurationError',
      message: `.env file found at ${`${fixtureDir}/empty`} is empty`
    }
  );
  t.pass('correct error');
  t.end();
});

Tape('Fails when a valid and accessible .env file provides insufficient configuration', async (t) => {
  await Assert.rejects(
    ConfigureEnv(null, `${fixtureDir}/incomplete`),
    {
      name: 'ConfigurationError',
      message: 'You must specify at least a database name (DB_NAME)'
    }
  );
  t.pass('correct error');
  resetEnv();
  t.end();
});

Tape('Ignores unknown variables in .env file', async (t) => {
  await ConfigureEnv(null, `${fixtureDir}/unknown`);
  t.equal(process.env.DB_NAME, 'unknown');
  t.equal(process.env.DB_USER, 'uk');
  t.equal(process.env.API_KEY, undefined);
  resetEnv();
  t.end();
});

Tape('Directly-set env vars (e.g. CLI) take precedence over ones from .env file', async (t) => {
  process.env.DB_NAME = 'it';
  await ConfigureEnv(null, __dirname);
  t.equal(process.env.DB_NAME, 'it');
  t.equal(process.env.DB_USER, 'postcone_jones');
  t.equal(process.env.DB_PASSWORD, 'testing');
  t.equal(process.env.DB_EXTENSIONS, 'citext');
  resetEnv();
  t.end();
});

Tape('env vars from database configuration argument take precedence over ones from .env file', async (t) => {
  await ConfigureEnv({ DB_NAME: 'conf', DB_EXTENSIONS: 'citext,hstore' }, __dirname);
  t.equal(process.env.DB_NAME, 'conf');
  t.equal(process.env.DB_USER, 'postcone_jones');
  t.equal(process.env.DB_PASSWORD, 'testing');
  t.equal(process.env.DB_EXTENSIONS, 'citext,hstore');
  resetEnv();
  t.end();
});

Tape('Accepts configuration from all three sources at once (direct, database configuration argument, .env file)', async (t) => {
  process.env.DB_USER = 'test';
  process.env.DB_PASSWORD = 'slonik';
  await ConfigureEnv({ DB_NAME: 'pasta', DB_PASSWORD: 'horrorshow' }, __dirname);
  t.equal(process.env.DB_NAME, 'pasta');
  t.equal(process.env.DB_USER, 'test');
  t.equal(process.env.DB_PASSWORD, 'slonik');
  t.equal(process.env.DB_EXTENSIONS, 'citext');
  resetEnv();
  t.end();
});

// TODO How could we simulate system out of memory? Or insufficient file descriptors?
// Or anything else that could cause our file read to fail?
// TODO HOW DO WE SIMULATE THROWING AN UNKNOWN ERROR W/IN TRY/CATCH BLOCK?
// TODO Write a tap parser to work w/ c8's output, too?
// https://github.com/substack/faucet
