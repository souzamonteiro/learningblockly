/**
 * @license
 * Copyright 2012 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating MaiaScript for list blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.MaiaScript.lists');

goog.require('Blockly.MaiaScript');


Blockly.MaiaScript['lists_create_empty'] = function(block) {
  // Create an empty list.
  return ['[]', Blockly.MaiaScript.ORDER_ATOMIC];
};

Blockly.MaiaScript['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.MaiaScript.valueToCode(block, 'ADD' + i,
        Blockly.MaiaScript.ORDER_COMMA) || 'null';
  }
  var code = '[' + elements.join(', ') + ']';
  return [code, Blockly.MaiaScript.ORDER_ATOMIC];
};

Blockly.MaiaScript['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  var functionName = Blockly.MaiaScript.provideFunction_(
      'listsRepeat',
      ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ +
          '(value, n) {',
       '  array = []',
       '  for (var i = 0; i < n; i = i + 1) {',
       '    array[i] = value',
       '  }',
       '  return(array)',
       '}']);
  var element = Blockly.MaiaScript.valueToCode(block, 'ITEM',
      Blockly.MaiaScript.ORDER_COMMA) || 'null';
  var repeatCount = Blockly.MaiaScript.valueToCode(block, 'NUM',
      Blockly.MaiaScript.ORDER_COMMA) || '0';
  var code = functionName + '(' + element + ', ' + repeatCount + ')';
  return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};

Blockly.MaiaScript['lists_length'] = function(block) {
  // String or array length.
  var list = Blockly.MaiaScript.valueToCode(block, 'VALUE',
      Blockly.MaiaScript.ORDER_MEMBER) || '[]';
  return ['core.length(' + list + ')', Blockly.MaiaScript.ORDER_MEMBER];
};

Blockly.MaiaScript['lists_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var list = Blockly.MaiaScript.valueToCode(block, 'VALUE',
      Blockly.MaiaScript.ORDER_MEMBER) || '[]';
  return ['!' + 'core.length(' + list + ')', Blockly.MaiaScript.ORDER_LOGICAL_NOT];
};

Blockly.MaiaScript['lists_indexOf'] = function(block) {
  // Find an item in the list.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  var item = Blockly.MaiaScript.valueToCode(block, 'FIND',
      Blockly.MaiaScript.ORDER_NONE) || '\'\'';
  var list = Blockly.MaiaScript.valueToCode(block, 'VALUE',
      Blockly.MaiaScript.ORDER_MEMBER) || '[]';
  var code = list + '.' + operator + '(' + item + ')';
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', Blockly.MaiaScript.ORDER_ADDITION];
  }
  return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};

Blockly.MaiaScript['lists_getIndex'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var listOrder = (where == 'RANDOM') ? Blockly.MaiaScript.ORDER_COMMA :
      Blockly.MaiaScript.ORDER_MEMBER;
  var list = Blockly.MaiaScript.valueToCode(block, 'VALUE', listOrder) || '[]';

  switch (where) {
    case ('FIRST'):
      if (mode == 'GET') {
        var code = list + '[0]';
        return [code, Blockly.MaiaScript.ORDER_MEMBER];
      } else if (mode == 'GET_REMOVE') {
        var code = 'core.shift(' + list + ')';
        return [code, Blockly.MaiaScript.ORDER_MEMBER];
      } else if (mode == 'REMOVE') {
        return 'core.shift(' + list + ')\n';
      }
      break;
    case ('LAST'):
      if (mode == 'GET') {
        var code = list + '.slice(-1)[0]';
        return [code, Blockly.MaiaScript.ORDER_MEMBER];
      } else if (mode == 'GET_REMOVE') {
        var code = list + '.pop()';
        return [code, Blockly.MaiaScript.ORDER_MEMBER];
      } else if (mode == 'REMOVE') {
        return 'core.pop(' + list + ')\n';
      }
      break;
    case ('FROM_START'):
      var at = Blockly.MaiaScript.getAdjusted(block, 'AT');
      if (mode == 'GET') {
        var code = list + '[' + at + ']';
        return [code, Blockly.MaiaScript.ORDER_MEMBER];
      } else if (mode == 'GET_REMOVE') {
        var code = 'core.splice(' + list + ', ' + at + ', 1), 0)';
        return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return 'core.splice(' + list + ', ' + at + ', 1)\n';
      }
      break;
    case ('FROM_END'):
      var at = Blockly.MaiaScript.getAdjusted(block, 'AT', 1, true);
      if (mode == 'GET') {
        var code = 'core.slice(' + list + ', ' + at + ', 1)';
        return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
      } else if (mode == 'GET_REMOVE') {
        var code = 'core.splice(' + list + ', ' + at + ', 1)';
        return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return 'core.splice(' + list + ', ' + at + ', 1)';
      }
      break;
    case ('RANDOM'):
      var functionName = Blockly.MaiaScript.provideFunction_(
          'listsGetRandomItem',
          ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ +
              '(list, remove) {',
           '  x = math.floor(math.random() * core.length(list))',
           '  if (remove) {',
           '    return(core.splice(list, x, 1))',
           '  } else {',
           '    return(list[x])',
           '  }',
           '}']);
      code = functionName + '(' + list + ', ' + (mode != 'GET') + ')';
      if (mode == 'GET' || mode == 'GET_REMOVE') {
        return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + ';\n';
      }
      break;
  }
  throw Error('Unhandled combination (lists_getIndex).');
};

Blockly.MaiaScript['lists_setIndex'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var list = Blockly.MaiaScript.valueToCode(block, 'LIST',
      Blockly.MaiaScript.ORDER_MEMBER) || '[]';
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var value = Blockly.MaiaScript.valueToCode(block, 'TO',
      Blockly.MaiaScript.ORDER_ASSIGNMENT) || 'null';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  function cacheList() {
    if (list.match(/^\w+$/)) {
      return '';
    }
    var listVar = Blockly.MaiaScript.variableDB_.getDistinctName(
        'tmpList', Blockly.VARIABLE_CATEGORY_NAME);
    var code = listVar + ' = ' + list + '\n';
    list = listVar;
    return code;
  }
  switch (where) {
    case ('FIRST'):
      if (mode == 'SET') {
        return list + '[0] = ' + value + '\n';
      } else if (mode == 'INSERT') {
        return list + '.unshift(' + value + ')\n';
      }
      break;
    case ('LAST'):
      if (mode == 'SET') {
        var code = cacheList();
        code += list + '[' + list + '.length - 1] = ' + value + '\n';
        return code;
      } else if (mode == 'INSERT') {
        return list + '.push(' + value + ')\n';
      }
      break;
    case ('FROM_START'):
      var at = Blockly.MaiaScript.getAdjusted(block, 'AT');
      if (mode == 'SET') {
        return list + '[' + at + '] = ' + value + '\n';
      } else if (mode == 'INSERT') {
        return list + '.splice(' + at + ', 0, ' + value + ')\n';
      }
      break;
    case ('FROM_END'):
      var at = Blockly.MaiaScript.getAdjusted(block, 'AT', 1, false,
          Blockly.MaiaScript.ORDER_SUBTRACTION);
      var code = cacheList();
      if (mode == 'SET') {
        code += list + '[' + list + '.length - ' + at + '] = ' + value + '\n';
        return code;
      } else if (mode == 'INSERT') {
        code += list + '.splice(' + list + '.length - ' + at + ', 0, ' + value +
            ');\n';
        return code;
      }
      break;
    case ('RANDOM'):
      var code = cacheList();
      var xVar = Blockly.MaiaScript.variableDB_.getDistinctName(
          'tmpX', Blockly.VARIABLE_CATEGORY_NAME);
      code += xVar + ' = math.floor(math.random() * ' + list +
          '.length)\n';
      if (mode == 'SET') {
        code += list + '[' + xVar + '] = ' + value + '\n';
        return code;
      } else if (mode == 'INSERT') {
        code += list + '.splice(' + xVar + ', 0, ' + value + ')\n';
        return code;
      }
      break;
  }
  throw Error('Unhandled combination (lists_setIndex).');
};

/**
 * Returns an expression calculating the index into a list.
 * @param {string} listName Name of the list, used to calculate length.
 * @param {string} where The method of indexing, selected by dropdown in Blockly
 * @param {string=} opt_at The optional offset when indexing from start/end.
 * @return {string|undefined} Index expression.
 * @private
 */
