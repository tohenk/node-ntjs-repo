/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2018-2023 Toha <tohenk@yahoo.com>
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
 * SemanticUI/Dialog/Wait script repository.
 */
class Wait extends JQuery {

    initialize() {
        this.name = 'Wait';
        this.position = ScriptRepository.POSITION_FIRST;
        this.addDependencies(['SemanticUI/Dialog']);
    }

    getScript() {
        return `
$.define('ntdlg', {
    waitId: 'wdlg',
    waitDlg: null,
    wait: function(msg) {
        const self = this;
        if ('close' === msg) {
            if (self.waitDlg) {
                $.ntdlg.close(self.waitDlg);
            }
        } else {
            if (null === self.waitDlg) {
                const message = $.util.template($.ntdlg.messageTmpl, {
                    ICON: $.util.template($.ntdlg.iconTmpl, {ICON: 'big notched circle loading icon'}),
                    MESSAGE: msg
                });
                self.waitDlg = $.ntdlg.create(self.waitId, 'Please wait', message, {
                    closable: false,
                    size: 'tiny'
                });
            } else {
                self.waitDlg.find('div.description p').html(msg);
            }
            $.ntdlg.show(self.waitDlg);
        }
    }
}, true);
`;
    }

    static instance() {
        return new this();
    }
}

module.exports = Wait;