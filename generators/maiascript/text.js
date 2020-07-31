/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating MaiaScript for text blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.MaiaScript.texts');

goog.require('Blockly.MaiaScript');


Blockly.MaiaScript['text'] = function(block) {
  // Text value.
  var code = Blockly.MaiaScript.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.MaiaScript.ORDER_ATOMIC];
};

Blockly.MaiaScript['text_multiline'] = function(block) {
  // Text value.
  var code = Blockly.MaiaScript.multiline_quote_(block.getFieldValue('TEXT'));
  if (code.indexOf('\n') != -1) {
      code = '(' + code + ')'
  }
  return [code, Blockly.MaiaScript.ORDER_ATOMIC];
};

/**
 * Enclose the provided value in 'String(...)' function.
 * Leave string literals alone.
 * @param {string} value Code evaluating to a value.
 * @return {string} Code evaluating to a string.
 * @private
 */
Blockly.MaiaScript.text.forceString_ = function(value) {
  if (Blockly.MaiaScript.text.forceString_.strRegExp.test(value)) {
    return value;
  }
  return 'core.toString(' + value + ')';
};

/**
 * Regular expression to detect a single-quoted string literal.
 */
Blockly.MaiaScript.text.forceString_.strRegExp = /^\s*'([^']|\\')*'\s*$/;

Blockly.MaiaScript['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  switch (block.itemCount_) {
    case 0:
      return ['\'\'', Blockly.MaiaScript.ORDER_ATOMIC];
    case 1:
      var element = Blockly.MaiaScript.valueToCode(block, 'ADD0',
          Blockly.MaiaScript.ORDER_NONE) || '\'\'';
      var code = Blockly.MaiaScript.text.forceString_(element);
      return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
    case 2:
      var element0 = Blockly.MaiaScript.valueToCode(block, 'ADD0',
          Blockly.MaiaScript.ORDER_NONE) || '\'\'';
      var element1 = Blockly.MaiaScript.valueToCode(block, 'ADD1',
          Blockly.MaiaScript.ORDER_NONE) || '\'\'';
      var code = Blockly.MaiaScript.text.forceString_(element0) + ' + ' +
          Blockly.MaiaScript.text.forceString_(element1);
      return [code, Blockly.MaiaScript.ORDER_ADDITION];
    default:
      var elements = new Array(block.itemCount_);
      for (var i = 0; i < block.itemCount_; i++) {
        elements[i] = Blockly.MaiaScript.valueToCode(block, 'ADD' + i,
            Blockly.MaiaScript.ORDER_COMMA) || '\'\'';
      }
      var code = '[' + elements.join(',') + '].join(\'\')';
      return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
  }
};

Blockly.MaiaScript['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.MaiaScript.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  var value = Blockly.MaiaScript.valueToCode(block, 'TEXT',
      Blockly.MaiaScript.ORDER_NONE) || '\'\'';
  return varName + ' = ' + varName + ' + ' + Blockly.MaiaScript.text.forceString_(value) + '\n';
};

Blockly.MaiaScript['text_length'] = function(block) {
  // String or array length.
  var text = Blockly.MaiaScript.valueToCode(block, 'VALUE',
      Blockly.MaiaScript.ORDER_FUNCTION_CALL) || '\'\'';
  return ['core.length(' + text + ')', Blockly.MaiaScript.ORDER_MEMBER];
};

Blockly.MaiaScript['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var text = Blockly.MaiaScript.valueToCode(block, 'VALUE',
      Blockly.MaiaScript.ORDER_MEMBER) || '\'\'';
  return ['!' + 'core.length(' + text + ')', Blockly.MaiaScript.ORDER_LOGICAL_NOT];
};

Blockly.MaiaScript['text_indexOf'] = function(block) {
  // Search the text for a substring.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  var substring = Blockly.MaiaScript.valueToCode(block, 'FIND',
      Blockly.MaiaScript.ORDER_NONE) || '\'\'';
  var text = Blockly.MaiaScript.valueToCode(block, 'VALUE',
      Blockly.MaiaScript.ORDER_MEMBER) || '\'\'';
  var code = text + '.' + operator + '(' + substring + ')';
  // Adjust index if using one-based indices.
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', Blockly.MaiaScript.ORDER_ADDITION];
  }
  return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};

