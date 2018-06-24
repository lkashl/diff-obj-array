'use strict';

module.exports.example = (target) => {
  if (target.stringInt) target.stringInt = target.stringInt.toString();
  return target;
};
