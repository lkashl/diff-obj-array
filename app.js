#!/usr/bin/env node

'use strict';

const { log } = require('util'),
  differ = require('.');

const diffs = differ.apply(this, process.argv.splice(2));
if (diffs.length > 0) {
  log(JSON.stringify(diffs, null, 2));
} else {
  log('No diffs found');
}
