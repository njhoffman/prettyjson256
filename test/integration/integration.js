const fs = require('fs');
const path = require('path');

const { testObj1, testMultiline1 } = require('../fixtures/fixtures');
const { render, init } = require('../../lib/prettyjson');

let showOutput = true;
let currTestObj = testObj1;

// keep own version of defaultOptions so project can be changed without breaking fixtures
// TODO: add options inlineIndent boolean
const options = {
  alphabetizeKeys:    false,
  defaultIndentation: 2,
  depth:              -1,
  emptyArrayMsg:      '(empty array)',
  emptyObjectMsg:     '{}',
  emptyStringMsg:     '(empty string)',
  noColor:            false,
  numberArrays:       false,
  showEmpty:          true,
  colors:             {
    boolFalse:        { fg: [5, 4, 4] },
    boolTrue:         { fg: [4, 4, 5] },
    dash:             { fg: [2, 5, 4] },
    date:             { fg: [0, 5, 2] },
    depth:            { fg: [9] },
    empty:            { fg: [13] },
    functionHeader:   { fg: [13] },
    functionTag:      { fg: [4, 4, 5] },
    keys:             { fg: [2, 5, 4] },
    number:           { fg: [2, 4, 5] },
    string:           null
  }
};

const writeSnapshot = (name, data) => {
  const fullPath = path.resolve(__dirname, `../snapshots/${name}`);
  fs.writeFile(fullPath, data, (err) => {
    if (err) {
      return console.error(err);
    }
    console.log(`\n\n -- Snapshot "${fullPath}" Saved\n\n`);
  });
};

const loadSnapshot = (name) => {
  const fullPath = path.resolve(__dirname, `../snapshots/${name}`);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath);
  }
  return false;
};

const checksum = (s) => {
  var chk = 0x12345678;
  var len = s.length;
  for (var i = 0; i < len; i++) {
    chk += (s.charCodeAt(i) * (i + 1));
  }
  // returns 32-bit integer checksum encoded as a string containin it's hex value
  return (chk & 0xffffffff).toString(16);
};

const _testOutput = (testObj, expected, customOptions = {}, showOutput = false, saveSnapshot = false) => {
  const snapshot = loadSnapshot(expected);
  const newOptions = Object.assign(Object.assign({}, options), customOptions);
  init(newOptions);
  const ret = render(testObj);
  const failOut = snapshot ? `\n(expected)\n${snapshot}\n(returned)\n${ret}\n` : `\n(returned)\n${ret}\n`;
  showOutput && console.log(`\n${ret}\n`);
  // expect(checksum(ret)).to.equal(expected);
  expect(checksum(ret), failOut).to.equal(expected);
  saveSnapshot && writeSnapshot(expected, ret);
};

