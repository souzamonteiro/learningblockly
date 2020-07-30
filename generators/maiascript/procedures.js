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
 * @fileoverview Generating MaiaScript for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.MaiaScript.procedures');

goog.require('Blockly.MaiaScript');


Blockly.MaiaScript['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcName = Blockly.MaiaScript.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.PROCEDURE_CATEGORY_NAME);
  var xfix1 = '';
  if (Blockly.MaiaScript.STATEMENT_PREFIX) {
    xfix1 += Blockly.MaiaScript.injectId(Blockly.MaiaScript.STATEMENT_PREFIX,
        block);
  }
  if (Blockly.MaiaScript.STATEMENT_SUFFIX) {
    xfix1 += Blockly.MaiaScript.injectId(Blockly.MaiaScript.STATEMENT_SUFFIX,
        block);
  }
  if (xfix1) {
    xfix1 = Blockly.MaiaScript.prefixLines(xfix1, Blockly.MaiaScript.INDENT);
  }
  var loopTrap = '';
  if (Blockly.MaiaScript.INFINITE_LOOP_TRAP) {
    loopTrap = Blockly.MaiaScript.prefixLines(
        Blockly.MaiaScript.injectId(Blockly.MaiaScript.INFINITE_LOOP_TRAP,
        block), Blockly.MaiaScript.INDENT);
  }
  var branch = Blockly.MaiaScript.statementToCode(block, 'STACK');
  var returnValue = Blockly.MaiaScript.valueToCode(block, 'RETURN',
      Blockly.MaiaScript.ORDER_NONE) || '';
  var xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = Blockly.MaiaScript.INDENT + 'return ' + returnValue + ';\n';
  }
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.MaiaScript.variableDB_.getName(block.arguments_[i],
        Blockly.VARIABLE_CATEGORY_NAME);
  }
  var code = 'function ' + funcName + '(' + args.join(', ') + ') {\n' +
      xfix1 + loopTrap + branch + xfix2 + returnValue + '}';
  code = Blockly.MaiaScript.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.MaiaScript.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.MaiaScript['procedures_defnoreturn'] =
    Blockly.MaiaScript['procedures_defreturn'];

Blockly.MaiaScript['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.MaiaScript.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.PROCEDURE_CATEGORY_NAME);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.MaiaScript.valueToCode(block, 'ARG' + i,
        Blockly.MaiaScript.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};

Blockly.MaiaScript['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  var tuple = Blockly.MaiaScript['procedures_callreturn'](block);
  //return tuple[0] + ';\n';
  return tuple[0] + '\n';
};

Blockly.MaiaScript['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.MaiaScript.valueToCode(block, 'CONDITION',
      Blockly.MaiaScript.ORDER_NONE) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (Blockly.MaiaScript.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code += Blockly.MaiaScript.prefixLines(
        Blockly.MaiaScript.injectId(Blockly.MaiaScript.STATEMENT_SUFFIX, block),
        Blockly.MaiaScript.INDENT);
  }
  if (block.hasReturnValue_) {
    var value = Blockly.MaiaScript.valueToCode(block, 'VALUE',
        Blockly.MaiaScript.ORDER_NONE) || 'null';
    //code += Blockly.MaiaScript.INDENT + 'return ' + value + ';\n';
    code += Blockly.MaiaScript.INDENT + 'return(' + value + ')\n';
  } else {
    //code += Blockly.MaiaScript.INDENT + 'return;\n';
    code += Blockly.MaiaScript.INDENT + 'return()\n';
  }
  code += '}\n';
  return code;
};
