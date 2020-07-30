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
 * @fileoverview Generating MaiaScript for colour blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.MaiaScript.colour');

goog.require('Blockly.MaiaScript');


Blockly.MaiaScript['colour_picker'] = function(block) {
  // Colour picker.
  var code = Blockly.MaiaScript.quote_(block.getFieldValue('COLOUR'));
  return [code, Blockly.MaiaScript.ORDER_ATOMIC];
};

Blockly.MaiaScript['colour_random'] = function(block) {
  // Generate a random colour.
  var functionName = Blockly.MaiaScript.provideFunction_(
      'colourRandom',
      ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ + '() {',
        '  num = math.floor(math.random() * math.pow(2, 24))',
        '  return(\'#\' + core.substr(\'00000\' + core.toString(num, 16), -6))',
        '}']);
  var code = functionName + '()';
  return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};

Blockly.MaiaScript['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  var red = Blockly.MaiaScript.valueToCode(block, 'RED',
      Blockly.MaiaScript.ORDER_COMMA) || 0;
  var green = Blockly.MaiaScript.valueToCode(block, 'GREEN',
      Blockly.MaiaScript.ORDER_COMMA) || 0;
  var blue = Blockly.MaiaScript.valueToCode(block, 'BLUE',
      Blockly.MaiaScript.ORDER_COMMA) || 0;
  var functionName = Blockly.MaiaScript.provideFunction_(
      'colourRgb',
      ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ +
          '(r, g, b) {',
       '  r = math.max(math.min(core.toNumber(r), 100), 0) * 2.55',
       '  g = math.max(math.min(core.toNumber(g), 100), 0) * 2.55',
       '  b = math.max(math.min(core.toNumber(b), 100), 0) * 2.55',
       '  r = core.slice(core.toString((\'0\' + (math.round(r) || 0), 16)), -2)',
       '  g = core.slice(core.toString((\'0\' + (math.round(g) || 0), 16)), -2)',
       '  b = core.slice(core.toString((\'0\' + (math.round(b) || 0), 16)), -2)',
       '  return(\'#\' + r + g + b)',
       '}']);
  var code = functionName + '(' + red + ', ' + green + ', ' + blue + ')';
  return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};

Blockly.MaiaScript['colour_blend'] = function(block) {
  // Blend two colours together.
  var c1 = Blockly.MaiaScript.valueToCode(block, 'COLOUR1',
      Blockly.MaiaScript.ORDER_COMMA) || '\'#000000\'';
  var c2 = Blockly.MaiaScript.valueToCode(block, 'COLOUR2',
      Blockly.MaiaScript.ORDER_COMMA) || '\'#000000\'';
  var ratio = Blockly.MaiaScript.valueToCode(block, 'RATIO',
      Blockly.MaiaScript.ORDER_COMMA) || 0.5;
  var functionName = Blockly.MaiaScript.provideFunction_(
      'colourBlend',
      ['function ' + Blockly.MaiaScript.FUNCTION_NAME_PLACEHOLDER_ +
          '(c1, c2, ratio) {',
       '  ratio = math.max(math.min(core.toNumber(ratio), 1), 0)',
       '  r1 = core.parseInt(core.substring(c1, 1, 3), 16)',
       '  g1 = core.parseInt(core.substring(c1, 3, 5), 16)',
       '  b1 = core.parseInt(core.substring(c1, 5, 7), 16)',
       '  r2 = core.parseInt(core.substring(c2, 1, 3), 16)',
       '  g2 = core.parseInt(core.substring(c2, 3, 5), 16)',
       '  b2 = core.parseInt(core.substring(c2, 5, 7), 16)',
       '  r = math.round(r1 * (1 - ratio) + r2 * ratio)',
       '  g = math.round(g1 * (1 - ratio) + g2 * ratio)',
       '  b = math.round(b1 * (1 - ratio) + b2 * ratio)',
       '  r = core.slice(core.toString((\'0\' + (r || 0), 16)), -2)',
       '  g = core.slice(core.toString((\'0\' + (g || 0), 16)), -2)',
       '  b = core.slice(core.toString((\'0\' + (b || 0), 16)), -2)',
       '  return(\'#\' + r + g + b)',
       '}']);
  var code = functionName + '(' + c1 + ', ' + c2 + ', ' + ratio + ')';
  return [code, Blockly.MaiaScript.ORDER_FUNCTION_CALL];
};
