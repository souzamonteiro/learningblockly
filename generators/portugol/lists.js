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
 * @fileoverview Generating Portugol for list blocks.
 * @author roberto@souzamonteiro.com (Roberto Luiz Souza Monteiro)
 */
'use strict';

goog.provide('Blockly.Portugol.lists');

goog.require('Blockly.Portugol');


Blockly.Portugol['lists_create_empty'] = function(block) {
  // Create an empty list.
  return ['[]', Blockly.Portugol.ORDER_ATOMIC];
};

Blockly.Portugol['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.Portugol.valueToCode(block, 'ADD' + i,
        Blockly.Portugol.ORDER_COMMA) || 'null';
  }
  var code = '[' + elements.join(', ') + ']';
  return [code, Blockly.Portugol.ORDER_ATOMIC];
};

Blockly.Portugol['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  var functionName = Blockly.Portugol.provideFunction_(
      'repitaLista',
      ['funcao ' + Blockly.Portugol.FUNCTION_NAME_PLACEHOLDER_ +
          '(valor, n) {',
       '  var vetor = [];',
       '  para (var i = 0; i < n; i++) {',
       '    vetor[i] = valor;',
       '  }',
       '  retorne valor;',
       '}']);
  var element = Blockly.Portugol.valueToCode(block, 'ITEM',
      Blockly.Portugol.ORDER_COMMA) || 'null';
  var repeatCount = Blockly.Portugol.valueToCode(block, 'NUM',
      Blockly.Portugol.ORDER_COMMA) || '0';
  var code = functionName + '(' + element + ', ' + repeatCount + ')';
  return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
};

Blockly.Portugol['lists_length'] = function(block) {
  // String or array length.
  var list = Blockly.Portugol.valueToCode(block, 'VALUE',
      Blockly.Portugol.ORDER_MEMBER) || '[]';
  return [list + '.tamanho', Blockly.Portugol.ORDER_MEMBER];
};

Blockly.Portugol['lists_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var list = Blockly.Portugol.valueToCode(block, 'VALUE',
      Blockly.Portugol.ORDER_MEMBER) || '[]';
  return ['!' + list + '.tamanho', Blockly.Portugol.ORDER_LOGICAL_NOT];
};

Blockly.Portugol['lists_indexOf'] = function(block) {
  // Find an item in the list.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'indiceDe' : 'ultimoIndiceDe';
  var item = Blockly.Portugol.valueToCode(block, 'FIND',
      Blockly.Portugol.ORDER_NONE) || '\'\'';
  var list = Blockly.Portugol.valueToCode(block, 'VALUE',
      Blockly.Portugol.ORDER_MEMBER) || '[]';
  var code = list + '.' + operator + '(' + item + ')';
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', Blockly.Portugol.ORDER_ADDITION];
  }
  return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
};

Blockly.Portugol['lists_getIndex'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var listOrder = (where == 'RANDOM') ? Blockly.Portugol.ORDER_COMMA :
      Blockly.Portugol.ORDER_MEMBER;
  var list = Blockly.Portugol.valueToCode(block, 'VALUE', listOrder) || '[]';

  switch (where) {
    case ('FIRST'):
      if (mode == 'GET') {
        var code = list + '[0]';
        return [code, Blockly.Portugol.ORDER_MEMBER];
      } else if (mode == 'GET_REMOVE') {
        var code = list + '.shift()';
        return [code, Blockly.Portugol.ORDER_MEMBER];
      } else if (mode == 'REMOVE') {
        return list + '.insira();\n';
      }
      break;
    case ('LAST'):
      if (mode == 'GET') {
        var code = list + '.slice(-1)[0]';
        return [code, Blockly.Portugol.ORDER_MEMBER];
      } else if (mode == 'GET_REMOVE') {
        var code = list + '.remova()';
        return [code, Blockly.Portugol.ORDER_MEMBER];
      } else if (mode == 'REMOVE') {
        return list + '.remova();\n';
      }
      break;
    case ('FROM_START'):
      var at = Blockly.Portugol.getAdjusted(block, 'AT');
      if (mode == 'GET') {
        var code = list + '[' + at + ']';
        return [code, Blockly.Portugol.ORDER_MEMBER];
      } else if (mode == 'GET_REMOVE') {
        var code = list + '.fatia(' + at + ', 1)[0]';
        return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return list + '.fatia(' + at + ', 1);\n';
      }
      break;
    case ('FROM_END'):
      var at = Blockly.Portugol.getAdjusted(block, 'AT', 1, true);
      if (mode == 'GET') {
        var code = list + '.fatia(' + at + ')[0]';
        return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
      } else if (mode == 'GET_REMOVE') {
        var code = list + '.fatia(' + at + ', 1)[0]';
        return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return list + '.fatia(' + at + ', 1);';
      }
      break;
    case ('RANDOM'):
      var functionName = Blockly.Portugol.provideFunction_(
          'obtenhaUmItemAleatorioDaLista',
          ['funcao ' + Blockly.Portugol.FUNCTION_NAME_PLACEHOLDER_ +
              '(lista, remova) {',
           '  var x = Mat.piso(Mat.aleatorio() * lista.tamanho);',
           '  se (remova) {',
           '    retorne lista.fatia(x, 1)[0];',
           '  } senao {',
           '    retorne lista[x];',
           '  }',
           '}']);
      code = functionName + '(' + list + ', ' + (mode != 'GET') + ')';
      if (mode == 'GET' || mode == 'GET_REMOVE') {
        return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + ';\n';
      }
      break;
  }
  throw Error('Combinação não tratada (lists_getIndex).');
};

