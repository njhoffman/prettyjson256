'use strict';

var Utils = require('./utils');

var _require = require('lodash'),
    isError = _require.isError,
    isFunction = _require.isFunction,
    isArray = _require.isArray,
    isString = _require.isString,
    isDate = _require.isDate,
    isObjectLike = _require.isObjectLike,
    isEmpty = _require.isEmpty,
    isNumber = _require.isNumber,
    each = _require.each,
    keys = _require.keys;

var _require2 = require('./settings'),
    getOptions = _require2.getOptions,
    getPrintColor = _require2.getPrintColor;

var options = getOptions();
var pColor = getPrintColor();

var _addColorToData = function _addColorToData(input) {
  var sInput = input + '';

  /* eslint-disable no-multi-spaces */
  if (isString(input)) {
    return pColor.string(input);
  }
  if (isNumber(input)) {
    return pColor.number(input);
  }
  if (input === true) {
    return pColor.boolTrue(sInput);
  }
  if (input === false) {
    return pColor.boolFalse(sInput);
  }
  if (input === null) {
    return pColor.empty(sInput);
  }
  if (input instanceof Date) {
    return pColor.date(sInput);
  }
  if (isArray(input)) {
    return input.join(', ');
  }
  /* eslint-enable no-multi-spaces */

  return sInput;
};

var _indentMultiLine = function _indentMultiLine(string, spaces) {
  return string.split('\n').map(function (line) {
    return Utils.indent(spaces) + line;
  }).join('\n');
};

var _handleMultiLine = function _handleMultiLine(data, indentation) {
  return [Utils.indent(indentation) + '"""', _indentMultiLine(data, indentation + options.defaultIndentation), Utils.indent(indentation) + '"""'];
};

var _handleFunction = function _handleFunction(data, indentation) {
  var funcHeader = data.toString().split('\n')[0].replace('{', '');
  return [Utils.indent(indentation) + pColor.functionTag('[Function] ') + pColor.functionHeader(funcHeader)];
};

var _handleError = function _handleError(data, indentation) {
  var funcHeader = data.toString().split('\n')[0].replace('{', '');
  return [pColor.errorDivider(options.errorDivider) + '\n' + pColor.errorName(data.name) + '\n' + pColor.errorMessage(data.message) + '\n' + pColor.errorStack(data.stack) + '\n' + pColor.errorDivider(options.errorDivider)];
};

var _handleArray = function _handleArray(data, indentation, level) {
  var arrayOut = [];
  if (level + 1 === options.depth) {
    var line = Utils.indent(indentation) + pColor.depth('[Array length ' + data.length + ']');
    arrayOut.push(line);
  } else {
    level++;
    each(data, function (element, i) {
      var line = options.numberArrays ? '-[' + i + '] ' : '- ';
      line = Utils.indent(indentation) + pColor.dash(line);
      // if arrays are numbered, each element should be on its own line
      if (options.numberArrays) {
        arrayOut.push(line);
        line = Utils.indent(indentation + options.defaultIndentation);
      }
      line += parse(element, indentation + options.defaultIndentation, level).trim();
      arrayOut.push(line);
    });
  }
  return arrayOut;
};

var _handleObject = function _handleObject(data, indentation, level) {
  // Get the size of the longest index to align all the values
  var maxIndexLength = Utils.getMaxIndexLength(data);
  var key;

  var objOut = [];
  level++;
  each(keys(data), function (i) {
    var element = data[i];
    key = i + ': ';
    key = Utils.indent(indentation) + pColor.keys(key);

    // If the value is serializable, render it on the same line
    if (Utils.isSerializable(element, options)) {
      // but don't render anything if showEmpty setting is false and data is empty array, object, or string
      if (!((isObjectLike(element) || isString(element)) && isEmpty(element) && !options.showEmpty)) {
        key += parse(element, maxIndexLength - i.length);
        objOut.push(key);
      }
    } else if (level === options.depth) {
      // dont nest any more for object if depth level reached
      key += Utils.indent(maxIndexLength - i.length) + pColor.depth('[Object] (' + keys(element).length + '  keys)');
      objOut.push(key);
    } else if (level + 1 === options.depth && isArray(element)) {
      key += Utils.indent(maxIndexLength - i.length) + pColor.depth('[Array length ' + keys(element).length + ']');
      objOut.push(key);
    } else {
      // If the index is an array or object, render it in next line
      objOut.push(key);
      objOut.push(parse(element, indentation + options.defaultIndentation, level));
    }
  });
  return objOut;
};

var _handleEmpty = function _handleEmpty(data, indentation) {
  if (isArray(data)) {
    return Utils.indent(indentation) + pColor.empty(options.emptyArrayMsg);
  } else if (isString(data)) {
    return Utils.indent(indentation) + pColor.empty(options.emptyStringMsg);
  } else if (isObjectLike(data)) {
    return Utils.indent(indentation) + pColor.empty(options.emptyObjectMsg);
  }
};

var _handleSerializable = function _handleSerializable(data, indentation) {
  if (Utils.isCustomColor(data, options.customColors)) {
    var colorKey = keys(data)[0];
    return Utils.indent(indentation) + pColor[colorKey](data[colorKey]);
  } else if (isFunction(data)) {
    return _handleFunction(data, indentation);
  } else if (isDate(data) || isNumber(data)) {
    return Utils.indent(indentation) + _addColorToData(data);
  } else if ((isObjectLike(data) || isString(data)) && isEmpty(data)) {
    return _handleEmpty(data, indentation);
  } else {
    // Render a string exactly equal
    return Utils.indent(indentation) + _addColorToData(data);
  }
};

var parse = function parse(data) {
  var indentation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var output = [];
  options = getOptions();
  pColor = getPrintColor();

  if (Utils.isSerializable(data, options)) {
    output = output.concat(_handleSerializable(data, indentation));
  } else if (isString(data)) {
    // unserializable string means it's multiline
    output = output.concat(_handleMultiLine(data, indentation));
  } else if (isArray(data)) {
    output = output.concat(_handleArray(data, indentation, level));
  } else if (isError(data)) {
    output = output.concat(_handleError(data, indentation, level));
  } else if (isObjectLike(data)) {
    output = output.concat(_handleObject(data, indentation, level));
  }

  // Return all the lines as a string
  return output.join('\n');
};

module.exports = parse;
//# sourceMappingURL=parser.js.map