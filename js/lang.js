try {
    lang = localStorage.getItem("language");
} catch {
    lang = 'en';
}

if (lang == 'de') {
    MSG = {
        catLogic: "Logik",
        catLoops: "Schleifen",
        catMath: "Mathematik",
        catText: "Text",
        catLists: "Listen",
        catColour: "Farbe",
        catVariables: "Variablen",
        catFunctions: "Funktionen",
    }
} else if (lang == 'en') {
    MSG = {
        catLogic: "Logic",
        catLoops: "Loops",
        catMath: "Math",
        catText: "Text",
        catLists: "Lists",
        catColour: "Colour",
        catVariables: "Variables",
        catFunctions: "Functions"
    }
} else if (lang == 'es') {
    MSG = {
        catLogic: "Lógica",
        catLoops: "Secuencias",
        catMath: "Matemáticas",
        catText: "Texto",
        catLists: "Listas",
        catColour: "Color",
        catVariables: "Variables",
        catFunctions: "Funciones",
    }
} else if (lang == 'fr') {
    MSG = {
        catLogic: "Logique",
        catLoops: "Boucles",
        catMath: "Math",
        catText: "Texte",
        catLists: "Listes",
        catColour: "Couleur",
        catVariables: "Variables",
        catFunctions: "Fonctions",
    }
} else if (lang == 'it') {
    MSG = {
        catLogic: "Logica",
        catLoops: "Cicli",
        catMath: "Matematica",
        catText: "Testo",
        catLists: "Elenchi",
        catColour: "Colore",
        catVariables: "Variabili",
        catFunctions: "Funzioni",
    }
} else if (lang == 'pt-br') {
    MSG = {
        catLogic: "Lógica",
        catLoops: "Laços",
        catMath: "Matemática",
        catText: "Texto",
        catLists: "Listas",
        catColour: "Cor",
        catVariables: "Variáveis",
        catFunctions: "Funções",
    }
} else {
    MSG = {
        catLogic: "Logic",
        catLoops: "Loops",
        catMath: "Math",
        catText: "Text",
        catLists: "Lists",
        catColour: "Colour",
        catVariables: "Variables",
        catFunctions: "Functions"
    }
}