describe('Integration tests', () => {
  describe('General Settings', () => {
    currTestObj = testObj1;
    const testOutput = _testOutput.bind(this, testObj1);
    it('Should render correctly with default options', () => {
      const expected = '1aaa86cf';
      testOutput(expected);
    });

    it('Should render correctly when setting "alphabetizeKeys" is modified', () => {
      const expected = '1a8ef307';
      testOutput(expected, { alphabetizeKeys: true });
    });

    it('Should render correctly when setting "defaultIndentation" is modified', () => {
      const expected = '1c8f6e2b';
      testOutput(expected, { defaultIndentation: 5 });
    });

    it('Should render correctly when setting "depth" is 1', () => {
      const expected = '131cad97';
      testOutput(expected, { depth: 1 });
    });

    it('Should render correctly when setting "depth" is 2', () => {
      const expected = '138b4a2d';
      testOutput(expected, { depth: 2 });
    });

    it('Should render correctly when setting "depth" is 3', () => {
      const expected = '13d30bdc';
      testOutput(expected, { depth: 3 });
    });

    it('Should render correctly when setting "depth" is 4', () => {
      const expected = '15b890aa';
      testOutput(expected, { depth: 4 });
    });

    it('Should render correctly when setting "emptyArrayMsg" is modified', () => {
      const expected = '1ab4c969';
      testOutput(expected, { emptyArrayMsg: 'empty array test' });
    });

    it('Should render correctly when setting "emptyObjectMsg" is modified', () => {
      const expected = '1ad38372';
      testOutput(expected, { emptyObjectMsg: 'empty object test' });
    });

    it('Should render correctly when setting "emptyStringMsg" is modified', () => {
      const expected = '1ab513a1';
      testOutput(expected, { emptyStringMsg: 'empty string test' });
    });

    it('Should render correctly when setting "noColor" is modified', () => {
      const expected = '144c64fd';
      testOutput(expected, { noColor: true });
    });

    it('Should render correctly when setting "numberArrays" is modified', () => {
      const expected = '1c74d643';
      testOutput(expected, { numberArrays: true });
    });

    it('Should render correctly when setting "showEmpty" is modified', () => {
      const expected = '1942bb31';
      testOutput(expected, { showEmpty : false });
    });
  });

  describe('Color Settings', () => {
    const testOutput = _testOutput.bind(this, testObj1);
    it('Should render correct colors when setting "boolFalse" is modified', () => {
      const expected = '1aa71b31';
      const cOpt = { colors: { boolFalse: { fg: [0, 5, 0] } } };
      testOutput(expected, cOpt);
    });

    it('Should render correct colors when setting "boolTrue" is modified', () => {
      const expected = '1aaa7e44';
      const cOpt = { colors: { boolTrue: { fg: [5, 0, 0] } } };
      testOutput(expected, cOpt);
    });

    it('Should render correct colors when setting "dash" is modified', () => {
      const expected = '1aacb56a';
      const cOpt = { colors: { dash: { fg: [5, 0, 0] } } };
      testOutput(expected, cOpt);
    });

    // it('Should render correct colors when setting "date" is modified', () => {
      // had to remove date object from fixture because can't control output on different systems
      // TODO: figure out a way to test it!
      // const expected = '1b50e4f1';
    // });

    it('Should render correct colors when setting "depth" is modified', () => {
      const expected = '15b8cf98';
      const cOpt = { depth: 4, colors: { depth: { fg: [5, 0, 0] } } };
      testOutput(expected, cOpt);
    });

    it('Should render correct colors when setting "empty" is modified', () => {
      const expected = '1aaad5a9';
      const cOpt = { colors: { empty: { fg: [5, 0, 0] } } };
      testOutput(expected, cOpt);
    });

    it('Should render correct colors when setting "functionHeader" is modified', () => {
      const expected = '1aaaf509';
      const cOpt = { colors: { functionHeader: { fg: [5, 0, 0] } } };
      testOutput(expected, cOpt);
    });

    it('Should render correct colors when setting "functionTag" is modified', () => {
      const expected = '1aaa5b7f';
      const cOpt = { colors: { functionTag: { fg: [5, 0, 0] } } };
      testOutput(expected, cOpt);
    });

    it('Should render correct colors when setting "keys" is modified', () => {
      const expected = '1aafcbcb';
      const cOpt = { colors: { keys: { fg: [5, 0, 0] } } };
      testOutput(expected, cOpt);
    });

    it('Should render correct colors when setting "number" is modified', () => {
      const expected = '1aaae6db';
      const cOpt = { colors: { number: { fg: [5, 0, 0] } } };
      testOutput(expected, cOpt);
    });
    //
    it('Should render correct colors when setting "string" is modified', () => {
      const expected = '1c66d5ff';
      const cOpt = { colors: { string: { fg: [5, 0, 0] } } };
      testOutput(expected, cOpt);
    });
  });

  describe('Other', () => {
    const testOutput = _testOutput.bind(this, testMultiline1);
    it('Should render multiline strings correctly', () => {
      const expected = '12cb43be';
      testOutput(expected);
    });
  });
});