Blockly.MaiaScript['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var textOrder = (where == 'RANDOM') ? Blockly.MaiaScript.ORDER_NONE :
      Blockly.MaiaScript.ORDER_MEMBER;
  var text = Blockly.MaiaScript.valueToCode(block, 'VALUE',
      textOrder) || '\'\'';
  switch (where) {
    case 'FIRST':
      var code = text + '.charAt(0)';
      return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
    case 'LAST':
      var code = text + '.slice(-1)';
      return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
    case 'FROM_START':
      var at = Blockly.MaiaScript.getAdjusted(block, 'AT');
      // Adjust index if using one-based indices.
      var code = text + '.charAt(' + at + ')';
      return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
    case 'FROM_END':
      var at = Blockly.MaiaScript.getAdjusted(block, 'AT', 1, true);
      var code = text + '.slice(' + at + ').charAt(0)';
      return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
    case 'RANDOM':
      var functionName = Blockly.MaiaScript.provideFunction_(
          'textRandomLetter',
          ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ +
              '(text) {',
           '  x = math.floor(math.random() * core.length(text))',
           '  return(text[x])',
           '}']);
      var code = functionName + '(' + text + ')';
      return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
  }
  throw Error('Unhandled option (text_charAt).');
};

/**
 * Returns an expression calculating the index into a string.
 * @param {string} stringName Name of the string, used to calculate length.
 * @param {string} where The method of indexing, selected by dropdown in Blockly
 * @param {string=} opt_at The optional offset when indexing from start/end.
 * @return {string|undefined} Index expression.
 * @private
 */
Blockly.MaiaScript.text.getIndex_ = function(stringName, where, opt_at) {
  if (where == 'FIRST') {
    return '0';
  } else if (where == 'FROM_END') {
    return stringName + '.length - 1 - ' + opt_at;
  } else if (where == 'LAST') {
    return stringName + '.length - 1';
  } else {
    return opt_at;
  }
};

Blockly.MaiaScript['text_getSubstring'] = function(block) {
  // Get substring.
  var text = Blockly.MaiaScript.valueToCode(block, 'STRING',
      Blockly.MaiaScript.ORDER_FUNCTION_CALL) || '\'\'';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = text;
  } else if (text.match(/^'?\w+'?$/) ||
      (where1 != 'FROM_END' && where1 != 'LAST' &&
      where2 != 'FROM_END' && where2 != 'LAST')) {
    // If the text is a variable or literal or doesn't require a call for
    // length, don't generate a helper function.
    switch (where1) {
      case 'FROM_START':
        var at1 = Blockly.MaiaScript.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        var at1 = Blockly.MaiaScript.getAdjusted(block, 'AT1', 1, false,
            Blockly.MaiaScript.ORDER_SUBTRACTION);
        at1 = text + '.length - ' + at1;
        break;
      case 'FIRST':
        var at1 = '0';
        break;
      default:
        throw Error('Unhandled option (text_getSubstring).');
    }
    switch (where2) {
      case 'FROM_START':
        var at2 = Blockly.MaiaScript.getAdjusted(block, 'AT2', 1);
        break;
      case 'FROM_END':
        var at2 = Blockly.MaiaScript.getAdjusted(block, 'AT2', 0, false,
            Blockly.MaiaScript.ORDER_SUBTRACTION);
        at2 = text + '.length - ' + at2;
        break;
      case 'LAST':
        var at2 = text + '.length';
        break;
      default:
        throw Error('Unhandled option (text_getSubstring).');
    }
    code = text + '.slice(' + at1 + ', ' + at2 + ')';
  } else {
    var at1 = Blockly.MaiaScript.getAdjusted(block, 'AT1');
    var at2 = Blockly.MaiaScript.getAdjusted(block, 'AT2');
    var getIndex_ = Blockly.MaiaScript.text.getIndex_;
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
          '  start = ' + getIndex_('sequence', where1, 'at1') + '',
          '  end = ' + getIndex_('sequence', where2, 'at2') + ' + 1',
          '  return(sequence.slice(start, end))',
          '}']);
    var code = functionName + '(' + text +
        // The value for 'FROM_END' and 'FROM_START' depends on `at` so we
        // pass it.
        ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', ' + at1 : '') +
        ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', ' + at2 : '') +
        ')';
  }
  return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};

