# json-obj-diff

A tool to diff arrays containing JSON objects using definable criteria and extensible treatment modules. Useful for structures storing config as lists of JSON object with unique keys.

Objects will only be compared if they meet the same key criteria that you specify. For example, 'key0.key1' will identify and compare two objects where the value of key0 + key1 in Object A is the same as key0 + key1 in Object B.

If you know that one of your files has a different data structure and this is not a concern, you can convert that data structre when the object is read by creating your own function in the treatment.js file (explained below).

The library can be invoked both programatically and as a standalone CLI. Results will be presented in an array containing objects for every diff.

The presentation of objects:

``` JAVASCRIPT
{
    key: ["ARRAY"], // contains ordered list of resolved criteria,
    type: "ENUM", // diffs|repeated|missing|invalidKey, contains the type of event,
    details: {
        OBJECT: 'contains diff details if diff, or the item from which an invalidKey originated'
}
```

The invokation args:

``` JAVASCRIPT
[
 "JSON File 1", // Left file
 "JSON file 2", // Right file
 "obj path", // . delimited path to the object containing the array of objects to compare against (if your file structure is complex, otherwise just '.')
"key combination", // . delimited identifiers which concatenate to identify the object to compare against
"treatment logic", // function to reference from treatment.js 
]
```

## Programmatic invokation

``` JAVASCRIPT
const jod = require('json-obj-diff');

const diff = jod('./tests/example/file1.json', './tests/example/file2.json', 'housing.object', 'name.secondKey', 'example');

console.log(diff);

/*
[ { key: [ 'test', 'a' ],
    type: 'diffs',
    details: { added: [Object], updated: [Object], deleted: [Object] } },
  { key: [ 'testa', 'a' ],
    type: 'diffs',
    details: { added: [Object], updated: [Object], deleted: {} } },
  { key: [ 'isduplicate', 'a' ], type: 'repeated' },
  { key: [ 'missingFile1', 'a' ], type: 'missing' },
  { type: 'invalidKey',
    file: 'leftFile',
    details: { undefinedFile1: true, secondKey: 'a' } },
  { key: [ 'istwokey', 'a' ], type: 'missing' },
  { key: [ 'istwokey', 'b' ], type: 'missing' },
  { key: [ 'missingFile2', 'a' ], type: 'missing' },
  { type: 'invalidKey',
    file: 'rightFile',
    details: { undefinedFile2: false, secondKey: 'a'
} } ]
*/

```

## Standalone invokation

### Global invokation

The diff tool can be started from CLI by passing in the same args

``` bash
npm i diff-obj-array -g
```

#### Init HTTP Server

``` bash
diff-obj-array ./tests/example/file1.json ./tests/example/file2.json housing.object name.secondKey example
```

### Local invokation

In case you aren't able to install global modules you can always pull down this module and use npm start

``` bash
cd diff-obj-array
npm start ./tests/example/file1.json ./tests/example/file2.json housing.object name.secondKey example
```
