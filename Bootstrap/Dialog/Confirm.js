/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2023-2024 Toha <tohenk@yahoo.com>
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
 * Bootstrap/Dialog/Confirm script repository.
 */
class Confirm extends JQuery {

    initialize() {
        this.name = 'Confirm';
        this.position = ScriptRepository.POSITION_FIRST;
        this.addDependencies(['JQuery/Define', 'Bootstrap/Dialog']);
    }

    getScript() {
        const yes = this.translate('Yes');
        const no = this.translate('No');

        return `
$.define('ntdlg', {
    confirm: function(id, title, message, icon, cb_yes, cb_no) {
        if (typeof icon === 'function') {
            cb_no = cb_yes;
            cb_yes = icon;
            icon = undefined;
        }
        icon = icon || $.ntdlg.ICON_QUESTION;
        $.ntdlg.dialog(id, title, message, icon, {
            '${yes}': {
                icon: $.ntdlg.BTN_ICON_OK,
                handler: function() {
                    $.ntdlg.close($(this));
                    if (typeof cb_yes === 'function') {
                        cb_yes();
                    }
                }
            },
            '${no}': {
                icon: $.ntdlg.BTN_ICON_CANCEL,
                handler: function() {
                    $.ntdlg.close($(this));
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