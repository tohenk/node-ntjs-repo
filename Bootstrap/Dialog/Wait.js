/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2023-2025 Toha <tohenk@yahoo.com>
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
 * Bootstrap/Dialog/Wait script repository.
 */
class Wait extends JQuery {

    initialize() {
        this.name = 'Wait';
        this.position = ScriptRepository.POSITION_FIRST;
        this.addDependencies(['JQuery/Define', 'Bootstrap/Dialog']);
    }

    getScript() {
        const message = this.translate('Loading...');
        const title = this.translate('Please wait');

        return `
$.define('ntdlg', {
    waitdlg: {
        id: 'wdialog',
        getDlg(create) {
            const self = this;
            let dlg = $('#' + self.id);
            if (dlg.length) {
                self.dlg = dlg;
            } else {
                if (create) {
                    const spinner = $.ntdlg.spinnerTmpl;
                    const content =
                        '<div id="' + self.id + '" class="modal fade" tabindex="-1">' +
                        '  <div class="modal-dialog modal-dialog-centered">' +
                        '    <div class="modal-content">' +
                        '      <div class="modal-header">${title}</div>' +
                        '      <div class="modal-body">' +
                        '        <div class="d-flex">' +
                        '          <div class="flex-shrink-0 icon">' + spinner + '</div>' +
                        '          <div class="flex-grow-1 ms-3">' +
                        '            <div class="msg">${message}</div>' +
                        '          </div>' +
                        '        </div>' +
                        '      </div>' +
                        '   </div>' +
                        '  </div>' +
                        '</div>';
                    $(document.body).append(content);
                    dlg = $('#' + self.id);
                    dlg.on('shown.bs.modal', function(e) {
                        const dlg = $(this);
                        dlg.addClass('active');
                        if (dlg.hasClass('dismiss')) {
                            setTimeout(function() {
                                $.ntdlg.close(dlg);
                            }, 500);
                        }
                    });
                    dlg.on('hidden.bs.modal', function(e) {
                        const dlg = $(this);
                        dlg.removeClass('active');
                    });
                    $.ntdlg._create(dlg[0], {keyboard: false});
                    self.dlg = dlg;
                }
            }
        },
        isActive() {
            const self = this;
            self.getDlg();
            if (self.dlg) {
                return self.dlg.hasClass('show') ? true : false;
            }
        },
        show(msg) {
            const self = this;
            self.close();
            self.getDlg(true);
            if (msg) {
                self.dlg.find('.modal-body .msg').html(msg);
            }
            self.dlg.removeClass('dismiss');
            $.ntdlg.show(self.dlg);
        },
        close() {
            const self = this;
            self.getDlg();
            if (self.dlg) {
                if (self.dlg.hasClass('active')) {
                    $.ntdlg.close(self.dlg);
                } else {
                    self.dlg.addClass('dismiss');
                }
            }
        }
    },
    wait(message) {
        if (message) {
            $.ntdlg.waitdlg.show(message);
        } else {
            $.ntdlg.waitdlg.close();
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