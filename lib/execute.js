'use strict';

// What's my opinion about requirements of env file contents?
// TODO DEPENDS ON WHAT QUERIES WE ULTIMATELY WRITE...THAT'S OUR OPINION

// If no user, ignore password command, create database as connection user
// Which depends on....what?
// If no password....what happens when we create a passwordless user? Depends on pg auth mechanism setup?

// Letting the input pass through to the db, let the DB handle validity
// NOTE WE'RE LEAVING VALIDATION TO THE DATABASE

const Assert = require('assert').strict;
const Postgres = require('pg');

const escapeIdentifier = (new Postgres.Client()).escapeIdentifier;
const escapeLiteral = (new Postgres.Client()).escapeLiteral;

module.exports = async () => {
  // Shouldn't be possible to satisfy this condition; configure module
  // , which we run before this, fails if process.env.DB_NAME isn't set
  Assert(process.env.DB_NAME, 'you must provide a database name');

  const client = new Postgres.Client({
    database: process.env.PG_DATABASE || 'postgres'
  });
  await client.connect();
};
