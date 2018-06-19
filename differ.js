// Import external libs 
const diff = require('deep-object-diff'),
    colors = require('colors');


// Define parameter array
const [leftDiffLoc, rightDiffLoc, parseLocation, key, treatmentLogic] = process.argv.splice(2);
const fs = require('fs'), path = require('path');

let treatment;
if (treatmentLogic) {
    try {
        treatment = require('./treatment')[treatmentLogic];
    } catch (err) {
        console.error("Treatment logic was defined, but handler could not be found");
    }
}

// Isolate the required criteria (for future support more than one criteria)
let leftFile = JSON.parse(fs.readFileSync(path.resolve(leftDiffLoc))),
    rightFile = JSON.parse(fs.readFileSync(path.resolve(rightDiffLoc)));

const objPath = parseLocation.split(".");

objPath.forEach(path => {
    leftFile = leftFile[path];
    rightFile = rightFile[path];
})

const criteria = key.split('|');

console.log(` 
---------------------------------------- 
Evaluating: 
${leftFile.length} entries on left file 
${rightFile.length} entries on right file
Difference of ${leftFile.length - rightFile.length} entries
----------------------------------------`.gray);




// Do a left to right comparison 
leftFile.forEach((target, i) => {
    if (treatmentLogic) target = treatment(target);
    const combinedKey = getName(target);
    checkNoRepeat(target, i, leftFile, combinedKey);

    // Find the match in the right file 
    const found = rightFile.find(element => {
        const match = matchesAllCriteria(target, element, combinedKey);
        if (match) return true;
    });


    if (found) {
        const { added, deleted, updated } = diff.detailedDiff(target, found);
        if (Object.keys(added).length + Object.keys(deleted).length + Object.keys(updated).length === 0) return;
        console.log(`Found diff for combined key ${combinedKey.join("|")}`.gray.bold)
        console.log(standardModify(added).green);
        console.log(standardModify(deleted).red);
        console.log(standardModify(updated).yellow);
    } else {
        console.log(` Missing entry for combined key ${combinedKey.join("|")} in ${rightDiffLoc} `.bgRed);
    }
})


// Do a right to left comparison to make sure there are no missing files 
rightFile.forEach((target, i) => {
    const combinedKey = getName(target);
    checkNoRepeat(target, i, rightFile, combinedKey);
    const found = leftFile.find(element => {
        const match = matchesAllCriteria(target, element, combinedKey);
        if (match) return true;
    });

    if (found) return;
    console.log(` Missing entry for combined key ${combinedKey.join("|")} in ${leftDiffLoc} `.bgRed);
})





function fillUndefined(target) {
    Object.keys(target).forEach(entry => {
        if (!target[entry]) target[entry] = 'deleted';
    });

    return target;
}

function standardModify(target) {
    target = fillUndefined(target);
    return (Object.keys(target).length === 0) ? '' : JSON.stringify(target, null, 2)
}

function checkNoRepeat(target, i, file, combinedKey) {
    // Ensure there is no repeats of this API within the same file by iterating downwards from the current location 
    // Use target as current iterator, i as current location, file as comparison file 
    for (let j = i + 1; j < file.length; j++) {
        const item = file[j];
        const match = matchesAllCriteria(target, item);
        if (match) console.log(` Found repeat for combined key ${combinedKey.join("|")} `.bgRed)
    }
}

function matchesAllCriteria(target, item, combinedKey) {
    const notMatch = criteria.some(marker => {
        const val = target[marker];
        if (!val) console.log(` The combined key ${combinedKey.join("|")} had undefined criteria `.bgRed);
        return target[marker] !== item[marker];
    });

    return !notMatch;
}




function getName(target) {
    const combinedKey = [];

    criteria.forEach(marker => {
        combinedKey.push(target[marker]);
    });

    return combinedKey;
}
