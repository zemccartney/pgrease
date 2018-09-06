const { Client } = require('pg');

process.env.PGDATABASE = 'postgres';
const client = new Client();

async function connect () {


  try {
    await client.connect();
    const command = 'CREATE DATABASE $1';
    const prepared = command.replace('$1', client.escapeIdentifier('test_db'));
    console.log(prepared);
    const res = await client.query(prepared);
    console.log('DID THIS AT ALL WORK?', res);
    await client.end();
    console.log('HOLY SHIT!!');
  } catch (e) {
    console.log(e);
  }


}

connect();

/**
https://github.com/brianc/node-postgres/issues/539
Looks like you can't parameterize a CREATE DATABASE command

Looks like pg's escapeLiteral and escapeIdentifier could help?
How does this escaping work? What are we trying to achieve?
**/

/**
CREATE DATABASE {{ DB_NAME }};
CREATE ROLE {{ DB_USER }} WITH LOGIN PASSWORD '{{ DB_PASS }}';
GRANT ALL PRIVILEGES ON DATABASE {{ DB_NAME }} TO {{ DB_USER }};
(( need to connect to DB ))
CREATE EXTENSION IF NOT EXISTS citext;
**/
