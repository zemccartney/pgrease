# pgrease

A CLI utility for automatically setting up the database resources described in
a deployment's environment `.env` file (the source of its environmental configuration)

## Introduction

- [The 12 Factor App Methodology](https://12factor.net/config) for developing web applications recommends storing your application's configuration variables in the environment
- One way to load configuration into the environment is from a file. Conventionally,
a .env file is used for this purpose e.g. https://github.com/motdotla/dotenv
- For database-backed projects, we'd need to configure a database connection,
so database connection variables would appear in our `.env` file

So, in our `.env` file, we've described a contract with our database, but, on setting up
a new deployment of our app, we'd expect that whatever database system we're using is
not setup with the resources to honor that contract and we'd need to take some manual steps
to setup those resources.

Leveraging this situation, `pgrease` derives from that connection configuration
and then runs the `SQL` commands to prepare your deployment's
database resources, cleaning up after itself if any of the commands fail.

<!-- TODO Though note it does NOT clean up if no exists yet -->

## Usage

Assuming:

- access to a running PostgreSQL server
- `.env` file in your working directory (though can be located anywhere, see "Options")
in some way following the naming conventions described below

```sh
# Install is optional
# Useful if you'd like to run pgrease via npm script instead of npx
npm install pgrease # or -g
npx pgrease

# Or, with global install
npm install -g pgrease
pgrease
```

If all went well, then your application can now connect to the database described
in its configuration.

<!-- TODO NOTE THAT PGREASE IS ASYNC -->

## Options

## How it Works

## .env File Conventions
