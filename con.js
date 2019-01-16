'use strict';

const { Client } = require('pg');




/*
DEFAULT STATE
PGHOST='localhost'
PGUSER=process.env.USER
PGDATABASE=process.env.USER
PGPASSWORD=null
PGPORT=5432


I want to be consistent with this configuration convention....I think
Do we want to use programmatic configuration or environmental?


Allow user to override or, by doing nothing, accept all of those defaults
*/


async function connect () {

  // This works, other environmental config defaults apply
  // despite partial programmatic config
  const client = new Client({
    database: 'postgres'
  });

  try {
    await client.connect();
    const text = 'CREATE DATABASE $1';
    const values = ['first_test'];

    //client.on('drain', client.end.bind(client)); //auto disconnect client after last query ends
    //await client.query('CREATE DATABASE first_test')
    await client.end();
    await client.end();
  } catch (e) {
    console.log(e);
  }

  console.log("complete");
}

connect();

/*
Process hangs if client remains open..I think?
*/


/*1. connect
2. parse and validate input (all required vals in place)
3. formulate commands (no prompt yet, but prepare in such a way that they could be stored and prompted)
4. execute*/
