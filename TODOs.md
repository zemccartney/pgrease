IDEAS
- CREATE DATABASE WITH OWNER???
- See discussion w/ Bill below
- Allow pgrease to work with a dump file???? i.e. -f option to psql
    - Would the mechanism in that case be spawning a child process vs. interacting
    w/ node-pg??? Yea, I think so...
    - https://www.postgresql.org/docs/9.3/app-psql.html
    - Not a dump file for creating the database, but inserting data?
    What's best practice here? Recommended to not dump with Roles, Ownership, etc. depend on your new environment for creating those roles? That's relevant when extracting a single DB from a shared host
    When moving an entire DB, fine to dump everything, move it all over? Review BRS knowledge base on moving from 01 to 02, what we did there re: SQL dumping

1. Read up on CREATE DATABASE WITH OWNER vs. GRANT ALL (privileges in pg)
2. Write down learnings (start journaling about development)
3. Review CREATE USER / ROLE command....what are the options there? How does that work?
4. Research options for all commands!!!!
5. Try to find time to learn PG more deeply (and DBA in general)
6. Relevant? https://www.manniwood.com/postgresql_and_bash_stuff/
SCOPE
- Make it useful to you and tested, then release
- Document roadmap
- See if it's useful to anyone else, including people at BRS
- Document known / potential issues



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
can be, at least not fully, because we need to change our connection part-way through...
https://stackoverflow.com/questions/10335561/use-database-name-command-in-postgresql
Come back to transactional later


## Discussion with Bill

Bill Woodruff [10:12 AM]
Got a request for `pgrease` — could we make it so you can run pgrease in an 'ensurance' way  so it checks to see if stuff exists, then creates it or does whatever it needs to do, the point being that you can run pgrease over a config a hundred times and things are just fine


Zack McCartney [10:13 AM]
:heart:
hmm…yea, probably? I’ll have to think about how that’d work… I’d be concerned about that checking being incomplete and accidentally overwriting settings `pgrease` didn’t account for e.g. if the table were originally created with some settings not input to `pgrease`…
and creating the user would go out the window unless we’re cool with resetting the user’s password… or could just not change the password and inform the user that their env pw was ignored (I assume postgres stores passwords in a way that we couldn’t access them, but I’m actually not sure at all about that)

uhhhh yea, I’ll give it a think, but that’s a cool challenge. :pray: (edited)

Bill Woodruff [10:19 AM]
Cool, yeah it'll be tough to do that in a safe way in case part of the setup was created before pgrease was run — lemme know if you get around to it, I think that feature would make it a pretty good candidate to be part of a startup or setup script




################
YOU COMPLETELY MISUNDERSTOOD
Danger is that pgrease falsely reports that database is setup as the user expects
Don't throw / crash on errors.... collect and log somehow
Report to user the config they input and whether or not resources were created
If anything already existed, report as such with the disclaimer
that pgrease can't guarantee the settings with which the pre-existing resource
was created match the input i.e. user's intent to pgrease
