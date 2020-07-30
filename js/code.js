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

// Load de message catalog.
for (var messageKey in Lang.msg) {
    Blockly.Msg[messageKey] = Lang.msg[messageKey];
}

// Construct the toolbox XML, replacing translated variable names.
var toolboxText = document.getElementById('toolbox').outerHTML;
toolboxText = toolboxText.replace(/(^|[^%]){(\w+)}/g, function(m, p1, p2) {return p1 + Lang.msg[p2];});
var toolboxXml = Blockly.Xml.textToDom(toolboxText);

// Create the workspace.
var workspace = Blockly.inject('blocklyDiv', {toolbox: document.getElementById('toolbox'),
    grid: {spacing: 20, length: 3, colour: '#ccc', snap: true},
    zoom: {controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2},
    trashcan: true,  media: 'static/media/'});

// Convert Unicode caracters to Latin1.
function base64EncodeUnicode(str) {
    // First we escape the string using encodeURIComponent to get the UTF-8 encoding of the characters, 
    // then we convert the percent encodings into raw bytes, and finally feed it to btoa() function.
    utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
    });

    return btoa(utf8Bytes);
}
// Generate code.
function updateCode(event) {
    var lang1 = document.getElementById('lang1');
    var lang1code = document.getElementById('lang1code');
    var lang2 = document.getElementById('lang2');
    var lang2code = document.getElementById('lang2code');

    if (lang1.value == "dart") {
        var code1 = Blockly.Dart.workspaceToCode(workspace);
        lang1code.innerHTML = PR.prettyPrintOne(code1, 'dart');
    } else if (lang1.value == "javascript") {
        var code1 = Blockly.JavaScript.workspaceToCode(workspace);
        lang1code.innerHTML = PR.prettyPrintOne(code1, 'javascript');
    } else if (lang1.value == "lua") {
        var code1 = Blockly.Lua.workspaceToCode(workspace);
        lang1code.innerHTML = PR.prettyPrintOne(code1, 'lua');
    } else if (lang1.value == "maiascript") {
        var code1 = Blockly.MaiaScript.workspaceToCode(workspace);
        lang1code.innerHTML = PR.prettyPrintOne(code1, 'maiascript');
    } else if (lang1.value == "php") {
        var code1 = Blockly.PHP.workspaceToCode(workspace);
        lang1code.innerHTML = PR.prettyPrintOne(code1, 'php');
    } else if (lang1.value == "portugol") {
        var code1 = Blockly.Portugol.workspaceToCode(workspace);
        lang1code.innerHTML = PR.prettyPrintOne(code1, 'portugol');
    } else if (lang1.value == "python") {
        var code1 = Blockly.Python.workspaceToCode(workspace);
        lang1code.innerHTML = PR.prettyPrintOne(code1, 'python');
    } else {
        lang1code.innerHTML = ""
    }

    if (lang2.value == "dart") {
        var code2 = Blockly.Dart.workspaceToCode(workspace);
        lang2code.innerHTML = PR.prettyPrintOne(code2, 'dart');
    } else if (lang2.value == "javascript") {
        var code2 = Blockly.JavaScript.workspaceToCode(workspace);
        lang2code.innerHTML = PR.prettyPrintOne(code2, 'javascript');
    } else if (lang2.value == "lua") {
        var code2 = Blockly.Lua.workspaceToCode(workspace);
        lang2code.innerHTML = PR.prettyPrintOne(code2, 'lua');
    } else if (lang2.value == "maiascript") {
        var code2 = Blockly.MaiaScript.workspaceToCode(workspace);
        lang2code.innerHTML = PR.prettyPrintOne(code2, 'maiascript');
    } else if (lang2.value == "php") {
        var code2 = Blockly.PHP.workspaceToCode(workspace);
        lang2code.innerHTML = PR.prettyPrintOne(code2, 'php');
    } else if (lang2.value == "portugol") {
        var code2 = Blockly.Portugol.workspaceToCode(workspace);
        lang2code.innerHTML = PR.prettyPrintOne(code2, 'portugol');
    } else if (lang2.value == "python") {
        var code2 = Blockly.Python.workspaceToCode(workspace);
        lang2code.innerHTML = PR.prettyPrintOne(code2, 'python');
    } else {
        lang2code.innerHTML = ""
    }
}
workspace.addChangeListener(updateCode);

// Create new document, clear document, download document, upload document and run document.
function newWorkspace() {
    var win = window.open("index.html", "", "");
}
function clearWorkspace() {
    var msg = Blockly.Msg["CLEAN_UP"] + "?";
    var res = confirm(msg);

    if (res == true) {
        Blockly.mainWorkspace.clear();
    }
}

function downloadXml() {
    var code = Blockly.MaiaScript.workspaceToCode(workspace);
    lang1code.innerHTML = PR.prettyPrintOne(code, 'maiascript');
    
    var uri = 'data:text/xml;charset=utf-8;base64,' + base64EncodeUnicode(xmlText);
    var downloadLink = document.createElement("a");

    downloadLink.href = uri;
    downloadLink.download = "untitled.xml";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}