Blockly.MaiaScript.lists.getIndex_ = function(listName, where, opt_at) {
  if (where == 'FIRST') {
    return '0';
  } else if (where == 'FROM_END') {
    return listName + '.length - 1 - ' + opt_at;
  } else if (where == 'LAST') {
    return listName + '.length - 1';
  } else {
    return opt_at;
  }
};

Blockly.MaiaScript['lists_getSublist'] = function(block) {
  // Get sublist.
  var list = Blockly.MaiaScript.valueToCode(block, 'LIST',
      Blockly.MaiaScript.ORDER_MEMBER) || '[]';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = list + '.slice(0)';
  } else if (list.match(/^\w+$/) ||
      (where1 != 'FROM_END' && where2 == 'FROM_START')) {
    // If the list is a variable or doesn't require a call for length, don't
    // generate a helper function.
    switch (where1) {
      case 'FROM_START':
        var at1 = Blockly.MaiaScript.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        var at1 = Blockly.MaiaScript.getAdjusted(block, 'AT1', 1, false,
            Blockly.MaiaScript.ORDER_SUBTRACTION);
        at1 = list + '.length - ' + at1;
        break;
      case 'FIRST':
        var at1 = '0';
        break;
      default:
        throw Error('Unhandled option (lists_getSublist).');
    }
    switch (where2) {
      case 'FROM_START':
        var at2 = Blockly.MaiaScript.getAdjusted(block, 'AT2', 1);
        break;
      case 'FROM_END':
        var at2 = Blockly.MaiaScript.getAdjusted(block, 'AT2', 0, false,
            Blockly.MaiaScript.ORDER_SUBTRACTION);
        at2 = list + '.length - ' + at2;
        break;
      case 'LAST':
        var at2 = list + '.length';
        break;
      default:
        throw Error('Unhandled option (lists_getSublist).');
    }
    code = list + '.slice(' + at1 + ', ' + at2 + ')';
  } else {
    var at1 = Blockly.MaiaScript.getAdjusted(block, 'AT1');
    var at2 = Blockly.MaiaScript.getAdjusted(block, 'AT2');
    var getIndex_ = Blockly.MaiaScript.lists.getIndex_;
    var wherePascalCase = {'FIRST': 'First', 'LAST': 'Last',
        'FROM_START': 'FromStart', 'FROM_END': 'FromEnd'};
    var functionName = Blockly.MaiaScript.provideFunction_(
        'subsequence' + wherePascalCase[where1] + wherePascalCase[where2],
        ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ +
            '(sequence' +
            // The value for 'FROM_END' and'FROM_START' depends on `at` so
            // we add it as a parameter.
            ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', at1' : '') +
            ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', at2' : '') +
            ') {',
          '  start = ' + getIndex_('sequence', where1, 'at1'),
          '  end = ' + getIndex_('sequence', where2, 'at2') + ' + 1',
          '  return(sequence.slice(start, end))',
          '}']);
    var code = functionName + '(' + list +
        // The value for 'FROM_END' and 'FROM_START' depends on `at` so we
        // pass it.
        ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', ' + at1 : '') +
        ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', ' + at2 : '') +
        ')';
  }
  return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};

