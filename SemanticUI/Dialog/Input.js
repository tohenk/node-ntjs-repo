/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2018-2024 Toha <tohenk@yahoo.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const { ScriptRepository, ScriptManager } = require('../../index');
const JQuery = ScriptManager.require('JQuery');

/**
 * SemanticUI/Dialog/Input script repository.
 */
class Input extends JQuery {

    initialize() {
        this.name = 'Input';
        this.position = ScriptRepository.POSITION_FIRST;
        this.addDependencies(['SemanticUI/Dialog']);
    }

    getScript() {
        return `
$.define('ntdlg', {
    input: function(id, title, message, value, icon, callback) {
        if (typeof icon === 'function') {
            callback = icon;
            icon = null;
        }
        icon = icon || $.ntdlg.ICON_INPUT;
        message =
            '<form class="ui container form">' +
            '  <div class="field">' +
            '    <label>' + message + '</label>' +
            '    <input type="text" value="' + value + '">' +
            '  </div>' +
            '</form>';
        const dlg = $.ntdlg.dialog(id, title, message, icon, {
            okay: {
                type: 'green approve',
                caption: '<i class="check icon"></i>${this.translate('Ok')}',
                handler: function() {
                    const v = dlg.find('input[type=text]').val();
                    return callback(v);
                }
            },
            cancel: {
                type: 'red deny',
                caption: '<i class="times icon"></i>${this.translate('Cancel')}'
            }
        });
    }
}, true);
`;
    }

    static instance() {
        return new this();
    }
}

module.exports = Input;