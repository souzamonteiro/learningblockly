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
 * @fileoverview Generating MaiaScript for logic blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.MaiaScript.logic');

goog.require('Blockly.MaiaScript');


Blockly.MaiaScript['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var code = '', branchCode, conditionCode;
  if (Blockly.MaiaScript.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += Blockly.MaiaScript.injectId(Blockly.MaiaScript.STATEMENT_PREFIX,
        block);
  }
  do {
    conditionCode = Blockly.MaiaScript.valueToCode(block, 'IF' + n,
        Blockly.MaiaScript.ORDER_NONE) || 'false';
    branchCode = Blockly.MaiaScript.statementToCode(block, 'DO' + n);
    if (Blockly.MaiaScript.STATEMENT_SUFFIX) {
      branchCode = Blockly.MaiaScript.prefixLines(
          Blockly.MaiaScript.injectId(Blockly.MaiaScript.STATEMENT_SUFFIX,
          block), Blockly.MaiaScript.INDENT) + branchCode;
    }
    code += (n > 0 ? ' else ' : '') +
        'if (' + conditionCode + ') {\n' + branchCode + '}';
    ++n;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || Blockly.MaiaScript.STATEMENT_SUFFIX) {
    branchCode = Blockly.MaiaScript.statementToCode(block, 'ELSE');
    if (Blockly.MaiaScript.STATEMENT_SUFFIX) {
      branchCode = Blockly.MaiaScript.prefixLines(
          Blockly.MaiaScript.injectId(Blockly.MaiaScript.STATEMENT_SUFFIX,
          block), Blockly.MaiaScript.INDENT) + branchCode;
    }
    code += ' else {\n' + branchCode + '}';
  }
  return code + '\n';
};

Blockly.MaiaScript['controls_ifelse'] = Blockly.MaiaScript['controls_if'];

Blockly.MaiaScript['logic_compare'] = function(block) {
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
      Blockly.MaiaScript.ORDER_EQUALITY : Blockly.MaiaScript.ORDER_RELATIONAL;
  var argument0 = Blockly.MaiaScript.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.MaiaScript.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.MaiaScript['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  var order = (operator == '&&') ? Blockly.MaiaScript.ORDER_LOGICAL_AND :
      Blockly.MaiaScript.ORDER_LOGICAL_OR;
  var argument0 = Blockly.MaiaScript.valueToCode(block, 'A', order);
  var argument1 = Blockly.MaiaScript.valueToCode(block, 'B', order);
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

Blockly.MaiaScript['logic_negate'] = function(block) {
  // Negation.
  var order = Blockly.MaiaScript.ORDER_LOGICAL_NOT;
  var argument0 = Blockly.MaiaScript.valueToCode(block, 'BOOL', order) ||
      'true';
  var code = '!' + argument0;
  return [code, order];
};

Blockly.MaiaScript['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.MaiaScript.ORDER_ATOMIC];
};

Blockly.MaiaScript['logic_null'] = function(block) {
  // Null data type.
  return ['null', Blockly.MaiaScript.ORDER_ATOMIC];
};

Blockly.MaiaScript['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.MaiaScript.valueToCode(block, 'IF',
      Blockly.MaiaScript.ORDER_CONDITIONAL) || 'false';
  var value_then = Blockly.MaiaScript.valueToCode(block, 'THEN',
      Blockly.MaiaScript.ORDER_CONDITIONAL) || 'null';
  var value_else = Blockly.MaiaScript.valueToCode(block, 'ELSE',
      Blockly.MaiaScript.ORDER_CONDITIONAL) || 'null';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Blockly.MaiaScript.ORDER_CONDITIONAL];
};
