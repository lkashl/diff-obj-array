'use strict';

const fs = require('fs'),
  path = require('path');

const diff = require('deep-object-diff');

const {
    checkNoRepeat, getName, matchesAllCriteria,
  } = require('./util'),
  treatmentLib = require('./treatment');

const handleRepeat = (repeated, combinedKey, results) => {
  if (repeated) results.push({
    key: combinedKey,
    type: 'repeated',
  });
};

const validateCombinedKey = (combinedKey, item, results, file) => {
  if (combinedKey === undefined) {
    results.push({
      type: 'invalidKey',
      file,
      details: item,
    });
    return false;
  }
  return true;
};

module.exports = (leftDiffLoc, rightDiffLoc, parseLocation, key, treatmentLogic) => {
  const results = [];

  const criteria = key.split('.'),
    objPath = parseLocation.split('.');

  let treatment;
  if (treatmentLogic) try {
    treatment = treatmentLib[treatmentLogic];
    if (!treatment) throw new Error('Function does not exist');
  } catch (err) {
    throw new Error('Treatment logic was defined, but handler could not be found');
  }

  let leftFile = JSON.parse(fs.readFileSync(path.resolve(leftDiffLoc))),
    rightFile = JSON.parse(fs.readFileSync(path.resolve(rightDiffLoc)));

  if (parseLocation !== '.') objPath.forEach((ipath) => {
    leftFile = leftFile[ipath];
    rightFile = rightFile[ipath];
  });

  // Do a left to right comparison
  leftFile.forEach((target, i) => {
    if (treatmentLogic) target = treatment(target);
    const combinedKey = getName(target, criteria);
    if (!validateCombinedKey(combinedKey, target, results, 'leftFile')) return;
    handleRepeat(checkNoRepeat(target, i, leftFile, criteria), combinedKey, results);

    // Find the match in the right file
    const found = rightFile.find((element) => {
      const match = matchesAllCriteria(target, element, criteria);
      if (match) return true;
      return false;
    });


    if (found) {
      const { added, deleted, updated } = diff.detailedDiff(target, found);
      if (Object.keys(added).length
          + Object.keys(deleted).length
          + Object.keys(updated).length === 0) return;

      results.push({
        key: combinedKey,
        type: 'diffs',
        details: {
          added,
          updated,
          deleted,
        },
      });
    } else {
      results.push({ key: combinedKey, type: 'missing' });
    }
  });

  // Do a right to left comparison to make sure there are no missing files
  rightFile.forEach((target, i) => {
    const combinedKey = getName(target, criteria);
    if (!validateCombinedKey(combinedKey, target, results, 'rightFile')) return;
    handleRepeat(checkNoRepeat(target, i, rightFile, criteria), combinedKey, results);

    const found = leftFile.find((element) => {
      const match = matchesAllCriteria(target, element, criteria);
      if (match) return true;
      return false;
    });

    if (found) return;
    results.push({ key: combinedKey, type: 'missing' });
  });

  return results;
};
