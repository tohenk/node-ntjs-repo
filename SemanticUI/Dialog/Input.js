/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2018-2021 Toha <tohenk@yahoo.com>
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

const { ScriptRepository } = require('./../../index');
const Dialog = require('./index');

/**
 * SemanticUI/Dialog/Input script repository.
 */
class Input extends Dialog {

    initialize() {
        this.name = 'Input';
        this.position = ScriptRepository.POSITION_FIRST;
        this.addDependencies(['SemanticUI/Dialog']);
    }

    getScript() {
        return `
$.define('ntdlg', {
    input: function(id, title, message, value, icon, callback) {
        if (typeof icon == 'function') {
            callback = icon;
            icon = null;
        }
        //var size = size || 50;
        var icon = icon || $.ntdlg.ICON_INPUT;
        var message =
            '<form class="ui container form">' +
                '<div class="field">' +
                    '<label>' + message + '</label>' +
                    '<input type="text" value="' + value + '">' +
                '</div>' +
            '</form>';
        var dlg = $.ntdlg.dialog(id, title, message, icon, {
            'okay': {
                type: 'green approve',
                caption: '<i class="check icon"></i>Ok',
                handler: function() {
                    var v = dlg.find('input[type=text]').val();
                    return callback(v);
                }
            },
            'cancel': {
                type: 'red deny',
                caption: '<i class="times icon"></i>Cancel'
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