https://12factor.net/config
https://blog.doismellburning.co.uk/twelve-factor-config-misunderstandings-and-advice/
https://nodejs.org/api/errors.html

****
https://www.joyent.com/node-js/production/design/errors#fnref1:4
https://www.joyent.com/node-js/production/debug#postmortem
https://en.wikipedia.org/wiki/Assertion_%28software_development%29#Comparison_with_error_handling
https://flaviocopes.com/node-exceptions/
https://github.com/hapijs/bounce
https://medium.com/the-node-js-collection/node-js-errors-changes-you-need-to-know-about-dc8c82417f65


https://stackoverflow.com/questions/12752622/require-file-as-string


**** PG ******
https://stackoverflow.com/questions/1348126/modify-owner-on-all-tables-simultaneously-in-postgresql
https://serverfault.com/questions/198002/postgresql-what-does-grant-all-privileges-on-database-do
https://stackoverflow.com/questions/39735141/how-to-check-connected-user-on-psql

https://www.postgresql.org/docs/9.6/preface.html
https://www.postgresql.org/docs/9.6/sql-createdatabase.html
https://www.postgresql.org/docs/9.6/sql-createrole.html
https://www.postgresql.org/docs/9.6/manage-ag-templatedbs.html
https://www.postgresql.org/docs/9.6/sql-alterdatabase.html
https://www.postgresql.org/docs/9.6/sql-createtablespace.html
https://stackoverflow.com/questions/5758499/double-colon-notation-in-sql
https://www.postgresql.org/docs/9.6/user-manag.html
https://blog.dbi-services.com/what-the-hell-are-these-template0-and-template1-databases-in-postgresql/
******

https://dassur.ma/things/regexp-quote/

// TOOLING

https://github.com/bcoe/c8
https://github.com/nearform/sql // WOULD THIS BE HELPFUL FOR WRITING COMMANDS?
https://github.com/cjihrig/belly-button // WAY TO INCLUDE AS DEP, BUT
// ON COMMAND, VENDOR IN LATEST CONFIG TO ALLOW IDE LINTING?
// CREATE IDE PLUGIN TO AUTOMATE BELLY-BUTTON LINTING
  // Pay Colin
  // TODO Review belly-button's rules

// TODOs
- [ ] Finalize commands
- [ ] Finalize and write down / comment your understanding of connection / auth method problem
- [ ] Write down test cases, try to anticipate operational errors, other weird things
(this is specifying your work) (quick pass; will inform by implementation research  )
- [ ] What's up w/ hashing? https://www.meetspaceapp.com/2016/04/12/passwords-postgresql-pgcrypto.html
- [ ] "^6.1.0" vs. "6.x.x" ; what's the difference in semver?
- [ ] Try running npm pgrease w/ inspector? (see lab's inspector option)
- [ ] // TODO Why the exports = module.exports assignment pattern?
- [ ] Make sure your routinely checking and updating deps...add a david commit hook?
- [ ] What's the eslintcache file from belly-button?
- [ ] Doc in README: only env vars for configuring pg connection
