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
 * @fileoverview Generating Portugol for Mat blocks.
 * @author roberto@souzamonteiro.com (Roberto Luiz Souza Monteiro)
 */
'use strict';

goog.provide('Blockly.Portugol.Mat');

goog.require('Blockly.Portugol');


Blockly.Portugol['math_number'] = function(block) {
  // Numeric value.
  var code = Number(block.getFieldValue('NUM'));
  var order = code >= 0 ? Blockly.Portugol.ORDER_ATOMIC :
              Blockly.Portugol.ORDER_UNARY_NEGATION;
  return [code, order];
};

Blockly.Portugol['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', Blockly.Portugol.ORDER_ADDITION],
    'MINUS': [' - ', Blockly.Portugol.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', Blockly.Portugol.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', Blockly.Portugol.ORDER_DIVISION],
    'POWER': [null, Blockly.Portugol.ORDER_COMMA]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.Portugol.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Portugol.valueToCode(block, 'B', order) || '0';
  var code;
  // Power in Portugol requires a special case since it has no operator.
  if (!operator) {
    code = 'Mat.potencia(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.Portugol['math_single'] = function(block) {
  // Mat operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.Portugol.valueToCode(block, 'NUM',
        Blockly.Portugol.ORDER_UNARY_NEGATION) || '0';
    if (arg[0] == '-') {
      // --3 is not legal in JS.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, Blockly.Portugol.ORDER_UNARY_NEGATION];
  }
  if (operator == 'SIN' || operator == 'COS' || operator == 'TAN') {
    arg = Blockly.Portugol.valueToCode(block, 'NUM',
        Blockly.Portugol.ORDER_DIVISION) || '0';
  } else {
    arg = Blockly.Portugol.valueToCode(block, 'NUM',
        Blockly.Portugol.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = 'Mat.abs(' + arg + ')';
      break;
    case 'ROOT':
      code = 'Mat.raiz(' + arg + ')';
      break;
    case 'LN':
      code = 'Mat.log(' + arg + ')';
      break;
    case 'EXP':
      code = 'Mat.exp(' + arg + ')';
      break;
    case 'POW10':
      code = 'Mat.potencia(10,' + arg + ')';
      break;
    case 'ROUND':
      code = 'Mat.arredonde(' + arg + ')';
      break;
    case 'ROUNDUP':
      code = 'Mat.teto(' + arg + ')';
      break;
    case 'ROUNDDOWN':
      code = 'Mat.piso(' + arg + ')';
      break;
    case 'SIN':
      code = 'Mat.seno(' + arg + ' / 180 * Mat.PI)';
      break;
    case 'COS':
      code = 'Mat.cosseno(' + arg + ' / 180 * Mat.PI)';
      break;
    case 'TAN':
      code = 'Mat.tangente(' + arg + ' / 180 * Mat.PI)';
      break;
  }
  if (code) {
    return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'LOG10':
      code = 'Mat.log(' + arg + ') / Mat.log(10)';
      break;
    case 'ASIN':
      code = 'Mat.arcoseno(' + arg + ') / Mat.PI * 180';
      break;
    case 'ACOS':
      code = 'Mat.arcocosseno(' + arg + ') / Mat.PI * 180';
      break;
    case 'ATAN':
      code = 'Mat.arcotangente(' + arg + ') / Mat.PI * 180';
      break;
    default:
      throw Error('Operador matemático desconhecido: ' + operator);
  }
  return [code, Blockly.Portugol.ORDER_DIVISION];
};

