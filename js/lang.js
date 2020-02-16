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

Lang = {
    "languages": {},
    "code": {},
    "msg": {}
}

// The supported languages.
Lang.languages = {
    "de": "Deutsche</option",
    "en": "English</option",
    "es": "Español</option",
    "fr": "Française</option",
    "it": "Italiano</option",
    "pt-br": "Português</option"
}

// Add supported languages to menu.
select = document.getElementById('language');

for (var langCode in Lang.languages) {
    var optiom = document.createElement('option');
    optiom.value = langCode;
    optiom.innerHTML = Lang.languages[langCode];
    select.appendChild(optiom);
}

// get the stored language.
if (localStorage.getItem("language") != undefined) {
    Lang.code = localStorage.getItem("language");
} else {
    Lang.code = 'en';
}

// Set messages to each supported language.
if (Lang.code == 'de') {
    Lang.msg = {
        "CAT_LOGIC": "Logik",
        "CAT_LOOPS": "Schleifen",
        "CAT_MATH": "Mathematik",
        "CAT_TEXT": "Text",
        "CAT_LISTS": "Listen",
        "CAT_COLOUR": "Farbe",
        "CAT_VARIABLES": "Variablen",
        "CAT_FUNCTIONS": "Funktionen",
    }
} else if (Lang.code == 'en') {
    Lang.msg = {
        "CAT_LOGIC": "Logic",
        "CAT_LOOPS": "Loops",
        "CAT_MATH": "Math",
        "CAT_TEXT": "Text",
        "CAT_LISTS": "Lists",
        "CAT_COLOUR": "Colour",
        "CAT_VARIABLES": "Variables",
        "CAT_FUNCTIONS": "Functions"
    }
} else if (Lang.code == 'es') {
    Lang.msg = {
        "CAT_LOGIC": "Lógica",
        "CAT_LOOPS": "Secuencias",
        "CAT_MATH": "Matemáticas",
        "CAT_TEXT": "Texto",
        "CAT_LISTS": "Listas",
        "CAT_COLOUR": "Color",
        "CAT_VARIABLES": "Variables",
        "CAT_FUNCTIONS": "Funciones",
    }
} else if (Lang.code == 'fr') {
    Lang.msg = {
        "CAT_LOGIC": "Logique",
        "CAT_LOOPS": "Boucles",
        "CAT_MATH": "Math",
        "CAT_TEXT": "Texte",
        "CAT_LISTS": "Listes",
        "CAT_COLOUR": "Couleur",
        "CAT_VARIABLES": "Variables",
        "CAT_FUNCTIONS": "Fonctions",
    }
} else if (Lang.code == 'it') {
    Lang.msg = {
        "CAT_LOGIC": "Logica",
        "CAT_LOOPS": "Cicli",
        "CAT_MATH": "Matematica",
        "CAT_TEXT": "Testo",
        "CAT_LISTS": "Elenchi",
        "CAT_COLOUR": "Colore",
        "CAT_VARIABLES": "Variabili",
        "CAT_FUNCTIONS": "Funzioni",
    }
} else if (Lang.code == 'pt-br') {
    Lang.msg = {
        "CAT_LOGIC": "Lógica",
        "CAT_LOOPS": "Laços",
        "CAT_MATH": "Matemática",
        "CAT_TEXT": "Texto",
        "CAT_LISTS": "Listas",
        "CAT_COLOUR": "Cor",
        "CAT_VARIABLES": "Variáveis",
        "CAT_FUNCTIONS": "Funções",
    }
} else {
    Lang.msg = {
        "CAT_LOGIC": "Logic",
        "CAT_LOOPS": "Loops",
        "CAT_MATH": "Math",
        "CAT_TEXT": "Text",
        "CAT_LISTS": "Lists",
        "CAT_COLOUR": "Colour",
        "CAT_VARIABLES": "Variables",
        "CAT_FUNCTIONS": "Functions"
    }
}