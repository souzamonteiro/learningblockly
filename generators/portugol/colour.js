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
 * @fileoverview Generating Portugol for colour blocks.
 * @author roberto@souzamonteiro.com (Roberto Luiz Souza Monteiro)
*/
'use strict';

goog.provide('Blockly.Portugol.colour');

goog.require('Blockly.Portugol');


Blockly.Portugol['colour_picker'] = function(block) {
  // Colour picker.
  var code = Blockly.Portugol.quote_(block.getFieldValue('COLOUR'));
  return [code, Blockly.Portugol.ORDER_ATOMIC];
};

Blockly.Portugol['colour_random'] = function(block) {
  // Generate a random colour.
  var functionName = Blockly.Portugol.provideFunction_(
      'corAleatoria',
      ['funcao ' + Blockly.Portugol.FUNCTION_NAME_PLACEHOLDER_ + '() {',
        '  var num = Mat.piso(Mat.aleatorio() * Mat.potencia(2, 24));',
        '  retorne \'#\' + (\'00000\' + num.paraCadeia(16)).subcadeia(-6);',
        '}']);
  var code = functionName + '()';
  return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
};

Blockly.Portugol['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  var red = Blockly.Portugol.valueToCode(block, 'RED',
      Blockly.Portugol.ORDER_COMMA) || 0;
  var green = Blockly.Portugol.valueToCode(block, 'GREEN',
      Blockly.Portugol.ORDER_COMMA) || 0;
  var blue = Blockly.Portugol.valueToCode(block, 'BLUE',
      Blockly.Portugol.ORDER_COMMA) || 0;
  var functionName = Blockly.Portugol.provideFunction_(
      'corRgb',
      ['funcao ' + Blockly.Portugol.FUNCTION_NAME_PLACEHOLDER_ +
          '(r, g, b) {',
       '  r = Mat.max(Mat.min(Numero(r), 100), 0) * 2.55;',
       '  g = Mat.max(Mat.min(Numero(g), 100), 0) * 2.55;',
       '  b = Mat.max(Mat.min(Numero(b), 100), 0) * 2.55;',
       '  r = (\'0\' + (Mat.arredonde(r) || 0).paraCadeia(16)).fatia(-2);',
       '  g = (\'0\' + (Mat.arredonde(g) || 0).paraCadeia(16)).fatia(-2);',
       '  b = (\'0\' + (Mat.arredonde(b) || 0).paraCadeia(16)).fatia(-2);',
       '  retorne \'#\' + r + g + b;',
       '}']);
  var code = functionName + '(' + red + ', ' + green + ', ' + blue + ')';
  return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
};

Blockly.Portugol['colour_blend'] = function(block) {
  // Blend two colours together.
  var c1 = Blockly.Portugol.valueToCode(block, 'COLOUR1',
      Blockly.Portugol.ORDER_COMMA) || '\'#000000\'';
  var c2 = Blockly.Portugol.valueToCode(block, 'COLOUR2',
      Blockly.Portugol.ORDER_COMMA) || '\'#000000\'';
  var ratio = Blockly.Portugol.valueToCode(block, 'RATIO',
      Blockly.Portugol.ORDER_COMMA) || 0.5;
  var functionName = Blockly.Portugol.provideFunction_(
      'misturaDeCores',
      ['funcao ' + Blockly.Portugol.FUNCTION_NAME_PLACEHOLDER_ +
          '(c1, c2, razao) {',
       '  razao = Mat.max(Mat.min(Numero(razao), 1), 0);',
       '  var r1 = parseInt(c1.subcadeia(1, 3), 16);',
       '  var g1 = parseInt(c1.subcadeia(3, 5), 16);',
       '  var b1 = parseInt(c1.subcadeia(5, 7), 16);',
       '  var r2 = parseInt(c2.subcadeia(1, 3), 16);',
       '  var g2 = parseInt(c2.subcadeia(3, 5), 16);',
       '  var b2 = parseInt(c2.subcadeia(5, 7), 16);',
       '  var r = Mat.arredonde(r1 * (1 - razao) + r2 * razao);',
       '  var g = Mat.arredonde(g1 * (1 - razao) + g2 * razao);',
       '  var b = Mat.arredonde(b1 * (1 - razao) + b2 * razao);',
       '  r = (\'0\' + (r || 0).paraCadeia(16)).fatia(-2);',
       '  g = (\'0\' + (g || 0).paraCadeia(16)).fatia(-2);',
       '  b = (\'0\' + (b || 0).paraCadeia(16)).fatia(-2);',
       '  retorne \'#\' + r + g + b;',
       '}']);
  var code = functionName + '(' + c1 + ', ' + c2 + ', ' + ratio + ')';
  return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
};
