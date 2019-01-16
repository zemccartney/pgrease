- [] clean up all questions and TODOs
- [] write down understanding of how things work, especially re: connection auth
- [] add linting
- [] add tests and code coverage (c8)
- [] clean up package.json
- [] license / OSS release stuff
- [] Consider using / vendoring this? https://github.com/131/sql-template
- [] Read docs for PG commands; what other options should we support?
- [] HOW DO WE HANDLE CONNECTING TO A PASSWORD PROTECTED DB?????
    - By passing in the DB password...How can we do this securely?
        - By telling people how to use node-pg's defaults in tandem
    - See createdb https://www.tutorialspoint.com/postgresql/postgresql_create_database.htm

TESTS
- What happens when we run any of these steps with the resources already created?



Hmmm......Does this need to be transactional? I don't think it
can be, at least not fully because we need to change our connection part-way through...
https://stackoverflow.com/questions/10335561/use-database-name-command-in-postgresql
Come back to transactional later
