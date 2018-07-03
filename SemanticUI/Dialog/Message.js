/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 Toha <tohenk@yahoo.com>
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

/**
 * Message script repository for SemanticUI.
 */

const Script = module.exports = exports;

const util = require('util');
const script = require('./../../index');
const dialog = require('./index');

Script.instance = function() {
    return new this.Message();
}

Script.Message = function() {
    dialog.Dialog.call(this);
}

util.inherits(Script.Message, dialog.Dialog);

Script.Message.prototype.initialize = function() {
    this.name = 'Message';
    this.position = script.Repository.POSITION_FIRST;
    this.addDependencies(['SemanticUI/Dialog']);
}

Script.Message.prototype.getScript = function() {
    return `
$.define('ntdlg', {
    message: function(id, title, message, icon, cb) {
        return $.ntdlg.dialog(id, title, message, icon, {
            okay: {
                type: 'green approve',
                caption: '<i class="check icon"></i>Ok',
            }
        }, cb);
    }
}, true);
`;
}