Blockly.Portugol['lists_setIndex'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var list = Blockly.Portugol.valueToCode(block, 'LIST',
      Blockly.Portugol.ORDER_MEMBER) || '[]';
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var value = Blockly.Portugol.valueToCode(block, 'TO',
      Blockly.Portugol.ORDER_ASSIGNMENT) || 'null';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  function cacheList() {
    if (list.match(/^\w+$/)) {
      return '';
    }
    var listVar = Blockly.Portugol.variableDB_.getDistinctName(
        'tmpList', Blockly.VARIABLE_CATEGORY_NAME);
    var code = 'var ' + listVar + ' = ' + list + ';\n';
    list = listVar;
    return code;
  }
  switch (where) {
    case ('FIRST'):
      if (mode == 'SET') {
        return list + '[0] = ' + value + ';\n';
      } else if (mode == 'INSERT') {
        return list + '.remova(' + value + ');\n';
      }
      break;
    case ('LAST'):
      if (mode == 'SET') {
        var code = cacheList();
        code += list + '[' + list + '.tamanho - 1] = ' + value + ';\n';
        return code;
      } else if (mode == 'INSERT') {
        return list + '.topo(' + value + ');\n';
      }
      break;
    case ('FROM_START'):
      var at = Blockly.Portugol.getAdjusted(block, 'AT');
      if (mode == 'SET') {
        return list + '[' + at + '] = ' + value + ';\n';
      } else if (mode == 'INSERT') {
        return list + '.fatia(' + at + ', 0, ' + value + ');\n';
      }
      break;
    case ('FROM_END'):
      var at = Blockly.Portugol.getAdjusted(block, 'AT', 1, false,
          Blockly.Portugol.ORDER_SUBTRACTION);
      var code = cacheList();
      if (mode == 'SET') {
        code += list + '[' + list + '.tamanho - ' + at + '] = ' + value + ';\n';
        return code;
      } else if (mode == 'INSERT') {
        code += list + '.fatia(' + list + '.tamanho - ' + at + ', 0, ' + value +
            ');\n';
        return code;
      }
      break;
    case ('RANDOM'):
      var code = cacheList();
      var xVar = Blockly.Portugol.variableDB_.getDistinctName(
          'tmpX', Blockly.VARIABLE_CATEGORY_NAME);
      code += 'var ' + xVar + ' = Mat.piso(Mat.aleatorio() * ' + list +
          '.tamanho);\n';
      if (mode == 'SET') {
        code += list + '[' + xVar + '] = ' + value + ';\n';
        return code;
      } else if (mode == 'INSERT') {
        code += list + '.fatia(' + xVar + ', 0, ' + value + ');\n';
        return code;
      }
      break;
  }
  throw Error('Combinação não tratada (lists_setIndex).');
};

/**
 * Returns an expression calculating the index into a list.
 * @param {string} listName Name of the list, used to calculate length.
 * @param {string} where The method of indexing, selected by dropdown in Blockly
 * @param {string=} opt_at The optional offset when indexing from start/end.
 * @return {string|undefined} Index expression.
 * @private
 */
Blockly.Portugol.lists.getIndex_ = function(listName, where, opt_at) {
  if (where == 'FIRST') {
    return '0';
  } else if (where == 'FROM_END') {
    return listName + '.length - 1 - ' + opt_at;
  } else if (where == 'LAST') {
    return listName + '.tamanho - 1';
  } else {
    return opt_at;
  }
};

