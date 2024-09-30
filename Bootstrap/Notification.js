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

const { ScriptManager, ScriptRepository } = require('../index');
const JQuery = ScriptManager.require('JQuery');

class Notification extends JQuery {

    initialize() {
        this.name = 'Notification';
        this.position = ScriptRepository.POSITION_MIDDLE;
        this.dependencies = ['Bootstrap', 'JQuery/Define', 'JQuery/Notification'];
    }

    getScript() {
        const close = this.translate('Close');

        return `
$.define('notif', {
    notifyMessage: function(message, options) {
        const self = this;
        let icon;
        switch (options) {
            case 'success':
                icon = 'bi-check-circle text-success';
                break;
            case 'error':
                icon = 'bi-x-circle text-danger';
                break;
            case 'info':
                icon = 'bi-info-circle text-info';
                break;
            case 'warn':
                icon = 'bi-exclamation-circle text-warning';
                break;
        }
        const tmpl =
            '<div class="toast" role="alert" aria-live="assertive" aria-atomic="true">' +
            '  <div class="toast-header">' +
            '    <span class="bi-bell me-1"></span>' +
            '    <strong class="me-auto">%TITLE%</strong>' +
            '    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="${close}"></button>' +
            '  </div>' +
            '  <div class="toast-body">' +
            '    <div class="d-flex flex-row">' +
            '      <div class="flex-shrink-0"><span class="%ICON% fs-4"></span></div>' +
            '      <div class="flex-grow-1 ms-3 align-self-center">%MESSAGE%</div>' +
            '    </div>' +
            '  </div>' +
            '</div>';
        const toast = tmpl
            .replace(/%TITLE%/, options.title || self.title)
            .replace(/%ICON%/, icon)
            .replace(/%MESSAGE%/, message)
        ;
        if (self.container === undefined) {
            self.container = $('<div class="notification-container position-fixed bottom-0 end-0 p-3"></div>').appendTo(document.body);
        }
        const el = $(toast).appendTo(self.container);
        const t = new bootstrap.Toast(el[0]);
        t.show();
        return t;
    }
}, true);
`;
    }

    static instance() {
        return new this();
    }
}

module.exports = Notification;