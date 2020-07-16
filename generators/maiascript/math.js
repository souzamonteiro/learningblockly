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
 * @fileoverview Generating MaiaScript for math blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.MaiaScript.math');

goog.require('Blockly.MaiaScript');


Blockly.MaiaScript['math_number'] = function(block) {
  // Numeric value.
  var code = Number(block.getFieldValue('NUM'));
  var order = code >= 0 ? Blockly.MaiaScript.ORDER_ATOMIC :
              Blockly.MaiaScript.ORDER_UNARY_NEGATION;
  return [code, order];
};

Blockly.MaiaScript['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', Blockly.MaiaScript.ORDER_ADDITION],
    'MINUS': [' - ', Blockly.MaiaScript.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', Blockly.MaiaScript.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', Blockly.MaiaScript.ORDER_DIVISION],
    'POWER': [null, Blockly.MaiaScript.ORDER_COMMA]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.MaiaScript.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.MaiaScript.valueToCode(block, 'B', order) || '0';
  var code;
  // Power in MaiaScript requires a special case since it has no operator.
  if (!operator) {
    code = 'math.pow(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.MaiaScript['math_single'] = function(block) {
  // Math operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.MaiaScript.valueToCode(block, 'NUM',
        Blockly.MaiaScript.ORDER_UNARY_NEGATION) || '0';
    if (arg[0] == '-') {
      // --3 is not legal in JS.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, Blockly.MaiaScript.ORDER_UNARY_NEGATION];
  }
  if (operator == 'SIN' || operator == 'COS' || operator == 'TAN') {
    arg = Blockly.MaiaScript.valueToCode(block, 'NUM',
        Blockly.MaiaScript.ORDER_DIVISION) || '0';
  } else {
    arg = Blockly.MaiaScript.valueToCode(block, 'NUM',
        Blockly.MaiaScript.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = 'math.abs(' + arg + ')';
      break;
    case 'ROOT':
      code = 'math.sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'math.log(' + arg + ')';
      break;
    case 'EXP':
      code = 'math.exp(' + arg + ')';
      break;
    case 'POW10':
      code = 'math.pow(10,' + arg + ')';
      break;
    case 'ROUND':
      code = 'math.round(' + arg + ')';
      break;
    case 'ROUNDUP':
      code = 'math.ceil(' + arg + ')';
      break;
    case 'ROUNDDOWN':
      code = 'math.floor(' + arg + ')';
      break;
    case 'SIN':
      code = 'math.sin(' + arg + ' / 180 * math.PI)';
      break;
    case 'COS':
      code = 'math.cos(' + arg + ' / 180 * math.PI)';
      break;
    case 'TAN':
      code = 'math.tan(' + arg + ' / 180 * math.PI)';
      break;
  }
  if (code) {
    return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'LOG10':
      code = 'math.log(' + arg + ') / math.log(10)';
      break;
    case 'ASIN':
      code = 'math.asin(' + arg + ') / math.PI * 180';
      break;
    case 'ACOS':
      code = 'math.acos(' + arg + ') / math.PI * 180';
      break;
    case 'ATAN':
      code = 'math.atan(' + arg + ') / math.PI * 180';
      break;
    default:
      throw Error('Unknown math operator: ' + operator);
  }
  return [code, Blockly.MaiaScript.ORDER_DIVISION];
};

