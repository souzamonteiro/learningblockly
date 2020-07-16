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
 * @fileoverview Generating MaiaScript for loop blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.MaiaScript.loops');

goog.require('Blockly.MaiaScript');


Blockly.MaiaScript['controls_repeat_ext'] = function(block) {
  // Repeat n times.
  if (block.getField('TIMES')) {
    // Internal number.
    var repeats = String(Number(block.getFieldValue('TIMES')));
  } else {
    // External number.
    var repeats = Blockly.MaiaScript.valueToCode(block, 'TIMES',
        Blockly.MaiaScript.ORDER_ASSIGNMENT) || '0';
  }
  var branch = Blockly.MaiaScript.statementToCode(block, 'DO');
  branch = Blockly.MaiaScript.addLoopTrap(branch, block);
  var code = '';
  var loopVar = Blockly.MaiaScript.variableDB_.getDistinctName(
      'count', Blockly.VARIABLE_CATEGORY_NAME);
  var endVar = repeats;
  if (!repeats.match(/^\w+$/) && !Blockly.isNumber(repeats)) {
    endVar = Blockly.MaiaScript.variableDB_.getDistinctName(
        'repeat_end', Blockly.VARIABLE_CATEGORY_NAME);
    code += endVar + ' = ' + repeats + '\n';
  }
  code += 'for (' + loopVar + ' = 0; ' +
      loopVar + ' < ' + endVar + '; ' +
      loopVar + ' = ' + loopVar + ' + 1) {\n' +
      branch + '}\n';
  return code;
};

Blockly.MaiaScript['controls_repeat'] =
    Blockly.MaiaScript['controls_repeat_ext'];

Blockly.MaiaScript['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.MaiaScript.valueToCode(block, 'BOOL',
      until ? Blockly.MaiaScript.ORDER_LOGICAL_NOT :
      Blockly.MaiaScript.ORDER_NONE) || 'false';
  var branch = Blockly.MaiaScript.statementToCode(block, 'DO');
  branch = Blockly.MaiaScript.addLoopTrap(branch, block);
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

Blockly.MaiaScript['controls_for'] = function(block) {
  // For loop.
  var variable0 = Blockly.MaiaScript.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  var argument0 = Blockly.MaiaScript.valueToCode(block, 'FROM',
      Blockly.MaiaScript.ORDER_ASSIGNMENT) || '0';
  var argument1 = Blockly.MaiaScript.valueToCode(block, 'TO',
      Blockly.MaiaScript.ORDER_ASSIGNMENT) || '0';
  var increment = Blockly.MaiaScript.valueToCode(block, 'BY',
      Blockly.MaiaScript.ORDER_ASSIGNMENT) || '1';
  var branch = Blockly.MaiaScript.statementToCode(block, 'DO');
  branch = Blockly.MaiaScript.addLoopTrap(branch, block);
  var code;
  if (Blockly.isNumber(argument0) && Blockly.isNumber(argument1) &&
      Blockly.isNumber(increment)) {
    // All arguments are simple numbers.
    var up = Number(argument0) <= Number(argument1);
    code = 'for (' + variable0 + ' = ' + argument0 + '; ' +
        variable0 + (up ? ' <= ' : ' >= ') + argument1 + '; ' +
        variable0;
    var step = Math.abs(Number(increment));
    if (step == 1) {
      code += up ? ' = ' + variable0 + ' + 1': ' = ' + variable0 + ' - 1';
    } else {
      code += (up ? ' = ' + variable0 + ' + ' :  ' = ' + variable0 + ' - ') + step;
    }
    code += ') {\n' + branch + '}\n';
  } else {
    code = '';
    // Cache non-trivial values to variables to prevent repeated look-ups.
    var startVar = argument0;
    if (!argument0.match(/^\w+$/) && !Blockly.isNumber(argument0)) {
      startVar = Blockly.MaiaScript.variableDB_.getDistinctName(
          variable0 + '_start', Blockly.VARIABLE_CATEGORY_NAME);
      code += startVar + ' = ' + argument0 + '\n';
    }
    var endVar = argument1;
    if (!argument1.match(/^\w+$/) && !Blockly.isNumber(argument1)) {
      endVar = Blockly.MaiaScript.variableDB_.getDistinctName(
          variable0 + '_end', Blockly.VARIABLE_CATEGORY_NAME);
      code += endVar + ' = ' + argument1 + '\n';
    }
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    var incVar = Blockly.MaiaScript.variableDB_.getDistinctName(
        variable0 + '_inc', Blockly.VARIABLE_CATEGORY_NAME);
    code += incVar + ' = ';
    if (Blockly.isNumber(increment)) {
      code += Math.abs(increment) + '\n';
    } else {
      code += 'math.abs(' + increment + ')\n';
    }
    code += 'if (' + startVar + ' > ' + endVar + ') {\n';
    code += Blockly.MaiaScript.INDENT + incVar + ' = -' + incVar + '\n';
    code += '}\n';
    code += 'for (' + variable0 + ' = ' + startVar + '; ' +
        incVar + ' >= 0 ? ' +
        variable0 + ' <= ' + endVar + ' : ' +
        variable0 + ' >= ' + endVar + '; ' +
        variable0 + ' = ' + variable0 + ' + ' + incVar + ') {\n' +
        branch + '}\n';
  }
  return code;
};