Blockly.MaiaScript['lists_sort'] = function(block) {
  // Block for sorting a list.
  var list = Blockly.MaiaScript.valueToCode(block, 'LIST',
      Blockly.MaiaScript.ORDER_FUNCTION_CALL) || '[]';
  var direction = block.getFieldValue('DIRECTION') === '1' ? 1 : -1;
  var type = block.getFieldValue('TYPE');
  var getCompareFunctionName = Blockly.MaiaScript.provideFunction_(
      'listsGetSortCompare',
      ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ +
          '(type, direction) {',
       '  function compareNumber(a, b) {return(core.toNumber(a) - core.toNumber(b))}',
       '  function compareString(a, b) {return(core.toString(a) > core.toString(b) ? 1 : -1 )}',
       '  function ignoreCase(a, b) {',
       '    rel = core.toLowerCase(core.toString(a)) > core.toLowerCase(core.toString(b))',
       '    if (rel) {',
       '      res = 1',
       '    } else {',
       '      res = -1',
       '    }',
       '    return(res)',
       '  }',
       '  function compareItems(a, b) {',
       '    var compare = compareFuncs[type]',
       '    return(compare(a, b) * direction)',
       '  }',
       '  var compareFuncs = {',
       '    "NUMERIC": compareNumber,',
       '    "TEXT": compareString,',
       '    "IGNORE_CASE": ignoreCase,',
       '  }',
       '  return(compareItems)',
       '}']);
  return ['core.sort(core.slice(' + list + '), ' +
      getCompareFunctionName + ', "' + type + '", ' + direction + '))',
      Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};

Blockly.MaiaScript['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  var input = Blockly.MaiaScript.valueToCode(block, 'INPUT',
      Blockly.MaiaScript.ORDER_MEMBER);
  var delimiter = Blockly.MaiaScript.valueToCode(block, 'DELIM',
      Blockly.MaiaScript.ORDER_NONE) || '\'\'';
  var mode = block.getFieldValue('MODE');
  if (mode == 'SPLIT') {
    if (!input) {
      input = '\'\'';
    }
    var functionName = 'split';
  } else if (mode == 'JOIN') {
    if (!input) {
      input = '[]';
    }
    var functionName = 'join';
  } else {
    throw Error('Unknown mode: ' + mode);
  }
  var code = input + '.' + functionName + '(' + delimiter + ')';
  return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};

Blockly.MaiaScript['lists_reverse'] = function(block) {
  // Block for reversing a list.
  var list = Blockly.MaiaScript.valueToCode(block, 'LIST',
      Blockly.MaiaScript.ORDER_FUNCTION_CALL) || '[]';
  var code = list + '.slice().reverse()';
  return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};
