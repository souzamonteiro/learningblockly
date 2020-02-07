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
 * @fileoverview Helper functions for generating Portugol for blocks.
 * @author roberto@souzamonteiro.com (Roberto Luiz Souza Monteiro)
 */
'use strict';

goog.provide('Blockly.Portugol');

goog.require('Blockly.Generator');
goog.require('Blockly.utils.global');
goog.require('Blockly.utils.string');


/**
 * Portugol code generator.
 * @type {!Blockly.Generator}
 */
Blockly.Portugol = new Blockly.Generator('Portugol');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Portugol.addReservedWords(
    // https://developer.mozilla.org/en-US/docs/Web/Portugol/Reference/Lexical_grammar#Keywords
    'pare,caso,capture,classe,const,continue,debugger,default,apague,faca,senao,exporte,estenda,finally,para,funcao,se,importe,em,instanceof,novo,retorne,super,escolha,este,throw,tentar,typeof,var,void,enquanto,com,yield,' +
    'enum,' +
    'implementa,interface,deixe,pacote,privado,protegido,publico,estatico,' +
    'espere,' +
    'null,verdadeiro,falso,' +
    // Magic variable.
    'argumentos,' +
    // Everything in the current environment (835 items in Chrome, 104 in Node).
    Object.getOwnPropertyNames(Blockly.utils.global).join(','));

/**
 * Order of operation ENUMs.
 * https://developer.mozilla.org/en/Portugol/Reference/Operators/Operator_Precedence
 */
Blockly.Portugol.ORDER_ATOMIC = 0;           // 0 "" ...
Blockly.Portugol.ORDER_NEW = 1.1;            // new
Blockly.Portugol.ORDER_MEMBER = 1.2;         // . []
Blockly.Portugol.ORDER_FUNCTION_CALL = 2;    // ()
Blockly.Portugol.ORDER_INCREMENT = 3;        // ++
Blockly.Portugol.ORDER_DECREMENT = 3;        // --
Blockly.Portugol.ORDER_BITWISE_NOT = 4.1;    // ~
Blockly.Portugol.ORDER_UNARY_PLUS = 4.2;     // +
Blockly.Portugol.ORDER_UNARY_NEGATION = 4.3; // -
Blockly.Portugol.ORDER_LOGICAL_NOT = 4.4;    // !
Blockly.Portugol.ORDER_TYPEOF = 4.5;         // typeof
Blockly.Portugol.ORDER_VOID = 4.6;           // void
Blockly.Portugol.ORDER_DELETE = 4.7;         // delete
Blockly.Portugol.ORDER_AWAIT = 4.8;          // await
Blockly.Portugol.ORDER_EXPONENTIATION = 5.0; // **
Blockly.Portugol.ORDER_MULTIPLICATION = 5.1; // *
Blockly.Portugol.ORDER_DIVISION = 5.2;       // /
Blockly.Portugol.ORDER_MODULUS = 5.3;        // %
Blockly.Portugol.ORDER_SUBTRACTION = 6.1;    // -
Blockly.Portugol.ORDER_ADDITION = 6.2;       // +
Blockly.Portugol.ORDER_BITWISE_SHIFT = 7;    // << >> >>>
Blockly.Portugol.ORDER_RELATIONAL = 8;       // < <= > >=
Blockly.Portugol.ORDER_IN = 8;               // in
Blockly.Portugol.ORDER_INSTANCEOF = 8;       // instanceof
Blockly.Portugol.ORDER_EQUALITY = 9;         // == != === !==
Blockly.Portugol.ORDER_BITWISE_AND = 10;     // &
Blockly.Portugol.ORDER_BITWISE_XOR = 11;     // ^
Blockly.Portugol.ORDER_BITWISE_OR = 12;      // |
Blockly.Portugol.ORDER_LOGICAL_AND = 13;     // &&
Blockly.Portugol.ORDER_LOGICAL_OR = 14;      // ||
Blockly.Portugol.ORDER_CONDITIONAL = 15;     // ?:
Blockly.Portugol.ORDER_ASSIGNMENT = 16;      // = += -= **= *= /= %= <<= >>= ...
Blockly.Portugol.ORDER_YIELD = 17;           // yield
Blockly.Portugol.ORDER_COMMA = 18;           // ,
Blockly.Portugol.ORDER_NONE = 99;            // (...)

