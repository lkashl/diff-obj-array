'use strict';

const differ = require('..');

const results = differ('./tests/example/file1.json', './tests/example/file2.json', 'housing.object', 'name', 'example');

it('Item 0 contains results for missing, updated and deleted entries', () => {
  const entry = results[0];
  expect(entry.key[0]).toBe('test');
  expect(entry.type).toBe('diffs');
  expect(entry.details.added.intt).toBe(123);
  expect(Object.keys(entry.details.updated).length).toBe(0);
  expect(entry.details.deleted.int).toBe(undefined);
});

it('Item 1 contains results for missing, updated and deleted entries', () => {
  const entry = results[1];
  expect(entry.key[0]).toBe('testa');
  expect(entry.type).toBe('diffs');
  expect(entry.details.added.arr['1']).toBe(2);
});

it('Item 2 contains results for missing, updated and deleted entries', () => {
  const entry = results[2];
  expect(entry.key[0]).toBe('isduplicate');
  expect(entry.type).toBe('repeated');
});

it('Item 3 contains results for missing, updated and deleted entries', () => {
  const entry = results[3];
  expect(entry.key[0]).toBe('missingFile1');
  expect(entry.type).toBe('missing');
});

it('Item 4 contains results for missing, updated and deleted entries', () => {
  const entry = results[4];
  expect(entry.type).toBe('invalidKey');
  expect(entry.details.undefinedFile1).toBe(true);
});

it('Item 5 contains results for missing, updated and deleted entries', () => {
  const entry = results[5];
  expect(entry.key[0]).toBe('istwokey');
  expect(entry.type).toBe('repeated');
});

it('Item 6 contains results for missing, updated and deleted entries', () => {
  const entry = results[6];
  expect(entry.key[0]).toBe('istwokey');
  expect(entry.type).toBe('missing');
});

it('Item 7 contains results for missing, updated and deleted entries', () => {
  const entry = results[7];
  expect(entry.key[0]).toBe('istwokey');
  expect(entry.type).toBe('missing');
});

it('Item 8 contains results for missing, updated and deleted entries', () => {
  const entry = results[8];
  expect(entry.key[0]).toBe('missingFile2');
  expect(entry.type).toBe('missing');
});

it('Item 9 contains results for missing, updated and deleted entries', () => {
  const entry = results[9];
  expect(entry.type).toBe('invalidKey');
  expect(entry.details.undefinedFile2).toBe(false);
});

const nodiffs = differ('./tests/example/file0.json', './tests/example/file0.json', 'housing.object', 'name');

it('Contains no diffs when there are no diffs', () => {
  expect(nodiffs.length).toBe(0);
});

it('Will throw error if treatment does not exist', () => {
  try {
    differ('./tests/example/file0.json', './tests/example/file0.json', 'housing.object', 'name', 'doesnotexist');
  } catch (err) {
    expect(err.message).toBe('Treatment logic was defined, but handler could not be found');
  }
});

const secondKey = differ('./tests/example/file1.json', './tests/example/file2.json', 'housing.object', 'name.secondKey');

it('Contains the correct duplicate keys and identifiers', () => {
  const duplicates = secondKey.filter(item => item.type === 'repeated');
  expect(duplicates.length).toBe(1);
  expect(duplicates[0].key[0] === 'isduplicate'
        && duplicates[0].key[1] === 'a').toBe(true);
});

const objPath = differ('./tests/example/file3.json', './tests/example/file3.json', '.', 'name.secondKey', 'example');

it('Works without using obj pathing', () => {
  expect(objPath.length).toBe(1);
  const entry = objPath[0];
  expect(entry.type).toBe('diffs');
  expect(entry.details.updated.stringInt).toBe(123);
});