Blockly.Portugol['lists_getSublist'] = function(block) {
  // Get sublist.
  var list = Blockly.Portugol.valueToCode(block, 'LIST',
      Blockly.Portugol.ORDER_MEMBER) || '[]';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = list + '.fatia(0)';
  } else if (list.match(/^\w+$/) ||
      (where1 != 'FROM_END' && where2 == 'FROM_START')) {
    // If the list is a variable or doesn't require a call for length, don't
    // generate a helper function.
    switch (where1) {
      case 'FROM_START':
        var at1 = Blockly.Portugol.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        var at1 = Blockly.Portugol.getAdjusted(block, 'AT1', 1, false,
            Blockly.Portugol.ORDER_SUBTRACTION);
        at1 = list + '.tamanho - ' + at1;
        break;
      case 'FIRST':
        var at1 = '0';
        break;
      default:
        throw Error('Opção não tratada (lists_getSublist).');
    }
    switch (where2) {
      case 'FROM_START':
        var at2 = Blockly.Portugol.getAdjusted(block, 'AT2', 1);
        break;
      case 'FROM_END':
        var at2 = Blockly.Portugol.getAdjusted(block, 'AT2', 0, false,
            Blockly.Portugol.ORDER_SUBTRACTION);
        at2 = list + '.tamanho - ' + at2;
        break;
      case 'LAST':
        var at2 = list + '.tamanho';
        break;
      default:
        throw Error('Opção não tratada (lists_getSublist).');
    }
    code = list + '.fatia(' + at1 + ', ' + at2 + ')';
  } else {
    var at1 = Blockly.Portugol.getAdjusted(block, 'AT1');
    var at2 = Blockly.Portugol.getAdjusted(block, 'AT2');
    var getIndex_ = Blockly.Portugol.lists.getIndex_;
    var wherePascalCase = {'FIRST': 'First', 'LAST': 'Last',
        'FROM_START': 'FromStart', 'FROM_END': 'FromEnd'};
    var functionName = Blockly.Portugol.provideFunction_(
        'subsequencia' + wherePascalCase[where1] + wherePascalCase[where2],
        ['funcao ' + Blockly.Portugol.FUNCTION_NAME_PLACEHOLDER_ +
            '(squencia' +
            // The value for 'FROM_END' and'FROM_START' depends on `at` so
            // we add it as a parameter.
            ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', at1' : '') +
            ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', at2' : '') +
            ') {',
          '  var inicio = ' + getIndex_('squencia', where1, 'at1') + ';',
          '  var fim = ' + getIndex_('squencia', where2, 'at2') + ' + 1;',
          '  retorne sequence.fatia(inicio, fim);',
          '}']);
    var code = functionName + '(' + list +
        // The value for 'FROM_END' and 'FROM_START' depends on `at` so we
        // pass it.
        ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', ' + at1 : '') +
        ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', ' + at2 : '') +
        ')';
  }
  return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
};

Blockly.Portugol['lists_sort'] = function(block) {
  // Block for sorting a list.
  var list = Blockly.Portugol.valueToCode(block, 'LIST',
      Blockly.Portugol.ORDER_FUNCTION_CALL) || '[]';
  var direction = block.getFieldValue('DIRECTION') === '1' ? 1 : -1;
  var type = block.getFieldValue('TYPE');
  var getCompareFunctionName = Blockly.Portugol.provideFunction_(
      'compareItensDaLista',
      ['funcao ' + Blockly.Portugol.FUNCTION_NAME_PLACEHOLDER_ +
          '(tipo, direcao) {',
       '  var compareFuncoes = {',
       '    "NUMERIC": funcao(a, b) {',
       '        retorne Numero(a) - Numero(b); },',
       '    "TEXT": funcao(a, b) {',
       '        retorne a.paraCadeia() > b.paraCadeia() ? 1 : -1; },',
       '    "IGNORE_CASE": funcao(a, b) {',
       '        retorne a.paraCadeia().paraMinusculas() > ' +
          'b.paraCadeia().paraMinusculas() ? 1 : -1; },',
       '  };',
       '  var compare = compareFuncoes[tipo];',
       '  retorne funcao(a, b) { retorne compare(a, b) * direcao; }',
       '}']);
  return [list + '.fatia().ordene(' +
      getCompareFunctionName + '("' + type + '", ' + direction + '))',
      Blockly.Portugol.ORDER_FUNCTION_CALL];
};

Blockly.Portugol['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  var input = Blockly.Portugol.valueToCode(block, 'INPUT',
      Blockly.Portugol.ORDER_MEMBER);
  var delimiter = Blockly.Portugol.valueToCode(block, 'DELIM',
      Blockly.Portugol.ORDER_NONE) || '\'\'';
  var mode = block.getFieldValue('MODE');
  if (mode == 'SPLIT') {
    if (!input) {
      input = '\'\'';
    }
    var functionName = 'split';
  } else if (mode == 'JOIN') {
    if (!input) {
      input = '[]';
    }
    var functionName = 'join';
  } else {
    throw Error('Modo desconhecido: ' + mode);
  }
  var code = input + '.' + functionName + '(' + delimiter + ')';
  return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
};

Blockly.Portugol['lists_reverse'] = function(block) {
  // Block for reversing a list.
  var list = Blockly.Portugol.valueToCode(block, 'LIST',
      Blockly.Portugol.ORDER_FUNCTION_CALL) || '[]';
  var code = list + '.fatia().reversa()';
  return [code, Blockly.Portugol.ORDER_FUNCTION_CALL];
};