Blockly.MaiaScript['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    'PI': ['math.PI', Blockly.MaiaScript.ORDER_MEMBER],
    'E': ['math.E', Blockly.MaiaScript.ORDER_MEMBER],
    'GOLDEN_RATIO':
        ['(1 + math.sqrt(5)) / 2', Blockly.MaiaScript.ORDER_DIVISION],
    'SQRT2': ['math.SQRT2', Blockly.MaiaScript.ORDER_MEMBER],
    'SQRT1_2': ['math.SQRT1_2', Blockly.MaiaScript.ORDER_MEMBER],
    'INFINITY': ['Infinity', Blockly.MaiaScript.ORDER_ATOMIC]
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

Blockly.MaiaScript['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.MaiaScript.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.MaiaScript.ORDER_MODULUS) || '0';
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    var functionName = Blockly.MaiaScript.provideFunction_(
        'mathIsPrime',
        ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ + '(n) {',
         '  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
         '  if (n == 2 || n == 3) {',
         '    return true',
         '  }',
         '  // False if n is NaN, negative, is 1, or not whole.',
         '  // And false if n is divisible by 2 or 3.',
         '  if (isNaN(n) || n <= 1 || n % 1 != 0 || n % 2 == 0 ||' +
            ' n % 3 == 0) {',
         '    return false',
         '  }',
         '  // Check all the numbers of form 6k +/- 1, up to sqrt(n).',
         '  for (x = 6; x <= math.sqrt(n) + 1; x = x + 6) {',
         '    if (n % (x - 1) == 0 || n % (x + 1) == 0) {',
         '      return false',
         '    }',
         '  }',
         '  return true',
         '}']);
    code = functionName + '(' + number_to_check + ')';
    return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
  }
  switch (dropdown_property) {
    case 'EVEN':
      code = number_to_check + ' % 2 == 0';
      break;
    case 'ODD':
      code = number_to_check + ' % 2 == 1';
      break;
    case 'WHOLE':
      code = number_to_check + ' % 1 == 0';
      break;
    case 'POSITIVE':
      code = number_to_check + ' > 0';
      break;
    case 'NEGATIVE':
      code = number_to_check + ' < 0';
      break;
    case 'DIVISIBLE_BY':
      var divisor = Blockly.MaiaScript.valueToCode(block, 'DIVISOR',
          Blockly.MaiaScript.ORDER_MODULUS) || '0';
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.MaiaScript.ORDER_EQUALITY];
};

Blockly.MaiaScript['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.MaiaScript.valueToCode(block, 'DELTA',
      Blockly.MaiaScript.ORDER_ADDITION) || '0';
  var varName = Blockly.MaiaScript.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  return varName + ' = (typeof ' + varName + ' == \'number\' ? ' + varName +
      ' : 0) + ' + argument0 + '\n';
};

// Rounding functions have a single operand.
Blockly.MaiaScript['math_round'] = Blockly.MaiaScript['math_single'];
// Trigonometry functions have a single operand.
Blockly.MaiaScript['math_trig'] = Blockly.MaiaScript['math_single'];

Blockly.MaiaScript['math_on_list'] = function(block) {
  // Math functions for lists.
  var func = block.getFieldValue('OP');
  var list, code;
  switch (func) {
    case 'SUM':
      list = Blockly.MaiaScript.valueToCode(block, 'LIST',
          Blockly.MaiaScript.ORDER_MEMBER) || '[]';
      code = list + '.reduce(function(x, y) {return x + y})';
      break;
    case 'MIN':
      list = Blockly.MaiaScript.valueToCode(block, 'LIST',
          Blockly.MaiaScript.ORDER_COMMA) || '[]';
      code = 'math.min.apply(null, ' + list + ')';
      break;
    case 'MAX':
      list = Blockly.MaiaScript.valueToCode(block, 'LIST',
          Blockly.MaiaScript.ORDER_COMMA) || '[]';
      code = 'math.max.apply(null, ' + list + ')';
      break;
    case 'AVERAGE':
      // mathMean([null,null,1,3]) == 2.0.
      var functionName = Blockly.MaiaScript.provideFunction_(
          'mathMean',
          ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ +
              '(myList) {',
            '  return myList.reduce(function(x, y) {return x + y}) / ' +
                  'myList.length',
            '}']);
      list = Blockly.MaiaScript.valueToCode(block, 'LIST',
          Blockly.MaiaScript.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'MEDIAN':
      // mathMedian([null,null,1,3]) == 2.0.
      var functionName = Blockly.MaiaScript.provideFunction_(
          'mathMedian',
          ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ +
              '(myList) {',
            '  localList = myList.filter(function (x) ' +
              '{return typeof x == \'number\'})',
            '  if (!localList.length) return null',
            '  localList.sort(function(a, b) {return b - a})',
            '  if (localList.length % 2 == 0) {',
            '    return (localList[localList.length / 2 - 1] + ' +
              'localList[localList.length / 2]) / 2',
            '  } else {',
            '    return localList[(localList.length - 1) / 2]',
            '  }',
            '}']);
      list = Blockly.MaiaScript.valueToCode(block, 'LIST',
          Blockly.MaiaScript.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'MODE':
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1].
      var functionName = Blockly.MaiaScript.provideFunction_(
          'mathModes',
          ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ +
              '(values) {',
            '  modes = []',
            '  counts = []',
            '  maxCount = 0',
            '  for (i = 0; i < values.length; i = i + 1) {',
            '    value = values[i]',
            '    found = false',
            '    thisCount',
            '    for (j = 0; j < counts.length; j = j + 1) {',
            '      if (counts[j][0] === value) {',
            '        thisCount = counts[j][1] = counts[j][1] + 1',
            '        found = true',
            '        break',
            '      }',
            '    }',
            '    if (!found) {',
            '      counts.push([value, 1])',
            '      thisCount = 1',
            '    }',
            '    maxCount = math.max(thisCount, maxCount);',
            '  }',
            '  for (j = 0; j < counts.length; j = j + 1) {',
            '    if (counts[j][1] == maxCount) {',
            '        modes.push(counts[j][0])',
            '    }',
            '  }',
            '  return modes',
            '}']);
      list = Blockly.MaiaScript.valueToCode(block, 'LIST',
          Blockly.MaiaScript.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'STD_DEV':
      var functionName = Blockly.MaiaScript.provideFunction_(
          'mathStandardDeviation',
          ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ +
              '(numbers) {',
            '  n = core.length(numbers)',
            '  if (!n) return null',
            '  mean = numbers.reduce(function(x, y) {return x + y}) / n',
            '  variance = 0',
            '  for (j = 0; j < n; j = j + 1) {',
            '    variance = variance + math.pow(numbers[j] - mean, 2)',
            '  }',
            '  variance = variance / n',
            '  return math.sqrt(variance)',
            '}']);
      list = Blockly.MaiaScript.valueToCode(block, 'LIST',
          Blockly.MaiaScript.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'RANDOM':
      var functionName = Blockly.MaiaScript.provideFunction_(
          'mathRandomList',
          ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ +
              '(list) {',
            '  x = math.floor(math.random() * core.length(list))',
            '  return list[x]',
            '}']);
      list = Blockly.MaiaScript.valueToCode(block, 'LIST',
          Blockly.MaiaScript.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    default:
      throw Error('Unknown operator: ' + func);
  }
  return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};

