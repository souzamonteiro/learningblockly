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
 * @fileoverview Generating Portugol for dynamic variable blocks.
 * @author roberto@souzamonteiro.com (Roberto Luiz Souza Monteiro)
 */
'use strict';

goog.provide('Blockly.Portugol.variablesDynamic');

goog.require('Blockly.Portugol');
goog.require('Blockly.Portugol.variables');


// Portugol is dynamically typed.
Blockly.Portugol['variables_get_dynamic'] =
    Blockly.Portugol['variables_get'];
Blockly.Portugol['variables_set_dynamic'] =
    Blockly.Portugol['variables_set'];
