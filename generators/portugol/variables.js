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
 * @fileoverview Generating Portugol for variable blocks.
 * @author roberto@souzamonteiro.com (Roberto Luiz Souza Monteiro)
 */
'use strict';

goog.provide('Blockly.Portugol.variables');

goog.require('Blockly.Portugol');


Blockly.Portugol['variables_get'] = function(block) {
  // Variable getter.
  var code = Blockly.Portugol.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.VARIABLE_CATEGORY_NAME);
  return [code, Blockly.Portugol.ORDER_ATOMIC];
};

Blockly.Portugol['variables_set'] = function(block) {
  // Variable setter.
  var argument0 = Blockly.Portugol.valueToCode(block, 'VALUE',
      Blockly.Portugol.ORDER_ASSIGNMENT) || '0';
  var varName = Blockly.Portugol.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  return varName + ' = ' + argument0 + ';\n';
};
