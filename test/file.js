/*
**TOOLING**
- https://github.com/airbnb/javascript
   - https://www.npmjs.com/package/eslint-config-airbnb-base
- https://github.com/substack/tape
    - https://medium.com/javascript-scene/why-i-use-tape-instead-of-mocha-so-should-you-6aa105d8eaf4
- https://medium.com/the-node-js-collection/rethinking-javascript-test-coverage-5726fb272949
*/

// Translates a properly formatted .env file into environment variables
// Reads an .env file from a specific path

// OPERATIONAL ERRORS
// Crashes and informs the user if
    // they supply an invalid path
    // no .env file is found
        // in default
        // at specific address
    // user has insufficient permission to read the file
    // read file would overflow available memory?
    // TODO Should we block overwriting an env vars?

'use strict';

const Tape = require('tape');
const FileModule = require('../file');

// https://github.com/substack/tape/issues/381
Tape('Translates a properly formatted .env file into environment variables', async (t) => {
  t.plan(4);

  // TODO Which file's being read?
  await FileModule();
  t.equal(process.env.DB_NAME, 'test');
  t.equal(process.env.DB_USER, 'test');
  t.equal(process.env.DB_PASSWORD, 'test');
  t.equal(process.env.DB_EXTENSION, 'citext');
});

Tape('Reads .env file from specified path', async (t) => {
  t.plan(4);

  await FileModule({ path: __dirname });

  t.equal(process.env.DB_NAME, 'first_test');
  t.equal(process.env.DB_USER, 'postcone_jones');
  t.equal(process.env.DB_PASSWORD, 'testing');
  t.equal(process.env.DB_EXTENSION, 'citext');
});

// TODO Write a tap parser to work w/ c8's output, too?
// https://github.com/substack/faucet