Blockly.MaiaScript['controls_forEach'] = function(block) {
  // For each loop.
  var variable0 = Blockly.MaiaScript.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  var argument0 = Blockly.MaiaScript.valueToCode(block, 'LIST',
      Blockly.MaiaScript.ORDER_ASSIGNMENT) || '[]';
  var branch = Blockly.MaiaScript.statementToCode(block, 'DO');
  branch = Blockly.MaiaScript.addLoopTrap(branch, block);
  var code = '';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  var listVar = argument0;
  if (!argument0.match(/^\w+$/)) {
    listVar = Blockly.MaiaScript.variableDB_.getDistinctName(
        variable0 + '_list', Blockly.VARIABLE_CATEGORY_NAME);
    code += listVar + ' = ' + argument0 + '\n';
  }
  var indexVar = Blockly.MaiaScript.variableDB_.getDistinctName(
      variable0 + '_index', Blockly.VARIABLE_CATEGORY_NAME);
  branch = Blockly.MaiaScript.INDENT + variable0 + ' = ' +
      listVar + '[' + indexVar + '];\n' + branch;
  code += 'foreach (' + listVar + '; ' + indexVar + '; value) {\n' + branch + '}\n';
  return code;
};

Blockly.MaiaScript['controls_flow_statements'] = function(block) {
  // Flow statements: continue, break.
  var xfix = '';
  if (Blockly.MaiaScript.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    xfix += Blockly.MaiaScript.injectId(Blockly.MaiaScript.STATEMENT_PREFIX,
        block);
  }
  if (Blockly.MaiaScript.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the break/continue is triggered.
    xfix += Blockly.MaiaScript.injectId(Blockly.MaiaScript.STATEMENT_SUFFIX,
        block);
  }
  if (Blockly.MaiaScript.STATEMENT_PREFIX) {
    var loop = Blockly.Constants.Loops
        .CONTROL_FLOW_IN_LOOP_CHECK_MIXIN.getSurroundLoop(block);
    if (loop && !loop.suppressPrefixSuffix) {
      // Inject loop's statement prefix here since the regular one at the end
      // of the loop will not get executed if 'continue' is triggered.
      // In the case of 'break', a prefix is needed due to the loop's suffix.
      xfix += Blockly.MaiaScript.injectId(Blockly.MaiaScript.STATEMENT_PREFIX,
          loop);
    }
  }
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return xfix + 'break\n';
    case 'CONTINUE':
      return xfix + 'continue\n';
  }
  throw Error('Unknown flow statement.');
};
