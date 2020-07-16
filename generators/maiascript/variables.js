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
 * @fileoverview Generating MaiaScript for variable blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.MaiaScript.variables');

goog.require('Blockly.MaiaScript');


Blockly.MaiaScript['variables_get'] = function(block) {
  // Variable getter.
  var code = Blockly.MaiaScript.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.VARIABLE_CATEGORY_NAME);
  return [code, Blockly.MaiaScript.ORDER_ATOMIC];
};

Blockly.MaiaScript['variables_set'] = function(block) {
  // Variable setter.
  var argument0 = Blockly.MaiaScript.valueToCode(block, 'VALUE',
      Blockly.MaiaScript.ORDER_ASSIGNMENT) || '0';
  var varName = Blockly.MaiaScript.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
      //return varName + ' = ' + argument0 + ';\n';
      return varName + ' = ' + argument0 + '\n';
};
