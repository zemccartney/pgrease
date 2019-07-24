// TODO WITH OWNER should be optional; if no DB_USER, then owner will default to creating user
`
CREATE DATABASE ${process.env.DB_NAME} WITH OWNER ${process.env.DB_USER} TEMPLATE template0;
CREATE ROLE ${process.env.DB_USER} LOGIN PASSWORD ${hash()} NOINHERIT;
CREATE EXTENSION IF NOT EXISTS ${ext};
`;

// TODO Experiment w/ this? https://thecodebarbarian.com/getting-started-with-async-iterators-in-node-js
// For firing off commands?

/*
- [ ] Is with OWNER right? What is ownership in Pg? database owner? or grant all privs?
    - Document drawback of this approach? Or did you just corner yourself into a weird case?
...

Ownership doesn't matter...if table owner is different, then user can't access
owner and grant all are the same...is owner to broad?
If tables in DB are created by another user, then tables owned by that user, not our own,
like when i had to run MBM migrations as pg to allow extension creation



- explain template0 ; design principle: aim for as unadorned a setup as possible,
avoid overstepping or accidentally depending on local state, create as if totally bare

- for pw encryption explanation: https://stackoverflow.com/questions/17429040/creating-user-with-encrypted-password-in-postgresql
encrypting w/ MD5  `md5${Crypto.md5(`${process.env.DB_PASSWORD}${process.env.DB_USER}`)}`
    - https://www.meetspaceapp.com/2016/04/12/passwords-postgresql-pgcrypto.html

- CREATE ROLE user LOGIN is same as CREATE USER, just more explicit
     - underlying principle; give users as few privs as possible, scope to
     the least they need to do everything asked by the application

- [ ] For CREATE ROLE, is NOINHERIT right?

- [ ] For CREATE EXTENSION, do we get back a warning when we try to create already existing?
*/
