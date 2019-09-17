// Can create a database

// Succeeds if only creating a database and that database already exists
// current state and target state match

// Fails if connection user has insufficient perms to create a database

// Fails if connection user has insufficient perms to add extensions

// Fails if trying to extend a database that already exists

// Fails if creating an application user if unable to create the database (already exists)

// Can create and extend a database

// Can create a database and create an application user for interacting with that database

// Can create and extend a database and create its application user

// Fails if local postgres server isn't running

// Fails if can't connect due to invalid host
// If invalid port
// If server not listening on port
// If server not available at that host...
// TODO allow overriding host? Or enforce localhost for right now?

// Fails if can't connect to local postgres server due to failed authentation
//    Invalid PW
//    omitted pw
//    Non-existent user

// Can configure postgres server connection via env vars

// Fails, rolling back database creation, if database user already exists

// Fails if insufficient permissions to create a user
// '' to alter a user (are these different permissions?)

// TODO FOR THESE TESTS, HOW WOULD A USER CAUSE THESE?
// Fails if invalid database name provided

// Fails if invalid password value provided

// Fails if invalid username provided

// Fails if invalid extension values provided

// Fails if extension requested not found

// Connection configuration uses node-pg defaults, except for our db override

// What if no DB password? Succeeds/fails depending on server's auth requirements?
