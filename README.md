# UNDER CONSTRUCTION — THIS LIBRARY IS NOT YET AVAILABLE, STILL VERY MUCH A WORK IN PROGRESS

# Introduction

A CLI utility for setting up and configuring a postgres database based on
a .env file

## How it Works

In your terminal, when you run

```js
pgrease
```

<!--
My envisioned use-case:

- Run this tool as post install routine or manually after pulling
down pal repo and setting configuration in environment

Automates a manual, somewhat esoteric / infrequently completed enough
so that it's tricky to remember step in installation. Hopefully reduces
cognitive load of setting up a project

Known issues:
- authorization / permission: attempting to connect PG
-->

The module will:

<!-- TODO NO! WE'RE NOT PARSING INTO ENV, JUST PARSING INTO AN OBJECT. ANY ISSUE WITH THAT? -->
1. Look for a .env file in the current working directory and parse the values found therein into process.env (see dotenv) <!-- TODO LINK TO DOTENV -->
2. Check for and configure itself with values it understands
3. Display a prompt previewing the actions it intends to take given the supplied configuration
4. On receiving your ok, execute those queries

`pgrease` currently runs the following queries

<!-- TODO Fix this documentation -->
1. `CREATE DATABASE`
2. `CREATE ROLE WITH LOGIN PASSWORD`
3. `GRANT ALL PRIVILEGES TO ROLE ON DB`
4. `CREATE EXTENSION` (run in the newly created DB)

In the end, whatever postgres initialization gruntwork your deployment requires should
be complete.

## Known Configuration Variables

### Connection configuration

<!-- TODO How do we handle Connection URI? Our own, consistently named, env var? -->

To connect to your postgres instance, `pgrease` interfaces directly with `pg`
(specifically, it's `Client` class). Our usage of `pg` thus makes use of any of the environment variables `pg` supports that `pgrease` finds at runtime

To configure how `pgrease` connects to your Postgres instance,
follow `pg`'s naming convention and defaults for connection-specific
environment variables (the below is copied from here: https://node-postgres.com/features/connecting)

```sh
PGHOST='localhost'
PGUSER=process.env.USER
PGDATABASE=process.env.USER
PGPASSWORD=null
PGPORT=5432
```

To override any of those defaults, provide values for those variables, either on
the command line or in your `.env` file:

```sh
PGDATABASE=postgres pgrease
```

### Database Configuration

`pgrease` uses the following naming convention for the environment variables
it checks for to configure the queries it runs.

```sh
DB_NAME
DB_USER
DB_PASSWORD
DB_EXTENSIONS
```

`DB_NAME` and `DB_USER` are required `DB_EXTENSIONS` is optional.
There are no default values.

`DB_EXTENSIONS` accepts a string or array of strings naming Postgres extensions
All other values accept strings that following Postgres' rules for naming the referenced resources
<!-- TODO Are there actually rules for those values? What are they? Where are they documented? -->


## Flags

--dry-run -d — preview the db operations the tool will perform based on the supplied configuration
without actually performing those operations

--prompt -p — displays the same preview as dry-run with an accompanying prompt to proceed or exit
Overridden by dry-run when both are supplied

--env -e — custom path to an env file