/**
 * List of outer-inner pairings that do NOT require parentheses.
 * @type {!Array.<!Array.<number>>}
 */
Blockly.Portugol.ORDER_OVERRIDES = [
  // (foo()).bar -> foo().bar
  // (foo())[0] -> foo()[0]
  [Blockly.Portugol.ORDER_FUNCTION_CALL, Blockly.Portugol.ORDER_MEMBER],
  // (foo())() -> foo()()
  [Blockly.Portugol.ORDER_FUNCTION_CALL, Blockly.Portugol.ORDER_FUNCTION_CALL],
  // (foo.bar).baz -> foo.bar.baz
  // (foo.bar)[0] -> foo.bar[0]
  // (foo[0]).bar -> foo[0].bar
  // (foo[0])[1] -> foo[0][1]
  [Blockly.Portugol.ORDER_MEMBER, Blockly.Portugol.ORDER_MEMBER],
  // (foo.bar)() -> foo.bar()
  // (foo[0])() -> foo[0]()
  [Blockly.Portugol.ORDER_MEMBER, Blockly.Portugol.ORDER_FUNCTION_CALL],

  // !(!foo) -> !!foo
  [Blockly.Portugol.ORDER_LOGICAL_NOT, Blockly.Portugol.ORDER_LOGICAL_NOT],
  // a * (b * c) -> a * b * c
  [Blockly.Portugol.ORDER_MULTIPLICATION, Blockly.Portugol.ORDER_MULTIPLICATION],
  // a + (b + c) -> a + b + c
  [Blockly.Portugol.ORDER_ADDITION, Blockly.Portugol.ORDER_ADDITION],
  // a && (b && c) -> a && b && c
  [Blockly.Portugol.ORDER_LOGICAL_AND, Blockly.Portugol.ORDER_LOGICAL_AND],
  // a || (b || c) -> a || b || c
  [Blockly.Portugol.ORDER_LOGICAL_OR, Blockly.Portugol.ORDER_LOGICAL_OR]
];

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.Portugol.init = function(workspace) {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.Portugol.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.Portugol.functionNames_ = Object.create(null);

  if (!Blockly.Portugol.variableDB_) {
    Blockly.Portugol.variableDB_ =
        new Blockly.Names(Blockly.Portugol.RESERVED_WORDS_);
  } else {
    Blockly.Portugol.variableDB_.reset();
  }

  Blockly.Portugol.variableDB_.setVariableMap(workspace.getVariableMap());

  var defvars = [];
  // Add developer variables (not created or named by the user).
  var devVarList = Blockly.Variables.allDeveloperVariables(workspace);
  for (var i = 0; i < devVarList.length; i++) {
    defvars.push(Blockly.Portugol.variableDB_.getName(devVarList[i],
        Blockly.Names.DEVELOPER_VARIABLE_TYPE));
  }

  // Add user variables, but only ones that are being used.
  var variables = Blockly.Variables.allUsedVarModels(workspace);
  for (var i = 0; i < variables.length; i++) {
    defvars.push(Blockly.Portugol.variableDB_.getName(variables[i].getId(),
        Blockly.VARIABLE_CATEGORY_NAME));
  }

  // Declare all of the variables.
  if (defvars.length) {
    Blockly.Portugol.definitions_['variables'] =
        'var ' + defvars.join(', ') + ';';
  }
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Portugol.finish = function(code) {
  // Convert the definitions dictionary into a list.
  var definitions = [];
  for (var name in Blockly.Portugol.definitions_) {
    definitions.push(Blockly.Portugol.definitions_[name]);
  }
  // Clean up temporary data.
  delete Blockly.Portugol.definitions_;
  delete Blockly.Portugol.functionNames_;
  Blockly.Portugol.variableDB_.reset();
  return definitions.join('\n\n') + '\n\n\n' + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Portugol.scrubNakedValue = function(line) {
  return line + ';\n';
};

/**
 * Encode a string as a properly escaped Portugol string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} Portugol string.
 * @private
 */
Blockly.Portugol.quote_ = function(string) {
  // Can't use goog.string.quote since Google's style guide recommends
  // JS string literals use single quotes.
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/'/g, '\\\'');
  return '\'' + string + '\'';
};

/**
 * Encode a string as a properly escaped multiline Portugol string, complete
 * with quotes.
 * @param {string} string Text to encode.
 * @return {string} Portugol string.
 * @private
 */
Blockly.Portugol.multiline_quote_ = function(string) {
  // Can't use goog.string.quote since Google's style guide recommends
  // JS string literals use single quotes.
  var lines = string.split(/\n/g).map(Blockly.Portugol.quote_);
  return lines.join(' + \'\\n\' +\n');
};

/**
 * Common tasks for generating Portugol from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Portugol code created for this block.
 * @param {boolean=} opt_thisOnly True to generate code for only this statement.
 * @return {string} Portugol code with comments and subsequent blocks added.
 * @private
 */
Blockly.Portugol.scrub_ = function(block, code, opt_thisOnly) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      comment = Blockly.utils.string.wrap(comment,
          Blockly.Portugol.COMMENT_WRAP - 3);
      commentCode += Blockly.Portugol.prefixLines(comment + '\n', '// ');
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          comment = Blockly.Portugol.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Portugol.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = opt_thisOnly ? '' : Blockly.Portugol.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

/**
 * Gets a property and adjusts the value while taking into account indexing.
 * @param {!Blockly.Block} block The block.
 * @param {string} atId The property ID of the element to get.
 * @param {number=} opt_delta Value to add.
 * @param {boolean=} opt_negate Whether to negate the value.
 * @param {number=} opt_order The highest order acting on this value.
 * @return {string|number}
 */
Blockly.Portugol.getAdjusted = function(block, atId, opt_delta, opt_negate,
    opt_order) {
  var delta = opt_delta || 0;
  var order = opt_order || Blockly.Portugol.ORDER_NONE;
  if (block.workspace.options.oneBasedIndex) {
    delta--;
  }
  var defaultAtIndex = block.workspace.options.oneBasedIndex ? '1' : '0';
  if (delta > 0) {
    var at = Blockly.Portugol.valueToCode(block, atId,
        Blockly.Portugol.ORDER_ADDITION) || defaultAtIndex;
  } else if (delta < 0) {
    var at = Blockly.Portugol.valueToCode(block, atId,
        Blockly.Portugol.ORDER_SUBTRACTION) || defaultAtIndex;
  } else if (opt_negate) {
    var at = Blockly.Portugol.valueToCode(block, atId,
        Blockly.Portugol.ORDER_UNARY_NEGATION) || defaultAtIndex;
  } else {
    var at = Blockly.Portugol.valueToCode(block, atId, order) ||
        defaultAtIndex;
  }

  if (Blockly.isNumber(at)) {
    // If the index is a naked number, adjust it right now.
    at = Number(at) + delta;
    if (opt_negate) {
      at = -at;
    }
  } else {
    // If the index is dynamic, adjust it in code.
    if (delta > 0) {
      at = at + ' + ' + delta;
      var innerOrder = Blockly.Portugol.ORDER_ADDITION;
    } else if (delta < 0) {
      at = at + ' - ' + -delta;
      var innerOrder = Blockly.Portugol.ORDER_SUBTRACTION;
    }
    if (opt_negate) {
      if (delta) {
        at = '-(' + at + ')';
      } else {
        at = '-' + at;
      }
      var innerOrder = Blockly.Portugol.ORDER_UNARY_NEGATION;
    }
    innerOrder = Math.floor(innerOrder);
    order = Math.floor(order);
    if (innerOrder && order >= innerOrder) {
      at = '(' + at + ')';
    }
  }
  return at;
};
