#!/usr/bin/env node
'use strict';

const Pkg = require('../package.json');

// TODO How does this look rendered to console?
const programmerErrorMessage = `
  pgrease **BUG**: An unexpected error! This is probably a bug.
  Please leave an issue for the maintainer (${Pkg.author}) at
  ${Pkg.repository}. Include as much information as you can about
  how you triggered the bug. Consider reproducing the bug with
  PGREASE_VERBOSE set in your environment e.g. PGREASE_VERBOSE=1 pgrease.
  This will log the raw error and produce a core file. Thanks for trying
  pgrease and sorry for the inconvenience!
`;

// TODO What happens when you don't await an async function?
// Same as then'ing a promise w/o returning?
require('../lib/cli').run();// TODO Is this the right event?
process.on('unhandledPromiseRejection', (rej) => {
  if (process.env.PGREASE_VERBOSE) {
    console.log('pgrease **BUG** (verbose mode)');
    console.error(rej);
    process.abort();
  }

  console.error(programmerErrorMessage);
  process.exit(1);
});
