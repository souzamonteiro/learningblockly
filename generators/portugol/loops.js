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
 * @fileoverview Generating Portugol for loop blocks.
 * @author roberto@souzamonteiro.com (Roberto Luiz Souza Monteiro)
 */
'use strict';

goog.provide('Blockly.Portugol.loops');

goog.require('Blockly.Portugol');


Blockly.Portugol['controls_repeat_ext'] = function(block) {
  // Repeat n times.
  if (block.getField('TIMES')) {
    // Internal number.
    var repeats = String(Number(block.getFieldValue('TIMES')));
  } else {
    // External number.
    var repeats = Blockly.Portugol.valueToCode(block, 'TIMES',
        Blockly.Portugol.ORDER_ASSIGNMENT) || '0';
  }
  var branch = Blockly.Portugol.statementToCode(block, 'DO');
  branch = Blockly.Portugol.addLoopTrap(branch, block);
  var code = '';
  var loopVar = Blockly.Portugol.variableDB_.getDistinctName(
      'countador', Blockly.VARIABLE_CATEGORY_NAME);
  var endVar = repeats;
  if (!repeats.match(/^\w+$/) && !Blockly.isNumber(repeats)) {
    endVar = Blockly.Portugol.variableDB_.getDistinctName(
        'repeat_end', Blockly.VARIABLE_CATEGORY_NAME);
    code += 'var ' + endVar + ' = ' + repeats + ';\n';
  }
  code += 'para (var ' + loopVar + ' = 0; ' +
      loopVar + ' < ' + endVar + '; ' +
      loopVar + '++) {\n' +
      branch + '}\n';
  return code;
};

Blockly.Portugol['controls_repeat'] =
    Blockly.Portugol['controls_repeat_ext'];

Blockly.Portugol['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.Portugol.valueToCode(block, 'BOOL',
      until ? Blockly.Portugol.ORDER_LOGICAL_NOT :
      Blockly.Portugol.ORDER_NONE) || 'false';
  var branch = Blockly.Portugol.statementToCode(block, 'DO');
  branch = Blockly.Portugol.addLoopTrap(branch, block);
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'enquanto (' + argument0 + ') {\n' + branch + '}\n';
};

Blockly.Portugol['controls_for'] = function(block) {
  // For loop.
  var variable0 = Blockly.Portugol.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  var argument0 = Blockly.Portugol.valueToCode(block, 'FROM',
      Blockly.Portugol.ORDER_ASSIGNMENT) || '0';
  var argument1 = Blockly.Portugol.valueToCode(block, 'TO',
      Blockly.Portugol.ORDER_ASSIGNMENT) || '0';
  var increment = Blockly.Portugol.valueToCode(block, 'BY',
      Blockly.Portugol.ORDER_ASSIGNMENT) || '1';
  var branch = Blockly.Portugol.statementToCode(block, 'DO');
  branch = Blockly.Portugol.addLoopTrap(branch, block);
  var code;
  if (Blockly.isNumber(argument0) && Blockly.isNumber(argument1) &&
      Blockly.isNumber(increment)) {
    // All arguments are simple numbers.
    var up = Number(argument0) <= Number(argument1);
    code = 'para (' + variable0 + ' = ' + argument0 + '; ' +
        variable0 + (up ? ' <= ' : ' >= ') + argument1 + '; ' +
        variable0;
    var step = Math.abs(Number(increment));
    if (step == 1) {
      code += up ? '++' : '--';
    } else {
      code += (up ? ' += ' : ' -= ') + step;
    }
    code += ') {\n' + branch + '}\n';
  } else {
    code = '';
    // Cache non-trivial values to variables to prevent repeated look-ups.
    var startVar = argument0;
    if (!argument0.match(/^\w+$/) && !Blockly.isNumber(argument0)) {
      startVar = Blockly.Portugol.variableDB_.getDistinctName(
          variable0 + '_start', Blockly.VARIABLE_CATEGORY_NAME);
      code += 'var ' + startVar + ' = ' + argument0 + ';\n';
    }
    var endVar = argument1;
    if (!argument1.match(/^\w+$/) && !Blockly.isNumber(argument1)) {
      endVar = Blockly.Portugol.variableDB_.getDistinctName(
          variable0 + '_end', Blockly.VARIABLE_CATEGORY_NAME);
      code += 'var ' + endVar + ' = ' + argument1 + ';\n';
    }
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    var incVar = Blockly.Portugol.variableDB_.getDistinctName(
        variable0 + '_inc', Blockly.VARIABLE_CATEGORY_NAME);
    code += 'var ' + incVar + ' = ';
    if (Blockly.isNumber(increment)) {
      code += Math.abs(increment) + ';\n';
    } else {
      code += 'Mat.abs(' + increment + ');\n';
    }
    code += 'se (' + startVar + ' > ' + endVar + ') {\n';
    code += Blockly.Portugol.INDENT + incVar + ' = -' + incVar + ';\n';
    code += '}\n';
    code += 'para (' + variable0 + ' = ' + startVar + '; ' +
        incVar + ' >= 0 ? ' +
        variable0 + ' <= ' + endVar + ' : ' +
        variable0 + ' >= ' + endVar + '; ' +
        variable0 + ' += ' + incVar + ') {\n' +
        branch + '}\n';
  }
  return code;
};