Blockly.Portugol['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    'PI': ['Mat.PI', Blockly.Portugol.ORDER_MEMBER],
    'E': ['Mat.E', Blockly.Portugol.ORDER_MEMBER],
    'GOLDEN_RATIO':
        ['(1 + Mat.raiz(5)) / 2', Blockly.Portugol.ORDER_DIVISION],
    'SQRT2': ['Mat.RAIZ2', Blockly.Portugol.ORDER_MEMBER],
    'SQRT1_2': ['Mat.RAIZ1_2', Blockly.Portugol.ORDER_MEMBER],
    'INFINITY': ['Infinito', Blockly.Portugol.ORDER_ATOMIC]
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

Blockly.Portugol['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.Portugol.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.Portugol.ORDER_MODULUS) || '0';
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    var functionName = Blockly.Portugol.provideFunction_(
        'ehPrimo',
        ['funcao ' + Blockly.Portugol.FUNCTION_NAME_PLACEHOLDER_ + '(n) {',
         '  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
         '  if (n == 2 || n == 3) {',
         '    retorne verdadeiro;',
         '  }',
         '  // Falso se n é NaN.',
         '  // E falso se n é divisivel por 2 ou 3.',
         '  if (ehNehN(n) || n <= 1 || n % 1 != 0 || n % 2 == 0 ||' +
            ' n % 3 == 0) {',
         '    retorne falso;',
         '  }',
         '  // CVerifique todos os números na forma 6k +/- 1, até raiz(n).',
         '  para (var x = 6; x <= Mat.raiz(n) + 1; x += 6) {',
         '    se (n % (x - 1) == 0 || n % (x + 1) == 0) {',
         '      retorne falso;',
         '    }',
         '  }',
         '  retorne verdadeiro;',
         '}']);
    code = functionName + '(' + number_to_check + ')';
    return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
  }
  switch (dropdown_property) {
    case 'EVEN':
      code = number_to_check + ' % 2 == 0';
      break;
    case 'ODD':
      code = number_to_check + ' % 2 == 1';
      break;
    case 'WHOLE':
      code = number_to_check + ' % 1 == 0';
      break;
    case 'POSITIVE':
      code = number_to_check + ' > 0';
      break;
    case 'NEGATIVE':
      code = number_to_check + ' < 0';
      break;
    case 'DIVISIBLE_BY':
      var divisor = Blockly.Portugol.valueToCode(block, 'DIVISOR',
          Blockly.Portugol.ORDER_MODULUS) || '0';
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.Portugol.ORDER_EQUALITY];
};

Blockly.Portugol['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.Portugol.valueToCode(block, 'DELTA',
      Blockly.Portugol.ORDER_ADDITION) || '0';
  var varName = Blockly.Portugol.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  return varName + ' = (tipode ' + varName + ' == \'numero\' ? ' + varName +
      ' : 0) + ' + argument0 + ';\n';
};

// Rounding functions have a single operand.
Blockly.Portugol['math_round'] = Blockly.Portugol['Mat_single'];
// Trigonometry functions have a single operand.
Blockly.Portugol['math_trig'] = Blockly.Portugol['Mat_single'];