Blockly.MaiaScript['text_changeCase'] = function(block) {
  // Change capitalization.
  var OPERATORS = {
    'UPPERCASE': '.toUpperCase()',
    'LOWERCASE': '.toLowerCase()',
    'TITLECASE': null
  };
  var operator = OPERATORS[block.getFieldValue('CASE')];
  var textOrder = operator ? Blockly.MaiaScript.ORDER_MEMBER :
      Blockly.MaiaScript.ORDER_NONE;
  var text = Blockly.MaiaScript.valueToCode(block, 'TEXT',
      textOrder) || '\'\'';
  if (operator) {
    // Upper and lower case are functions built into MaiaScript.
    var code = text + operator;
  } else {
    // Title case is not a native MaiaScript function.  Define one.
    var functionName = Blockly.MaiaScript.provideFunction_(
        'textToTitleCase',
        ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ +
            '(str) {',
         '   function camelCase(txt) {return(txt[0].toUpperCase() + ',
             'txt.substring(1).toLowerCase())}',
         '   return(str.replace(/\\S+/g, camelCase))',
         '}']);
    var code = functionName + '(' + text + ')';
  }
  return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};

Blockly.MaiaScript['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    'LEFT': ".replace(/^[\\s\\xa0]+/, '')",
    'RIGHT': ".replace(/[\\s\\xa0]+$/, '')",
    'BOTH': '.trim()'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var text = Blockly.MaiaScript.valueToCode(block, 'TEXT',
      Blockly.MaiaScript.ORDER_MEMBER) || '\'\'';
  return [text + operator, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};

Blockly.MaiaScript['text_print'] = function(block) {
  // Print statement.
  var msg = Blockly.MaiaScript.valueToCode(block, 'TEXT',
      Blockly.MaiaScript.ORDER_NONE) || '\'\'';
  return 'system.showMessageDialog(' + msg + ')\n';
};

Blockly.MaiaScript['text_prompt_ext'] = function(block) {
  // Prompt function.
  if (block.getField('TEXT')) {
    // Internal message.
    var msg = Blockly.MaiaScript.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    var msg = Blockly.MaiaScript.valueToCode(block, 'TEXT',
        Blockly.MaiaScript.ORDER_NONE) || '\'\'';
  }
  var code = 'system.showInputDialog(' + msg + ')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = 'core.toNumber(' + code + ')';
  }
  return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};

Blockly.MaiaScript['text_prompt'] = Blockly.MaiaScript['text_prompt_ext'];

Blockly.MaiaScript['text_count'] = function(block) {
  var text = Blockly.MaiaScript.valueToCode(block, 'TEXT',
      Blockly.MaiaScript.ORDER_MEMBER) || '\'\'';
  var sub = Blockly.MaiaScript.valueToCode(block, 'SUB',
      Blockly.MaiaScript.ORDER_NONE) || '\'\'';
  var functionName = Blockly.MaiaScript.provideFunction_(
      'textCount',
      ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ +
          '(haystack, needle) {',
       '  if (needle.length === 0) {',
       '    return(haystack.length + 1)',
       '  } else {',
       '    return(haystack.split(needle).length - 1)',
       '  }',
       '}']);
  var code = functionName + '(' + text + ', ' + sub + ')';
  return [code, Blockly.MaiaScript.ORDER_SUBTRACTION];
};

Blockly.MaiaScript['text_replace'] = function(block) {
  var text = Blockly.MaiaScript.valueToCode(block, 'TEXT',
      Blockly.MaiaScript.ORDER_MEMBER) || '\'\'';
  var from = Blockly.MaiaScript.valueToCode(block, 'FROM',
      Blockly.MaiaScript.ORDER_NONE) || '\'\'';
  var to = Blockly.MaiaScript.valueToCode(block, 'TO',
      Blockly.MaiaScript.ORDER_NONE) || '\'\'';
  // The regex escaping code below is taken from the implementation of
  // goog.string.regExpEscape.
  var functionName = Blockly.MaiaScript.provideFunction_(
      'textReplace',
      ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ +
          '(haystack, needle, replacement) {',
       '  needle = ' +
           'needle.replace(/([-()\\[\\]{}+?*.$\\^|,:#<!\\\\])/g,"\\\\$1")',
       '                 .replace(/\\x08/g,"\\\\x08")',
       '  return(haystack.replace(new RegExp(needle, \'g\'), replacement))',
       '}']);
  var code = functionName + '(' + text + ', ' + from + ', ' + to + ')';
  return [code, Blockly.MaiaScript.ORDER_MEMBER];
};

Blockly.MaiaScript['text_reverse'] = function(block) {
  var text = Blockly.MaiaScript.valueToCode(block, 'TEXT',
      Blockly.MaiaScript.ORDER_MEMBER) || '\'\'';
  var code = text + '.split(\'\').reverse().join(\'\')';
  return [code, Blockly.MaiaScript.ORDER_MEMBER];
};
