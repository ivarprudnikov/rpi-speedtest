#!/usr/bin/env node
const util = require('util');
require('../')({ raw: true, send: true })
  .then((success) => {
    console.log('ok', util.inspect(success));
    process.exit(0);
  })
  .catch((error) => {
    console.error('error', util.inspect(error));
    process.exit(1);
  });
