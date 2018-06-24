'use strict';

const fillUndefined = (target) => {
  Object.keys(target).forEach((entry) => {
    if (!target[entry]) target[entry] = 'deleted';
  });

  return target;
};

const matchesAllCriteria = (target, item, criteria) => !criteria.some(marker => target[marker] !== item[marker]);

const checkNoRepeat = (target, i, file, criteria) => {
  // Iterate downards from the current location to discover duplicates
  // Use target as current iterator, i as current location, file as comparison file
  for (let j = i + 1; j < file.length; j++) {
    const item = file[j];
    const match = matchesAllCriteria(target, item, criteria);
    if (match) return true;
  }
};

const getName = (target, criteria) => {
  const combinedKey = [];

  const wasUndefined = criteria.some((marker) => {
    if (target[marker] === undefined) {
      return true;
    }
    combinedKey.push(target[marker]);
  });

  if (wasUndefined) return undefined;
  return combinedKey;
};

module.exports = {
  fillUndefined, matchesAllCriteria, checkNoRepeat, getName,
};
