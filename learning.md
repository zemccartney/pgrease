- [] What are parameterized queries? How do they work? What problems do they solve?
- [] What's the difference between users and roles?
- [] What is the postgres default database?
- [] How does templating work in Postgres? Would that be useful to us?
- [] How does node-pg work?




## Resources

https://stackoverflow.com/questions/4892166/how-does-sqlparameter-prevent-sql-injection
https://www.postgresql.org/docs/9.3/static/sql-syntax-lexical.html
http://www.lavamunky.com/2011/11/why-parameterized-queries-stop-sql.html
https://stackoverflow.com/questions/2901453/sql-standard-to-escape-column-names
******** https://www.linuxtopia.org/online_books/database_guides/Practical_PostgreSQL_database/PostgreSQL_x1428_003.htm
https://www.postgresql.org/docs/10/static/functions-string.html (see quote_ident)
https://nandovieira.com/using-insensitive-case-columns-in-postgresql-with-citext
(Reread; what are extensions? where do they come from?
  how are they scoped?
  What is WITH SCHEMA public)

  https://stackoverflow.com/questions/12986368/installing-postgresql-extension-to-all-schemas
  (What are postgres schemas? How do they work? How do they affect database behavior?)

https://developer.atlassian.com/blog/2015/11/scripting-with-node/


https://infinitered.github.io/gluegun/#/
https://github.com/conventional-changelog/standard-version
https://www.conventionalcommits.org/en/v1.0.0-beta.2/
https://github.com/bcoe/c8
https://blog.npmjs.org/post/178487845610/rethinking-javascript-test-coverage



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