Blockly.Portugol['controls_forEach'] = function(block) {
  // For each loop.
  var variable0 = Blockly.Portugol.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  var argument0 = Blockly.Portugol.valueToCode(block, 'LIST',
      Blockly.Portugol.ORDER_ASSIGNMENT) || '[]';
  var branch = Blockly.Portugol.statementToCode(block, 'DO');
  branch = Blockly.Portugol.addLoopTrap(branch, block);
  var code = '';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  var listVar = argument0;
  if (!argument0.match(/^\w+$/)) {
    listVar = Blockly.Portugol.variableDB_.getDistinctName(
        variable0 + '_list', Blockly.VARIABLE_CATEGORY_NAME);
    code += 'var ' + listVar + ' = ' + argument0 + ';\n';
  }
  var indexVar = Blockly.Portugol.variableDB_.getDistinctName(
      variable0 + '_index', Blockly.VARIABLE_CATEGORY_NAME);
  branch = Blockly.Portugol.INDENT + variable0 + ' = ' +
      listVar + '[' + indexVar + '];\n' + branch;
  code += 'para (var ' + indexVar + ' em ' + listVar + ') {\n' + branch + '}\n';
  return code;
};

Blockly.Portugol['controls_flow_statements'] = function(block) {
  // Flow statements: continue, break.
  var xfix = '';
  if (Blockly.Portugol.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    xfix += Blockly.Portugol.injectId(Blockly.Portugol.STATEMENT_PREFIX,
        block);
  }
  if (Blockly.Portugol.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the break/continue is triggered.
    xfix += Blockly.Portugol.injectId(Blockly.Portugol.STATEMENT_SUFFIX,
        block);
  }
  if (Blockly.Portugol.STATEMENT_PREFIX) {
    var loop = Blockly.Constants.Loops
        .CONTROL_FLOW_IN_LOOP_CHECK_MIXIN.getSurroundLoop(block);
    if (loop && !loop.suppressPrefixSuffix) {
      // Inject loop's statement prefix here since the regular one at the end
      // of the loop will not get executed if 'continue' is triggered.
      // In the case of 'break', a prefix is needed due to the loop's suffix.
      xfix += Blockly.Portugol.injectId(Blockly.Portugol.STATEMENT_PREFIX,
          loop);
    }
  }
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return xfix + 'pare;\n';
    case 'CONTINUE':
      return xfix + 'continue;\n';
  }
  throw Error('Fluxo de declarações desconhecido.');
};