Blockly.MaiaScript['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.MaiaScript.valueToCode(block, 'DIVIDEND',
      Blockly.MaiaScript.ORDER_MODULUS) || '0';
  var argument1 = Blockly.MaiaScript.valueToCode(block, 'DIVISOR',
      Blockly.MaiaScript.ORDER_MODULUS) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.MaiaScript.ORDER_MODULUS];
};

Blockly.MaiaScript['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  var argument0 = Blockly.MaiaScript.valueToCode(block, 'VALUE',
      Blockly.MaiaScript.ORDER_COMMA) || '0';
  var argument1 = Blockly.MaiaScript.valueToCode(block, 'LOW',
      Blockly.MaiaScript.ORDER_COMMA) || '0';
  var argument2 = Blockly.MaiaScript.valueToCode(block, 'HIGH',
      Blockly.MaiaScript.ORDER_COMMA) || 'Infinity';
  var code = 'math.min(math.max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};

Blockly.MaiaScript['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  var argument0 = Blockly.MaiaScript.valueToCode(block, 'FROM',
      Blockly.MaiaScript.ORDER_COMMA) || '0';
  var argument1 = Blockly.MaiaScript.valueToCode(block, 'TO',
      Blockly.MaiaScript.ORDER_COMMA) || '0';
  var functionName = Blockly.MaiaScript.provideFunction_(
      'mathRandomInt',
      ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ +
          '(a, b) {',
       '  if (a > b) {',
       '    // Swap a and b to ensure a is smaller.',
       '    var c = a',
       '    a = b',
       '    b = c',
       '  }',
       '  return math.floor(math.random() * (b - a + 1) + a)',
       '}']);
  var code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};

Blockly.MaiaScript['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  return ['math.random()', Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};

Blockly.MaiaScript['math_atan2'] = function(block) {
  // Arctangent of point (X, Y) in degrees from -180 to 180.
  var argument0 = Blockly.MaiaScript.valueToCode(block, 'X',
      Blockly.MaiaScript.ORDER_COMMA) || '0';
  var argument1 = Blockly.MaiaScript.valueToCode(block, 'Y',
      Blockly.MaiaScript.ORDER_COMMA) || '0';
  return ['math.atan2(' + argument1 + ', ' + argument0 + ') / math.PI * 180',
      Blockly.MaiaScript.ORDER_DIVISION];
};