function uploadXml() {
    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => { 
        var file = e.target.files[0]; 
        var reader = new FileReader();
        reader.readAsText(file,'UTF-8');
        reader.onload = readerEvent => {
            var xmlText = readerEvent.target.result;
            Blockly.mainWorkspace.clear();
            var xmlDom = Blockly.Xml.textToDom(xmlText);
            Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xmlDom);
        }
    }
    input.click();
}

function downloadCode1() {
    var lang = document.getElementById('lang1').value;
    if (lang == "dart") {
        var ext = "dart"
    } else if (lang == "javascript") {
        var ext = "js"
    } else if (lang == "lua") {
        var ext = "lua"
    } else if (lang == "maiascript") {
        var ext = "maia"
    } else if (lang == "php") {
        var ext = "php"
    } else if (lang == "portugol") {
        var ext = "por"
    } else if (lang == "python") {
        var ext = "py"
    } else {
        var ext = "txt"
    }

    var code = document.getElementById('lang1code').innerText;
    var uri = 'data:text/plain;charset=utf-8;base64,' + base64EncodeUnicode(code);
    var downloadLink = document.createElement("a");
    
    downloadLink.href = uri;
    downloadLink.download = "untitled." + ext;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}
function downloadCode2() {
    var lang = document.getElementById('lang2').value;
    if (lang == "dart") {
        var ext = "dart"
    } else if (lang == "javascript") {
        var ext = "js"
    } else if (lang == "lua") {
        var ext = "lua"
    } else if (lang == "maiascript") {
        var ext = "maia"
    } else if (lang == "php") {
        var ext = "php"
    } else if (lang == "portugol") {
        var ext = "por"
    } else if (lang == "python") {
        var ext = "py"
    } else {
        var ext = "txt"
    }

    var code = document.getElementById('lang2code').innerText;
    var uri = 'data:text/plain;charset=utf-8;base64,' + base64EncodeUnicode(code);
    var downloadLink = document.createElement("a");

    downloadLink.href = uri;
    downloadLink.download = "untitled." + ext;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}
function exportMaia() {
    var code = Blockly.MaiaScript.workspaceToCode(workspace);
    localStorage.setItem('maiascript.maia', code);
    localStorage.setItem('editorMode', 'maia');

    var win = window.open("http://www.maiastudio.com.br/index.html", "", "");
}

function initInterpreter(interpreter, scope) {
    var wrapper = function(text) {
        return alert(arguments.length ? text : '');
    };
    interpreter.setProperty(scope, 'alert', interpreter.createNativeFunction(wrapper));

    var wrapper = function(text) {
        return prompt(arguments.length ? text : '');
    };
    interpreter.setProperty(scope, 'prompt', interpreter.createNativeFunction(wrapper));                                
}
function runJs() {
    var code = Blockly.JavaScript.workspaceToCode(workspace);
    var interp = new Interpreter(code, initInterpreter);
    interp.run();
}

// Backup and restore workspace.
function saveWorkspace() {
    var xmlDom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    var xmlText = Blockly.Xml.domToPrettyText(xmlDom);

    localStorage.setItem("blockly.xml", xmlText);
    localStorage.setItem("language", document.getElementById('language').value);
    localStorage.setItem("lang1", document.getElementById('lang1').value);
    localStorage.setItem("lang2", document.getElementById('lang2').value);
}
function loadWorkspace() {
    if (typeof localStorage.getItem("blockly.xml") != 'undefined') {
        var xmlText = localStorage.getItem("blockly.xml");
        if (xmlText) {
            Blockly.mainWorkspace.clear();
            var xmlDom = Blockly.Xml.textToDom(xmlText);
            Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xmlDom);
        }
    }

    if (typeof localStorage.getItem("language") != 'undefined') {
        document.getElementById('language').value = localStorage.getItem("language");
    } else {
        document.getElementById('language').value = "en";
    }
    if (typeof localStorage.getItem("lang1") != 'undefined') {
        document.getElementById('lang1').value = localStorage.getItem("lang1");
    } else {
        document.getElementById('lang1').value = "javascript";
    }
    if (typeof localStorage.getItem("lang2") != 'undefined') {
        document.getElementById('lang2').value = localStorage.getItem("lang2");
    } else {
        document.getElementById('lang2').value = "javascript";
    }
    
    document.write('<script src="msg/js/' + document.getElementById('language').value + '.js"></script>\n');
}

function aboutApp() {
    var copyright = "Copyright (C) Roberto Luiz Souza Monteiro,\nRenata Souza Barreto,\nHernane Barrros de Borges Pereira.\n\nwww.maiascript.com";
    
    alert(copyright);
}

// Save the workspace on unload.
window.addEventListener("unload", function(event) {
    saveWorkspace()
});

loadWorkspace();

function reloadApp() {
    window.location.reload();

    return false;
}
