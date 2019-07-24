Goal:

- When I start my server, using our pal setup, schwifty/knex can establish a
database connection as we expect, using the database and user described in our env file
for that connection

- Don't care too much about generalizing this tool right now; "overfit" to pal's
setup. Quick and dirty model, get something working well enough to go into practice


Problems:

`npx pgrease`

Ok, where is our .env file?
    Where am I searching?


    ENOENT would be raised on read
    O--- Found the file ---
    X--- Can't find the file --- won't change soon, we can't do anything about that (report where you looked, absolute path)
Read the file / translate into memory / programmatic sense
  How?
  What is buffering?
    X--- Don't have permission ---

What information does that file contain?
    What information do we understand?
    How do we find that information within the file?
    What happens if we don't find anything?
      What do we consider insufficient information?
      What do we consider invalid information?
          Just missing required values? (circle back to definition of sufficiency)
          Do NOT rewrite / guess at postgres' definitions of valid syntax
          Catch those errors from the DB

Connect to our local installation of postgres — What if not found? If not running? If inaccessible?
    How do you connect to postgres without our user and database created yet?
    What are possible connection methods? (ident, PW, ssh, tunnel?)

Tranlsate information into commands to run
  What commands? What are possibilities / configurations for these commands
