# Introduction

A CLI utility for setting up and configuring a postgres database based on
a .env file

## How it Works

In your terminal, when you run

```js
pgrease
```

The module will:

1. Look for a .env file in the current working directory
2. Parse that .env file into an object
3. Check for and configure itself with values it understands
4. Display a prompt previewing the actions it intends to take given the supplied configuration
5. Execute some arbitrary set of queries based on the supplied configuration

In the end, whatever postgres initialization gruntwork your deployment requires should
be complete.

## Known Configuration Variables

- **DB_NAME**
- **DB_USER**
- **DB_PASSWORD**
- **DB_EXTENSIONS**

## Flags

--dry-run -d — preview the db operations the tool will perform based on the supplied configuration
without actually performing those operations

--prompt -p — displays the same preview as dry-run with an accompanying prompt to proceed or exit
Overridden by dry-run when both are supplied

--env -e — custom path to an env file
