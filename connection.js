const { Client } = require('pg');

process.env.PGDATABASE = 'postgres';
const client = new Client();

async function connect () {

  try {
    await client.connect();
    const command = 'CREATE DATABASE $1';
    const prepared = command.replace('$1', client.escapeIdentifier('test_db'));
    //console.log(prepared);
    await client.query('\\\\connect test_db;');
    await client.end();

  } catch (e) {
    console.log(e);
  }

 
}

connect();