Blockly.Portugol['math_on_list'] = function(block) {
  // Mat functions for lists.
  var func = block.getFieldValue('OP');
  var list, code;
  switch (func) {
    case 'SUM':
      list = Blockly.Portugol.valueToCode(block, 'LIST',
          Blockly.Portugol.ORDER_MEMBER) || '[]';
      code = 'Matriz.soma(' + list + ')';
      break;
    case 'MIN':
      list = Blockly.Portugol.valueToCode(block, 'LIST',
          Blockly.Portugol.ORDER_COMMA) || '[]';
      code = 'Matriz.min(' + list + ')';
      break;
    case 'MAX':
      list = Blockly.Portugol.valueToCode(block, 'LIST',
          Blockly.Portugol.ORDER_COMMA) || '[]';
      code = 'Matriz.max(' + list + ')';
      break;
    case 'AVERAGE':
      list = Blockly.Portugol.valueToCode(block, 'LIST',
          Blockly.Portugol.ORDER_COMMA) || '[]';
      code = 'Matriz.media(' + list + ')';
      break;
    case 'MEDIAN':
      list = Blockly.Portugol.valueToCode(block, 'LIST',
          Blockly.Portugol.ORDER_COMMA) || '[]';
      code = 'Matriz.mediana(' + list + ')';
      break;
    case 'MODE':
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1].
      var functionName = Blockly.Portugol.provideFunction_(
          'moda',
          ['funcao ' + Blockly.Portugol.FUNCTION_NAME_PLACEHOLDER_ +
              '(valores) {',
            '  var modos = [];',
            '  var contados = [];',
            '  var maxCount = 0;',
            '  para (var i = 0; i < values.tamanho; i++) {',
            '    var valor = valores[i];',
            '    var encontrado = falso;',
            '    var estaContagem;',
            '    para (var j = 0; j < contados.tamanho; j++) {',
            '      if (contados[j][0] === value) {',
            '        estaContagem = ++contados[j][1];',
            '        encontrado = verdadeiro;',
            '        pare;',
            '      }',
            '    }',
            '    se (!encontrado) {',
            '      contados.topo([valor, 1]);',
            '      estaContagem = 1;',
            '    }',
            '    maxCount = Mat.max(estaContagem, maxCount);',
            '  }',
            '  para (var j = 0; j < counts.tamanho; j++) {',
            '    se (contados[j][1] == maxCount) {',
            '        modos.topo(contados[j][0]);',
            '    }',
            '  }',
            '  retorne modos;',
            '}']);
      list = Blockly.Portugol.valueToCode(block, 'LIST',
          Blockly.Portugol.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'STD_DEV':
      list = Blockly.Portugol.valueToCode(block, 'LIST',
          Blockly.Portugol.ORDER_COMMA) || '[]';
      code = 'Matriz.desvio(' + list + ')';
      break;
    case 'RANDOM':
      var functionName = Blockly.Portugol.provideFunction_(
          'listaAleatoria',
          ['funcao ' + Blockly.Portugol.FUNCTION_NAME_PLACEHOLDER_ +
              '(lista) {',
            '  var x = Mat.piso(Mat.aleatorio() * lista.tamanho);',
            '  retorne lista[x];',
            '}']);
      list = Blockly.Portugol.valueToCode(block, 'LIST',
          Blockly.Portugol.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    default:
      throw Error('Operador desconhecido: ' + func);
  }
  return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
};

Blockly.Portugol['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.Portugol.valueToCode(block, 'DIVIDEND',
      Blockly.Portugol.ORDER_MODULUS) || '0';
  var argument1 = Blockly.Portugol.valueToCode(block, 'DIVISOR',
      Blockly.Portugol.ORDER_MODULUS) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.Portugol.ORDER_MODULUS];
};

Blockly.Portugol['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  var argument0 = Blockly.Portugol.valueToCode(block, 'VALUE',
      Blockly.Portugol.ORDER_COMMA) || '0';
  var argument1 = Blockly.Portugol.valueToCode(block, 'LOW',
      Blockly.Portugol.ORDER_COMMA) || '0';
  var argument2 = Blockly.Portugol.valueToCode(block, 'HIGH',
      Blockly.Portugol.ORDER_COMMA) || 'Infinity';
  var code = 'Mat.min(Mat.max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
};

Blockly.Portugol['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  var argument0 = Blockly.Portugol.valueToCode(block, 'FROM',
      Blockly.Portugol.ORDER_COMMA) || '0';
  var argument1 = Blockly.Portugol.valueToCode(block, 'TO',
      Blockly.Portugol.ORDER_COMMA) || '0';
  var functionName = Blockly.Portugol.provideFunction_(
      'inteiroAleatorio',
      ['funcao ' + Blockly.Portugol.FUNCTION_NAME_PLACEHOLDER_ +
          '(a, b) {',
       '  se (a > b) {',
       '    // Troca a e b para ter certeza de qual é o menor valor.',
       '    var c = a;',
       '    a = b;',
       '    b = c;',
       '  }',
       '  retorne Mat.piso(Mat.aleatorio() * (b - a + 1) + a);',
       '}']);
  var code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
};

Blockly.Portugol['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  return ['Mat.aleatorio()', Blockly.Portugol.ORDER_FUNCTION_CALL];
};

Blockly.Portugol['math_atan2'] = function(block) {
  // Arctangent of point (X, Y) in degrees from -180 to 180.
  var argument0 = Blockly.Portugol.valueToCode(block, 'X',
      Blockly.Portugol.ORDER_COMMA) || '0';
  var argument1 = Blockly.Portugol.valueToCode(block, 'Y',
      Blockly.Portugol.ORDER_COMMA) || '0';
  return ['Math.atan2(' + argument1 + ', ' + argument0 + ') / Mat.PI * 180',
      Blockly.Portugol.ORDER_DIVISION];
};
