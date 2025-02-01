/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2018-2025 Toha <tohenk@yahoo.com>
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

const { ScriptManager, ScriptRepository } = require('@ntlab/ntjs');
const JQuery = ScriptManager.require('JQuery');

class Notification extends JQuery {

    initialize() {
        this.name = 'Notification';
        this.position = ScriptRepository.POSITION_MIDDLE;
        this.dependencies = ['SemanticUI', 'JQuery/Define', 'JQuery/Notification'];
    }

    getScript() {
        const close = this.translate('Close');

        return `
$.define('notif', {
    notifyMessage(message, options) {
        const self = this;
        const data = {title: self.title, message: message};
        if (typeof options === 'string') {
            data.class = options;
        }
        $.toast(data);
    }
}, true);
`;
    }

    static instance() {
        return new this();
    }
}

module.exports = Notification;