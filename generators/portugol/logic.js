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
 * @fileoverview Generating Portugol for logic blocks.
 * @author roberto@souzamonteiro.com (Roberto Luiz Souza Monteiro)
 */
'use strict';

goog.provide('Blockly.Portugol.logic');

goog.require('Blockly.Portugol');


Blockly.Portugol['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var code = '', branchCode, conditionCode;
  if (Blockly.Portugol.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += Blockly.Portugol.injectId(Blockly.Portugol.STATEMENT_PREFIX,
        block);
  }
  do {
    conditionCode = Blockly.Portugol.valueToCode(block, 'IF' + n,
        Blockly.Portugol.ORDER_NONE) || 'false';
    branchCode = Blockly.Portugol.statementToCode(block, 'DO' + n);
    if (Blockly.Portugol.STATEMENT_SUFFIX) {
      branchCode = Blockly.Portugol.prefixLines(
          Blockly.Portugol.injectId(Blockly.Portugol.STATEMENT_SUFFIX,
          block), Blockly.Portugol.INDENT) + branchCode;
    }
    code += (n > 0 ? ' senao ' : '') +
        'se (' + conditionCode + ') {\n' + branchCode + '}';
    ++n;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || Blockly.Portugol.STATEMENT_SUFFIX) {
    branchCode = Blockly.Portugol.statementToCode(block, 'ELSE');
    if (Blockly.Portugol.STATEMENT_SUFFIX) {
      branchCode = Blockly.Portugol.prefixLines(
          Blockly.Portugol.injectId(Blockly.Portugol.STATEMENT_SUFFIX,
          block), Blockly.Portugol.INDENT) + branchCode;
    }
    code += ' senao {\n' + branchCode + '}';
  }
  return code + '\n';
};

Blockly.Portugol['controls_ifelse'] = Blockly.Portugol['controls_if'];

Blockly.Portugol['logic_compare'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = (operator == '==' || operator == '!=') ?
      Blockly.Portugol.ORDER_EQUALITY : Blockly.Portugol.ORDER_RELATIONAL;
  var argument0 = Blockly.Portugol.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Portugol.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Portugol['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  var order = (operator == '&&') ? Blockly.Portugol.ORDER_LOGICAL_AND :
      Blockly.Portugol.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Portugol.valueToCode(block, 'A', order);
  var argument1 = Blockly.Portugol.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == '&&') ? 'true' : 'false';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Portugol['logic_negate'] = function(block) {
  // Negation.
  var order = Blockly.Portugol.ORDER_LOGICAL_NOT;
  var argument0 = Blockly.Portugol.valueToCode(block, 'BOOL', order) ||
      'true';
  var code = '!' + argument0;
  return [code, order];
};

Blockly.Portugol['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.Portugol.ORDER_ATOMIC];
};

Blockly.Portugol['logic_null'] = function(block) {
  // Null data type.
  return ['null', Blockly.Portugol.ORDER_ATOMIC];
};

Blockly.Portugol['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.Portugol.valueToCode(block, 'IF',
      Blockly.Portugol.ORDER_CONDITIONAL) || 'false';
  var value_then = Blockly.Portugol.valueToCode(block, 'THEN',
      Blockly.Portugol.ORDER_CONDITIONAL) || 'null';
  var value_else = Blockly.Portugol.valueToCode(block, 'ELSE',
      Blockly.Portugol.ORDER_CONDITIONAL) || 'null';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Blockly.Portugol.ORDER_CONDITIONAL];
};
