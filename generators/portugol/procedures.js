/**
 * @license
 * Copyright 2020 Roberto Luiz Souza Monteiro
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
 * @fileoverview Generating Portugol for procedure blocks.
 * @author roberto@souzamonteiro.com (Roberto Luiz Souza Monteiro)
 */
'use strict';

goog.provide('Blockly.Portugol.procedures');

goog.require('Blockly.Portugol');


Blockly.Portugol['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcName = Blockly.Portugol.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.PROCEDURE_CATEGORY_NAME);
  var xfix1 = '';
  if (Blockly.Portugol.STATEMENT_PREFIX) {
    xfix1 += Blockly.Portugol.injectId(Blockly.Portugol.STATEMENT_PREFIX,
        block);
  }
  if (Blockly.Portugol.STATEMENT_SUFFIX) {
    xfix1 += Blockly.Portugol.injectId(Blockly.Portugol.STATEMENT_SUFFIX,
        block);
  }
  if (xfix1) {
    xfix1 = Blockly.Portugol.prefixLines(xfix1, Blockly.Portugol.INDENT);
  }
  var loopTrap = '';
  if (Blockly.Portugol.INFINITE_LOOP_TRAP) {
    loopTrap = Blockly.Portugol.prefixLines(
        Blockly.Portugol.injectId(Blockly.Portugol.INFINITE_LOOP_TRAP,
        block), Blockly.Portugol.INDENT);
  }
  var branch = Blockly.Portugol.statementToCode(block, 'STACK');
  var returnValue = Blockly.Portugol.valueToCode(block, 'RETURN',
      Blockly.Portugol.ORDER_NONE) || '';
  var xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = Blockly.Portugol.INDENT + 'return ' + returnValue + ';\n';
  }
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Portugol.variableDB_.getName(block.arguments_[i],
        Blockly.VARIABLE_CATEGORY_NAME);
  }
  var code = 'funcao ' + funcName + '(' + args.join(', ') + ') {\n' +
      xfix1 + loopTrap + branch + xfix2 + returnValue + '}';
  code = Blockly.Portugol.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.Portugol.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Portugol['procedures_defnoreturn'] =
    Blockly.Portugol['procedures_defreturn'];

Blockly.Portugol['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.Portugol.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.PROCEDURE_CATEGORY_NAME);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Portugol.valueToCode(block, 'ARG' + i,
        Blockly.Portugol.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
};

Blockly.Portugol['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  var tuple = Blockly.Portugol['procedures_callreturn'](block);
  return tuple[0] + ';\n';
};

Blockly.Portugol['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.Portugol.valueToCode(block, 'CONDITION',
      Blockly.Portugol.ORDER_NONE) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (Blockly.Portugol.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code += Blockly.Portugol.prefixLines(
        Blockly.Portugol.injectId(Blockly.Portugol.STATEMENT_SUFFIX, block),
        Blockly.Portugol.INDENT);
  }
  if (block.hasReturnValue_) {
    var value = Blockly.Portugol.valueToCode(block, 'VALUE',
        Blockly.Portugol.ORDER_NONE) || 'null';
    code += Blockly.Portugol.INDENT + 'retorne ' + value + ';\n';
  } else {
    code += Blockly.Portugol.INDENT + 'retorne;\n';
  }
  code += '}\n';
  return code;
};
