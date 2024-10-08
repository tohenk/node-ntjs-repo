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

const { ScriptRepository, ScriptManager } = require('@ntlab/ntjs');
const JQuery = ScriptManager.require('JQuery');

/**
 * SemanticUI/Dialog/Confirm script repository.
 */
class Confirm extends JQuery {

    initialize() {
        this.name = 'Confirm';
        this.position = ScriptRepository.POSITION_FIRST;
        this.addDependencies(['SemanticUI/Dialog']);
    }

    getScript() {
        return `
$.define('ntdlg', {
    confirm: function(id, title, message, icon, cb_yes, cb_no) {
        if (typeof icon === 'function') {
            cb_no = cb_yes;
            cb_yes = icon;
            icon = undefined;
        }
        icon = icon || $.ntdlg.ICON_QUESTION;
        const dlg = $.ntdlg.dialog(id, title, message, icon, {
            yes: {
                type: 'green approve',
                caption: '<i class="check icon"></i>${this.translate('Yes')}',
                handler: function() {
                    if (typeof cb_yes === 'function') {
                        cb_yes();
                    }
                }
            },
            no: {
                type: 'red deny',
                caption: '<i class="times icon"></i>${this.translate('No')}',
                handler: function() {
                    if (typeof cb_no === 'function') {
                        cb_no();
                    }
                }
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

module.exports = Confirm;