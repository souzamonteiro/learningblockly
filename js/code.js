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

// The toolbox XML specifies each category name using Blockly's messaging
// format (eg. `<category name="%{BKY_CATLOGIC}">`).
// These message keys need to be defined in `Blockly.Msg` in order to
// be decoded by the library. Therefore, we'll use the `MSG` dictionary that's
// been defined for each language to import each category name message
// into `Blockly.Msg`.
// TODO: Clean up the message files so this is done explicitly instead of
// through this for-loop.
for (var messageKey in MSG) {
    if (messageKey.indexOf('cat') == 0) {
        Blockly.Msg[messageKey.toUpperCase()] = MSG[messageKey];
    }
}

// Construct the toolbox XML, replacing translated variable names.
var toolboxText = document.getElementById('toolbox').outerHTML;
toolboxText = toolboxText.replace(/(^|[^%]){(\w+)}/g, function(m, p1, p2) {return p1 + MSG[p2];});
var toolboxXml = Blockly.Xml.textToDom(toolboxText);
