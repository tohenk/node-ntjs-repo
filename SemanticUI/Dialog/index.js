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
 * Dialog script repository for SemanticUI.
 */

const Script = module.exports = exports;

const util = require('util');
const script = require('./../../index');
const semantic = require('./../index');

Script.instance = function() {
    return new this.Dialog();
}

Script.Dialog = function() {
    semantic.SemanticUI.call(this);
}

util.inherits(Script.Dialog, semantic.SemanticUI);

Script.Dialog.prototype.initialize = function() {
    this.name = 'Dialog';
    this.position = script.Repository.POSITION_FIRST;
    this.addDependencies(['SemanticUI', 'jQuery/Define', 'jQuery/Util']);
}

Script.Dialog.prototype.getScript = function() {
    return `
$.define('ntdlg', {
    ICON_INFO: 'info circle icon',
    ICON_ALERT: 'yellow exclamation circle icon',
    ICON_ERROR: 'red times circle icon',
    ICON_SUCCESS: 'green check circle icon',
    ICON_QUESTION: 'question circle icon',
    ICON_INPUT: 'edit icon',
    dialogTmpl:
        '<div id="%ID%" class="ui %MODAL% modal">' +
            '<div class="header">%TITLE%</div>' +
            '<div class="image content">%CONTENT%</div>' +
            '<div class="actions">%BUTTONS%</div>' +
        '</div>',
    iconTmpl:
        '<i class="big %ICON%"></i>',
    messageTmpl:
        '%ICON%' +
        '<div class="description">%MESSAGE%</div>',
    buttonTmpl:
        '<div id="%ID%" class="ui %TYPE% button">%CAPTION%</div>',
    create: function(id, title, message, options) {
        var self = this;
        var dlg_id = '#' + id;
        $(dlg_id).remove();
        if ($.ntdlg.moved && typeof $.ntdlg.moved.refs[id] != 'undefined') {
            $('div.' + $.ntdlg.moved.refs[id]).remove();
            delete $.ntdlg.moved.refs[id];
        }
        var modal = {
            closable: typeof options.closable != 'undefined' ? options.closable : true
        }
        var buttons = [];
        var handlers = [];
        var okay = ['approve', 'positive', 'ok'];
        var nope = ['deny', 'negative', 'cancel'];
        var cnt = 0;
        if (options.buttons) {
            $.each(options.buttons, function(k, v) {
                if (typeof v == 'object') {
                    var caption = v.caption ? v.caption : k;
                    var btnType = v.type ? v.type : 'secondary';
                    var handler = typeof v.handler == 'function' ? v.handler : null;
                } else {
                    var caption = k;
                    var btnType = 0 == cnt ? 'primary' : 'secondary';
                    var handler = typeof v == 'function' ? v : null;
                }
                var btnid = id + '_btn_' + k.replace(/\W+/g, "-").toLowerCase();
                buttons.push($.util.template(self.buttonTmpl, {
                    ID: btnid,
                    TYPE: btnType,
                    CAPTION: caption
                }));
                if (handler) {
                    if (!modal.onApprove) {
                        $.each(okay, function(i, v) {
                            if (btnType.indexOf(v) >= 0) {
                                modal.onApprove = handler;
                                handler = null;
                                return true;
                            }
                        });
                    }
                    if (!modal.onDeny) {
                        $.each(nope, function(i, v) {
                            if (btnType.indexOf(v) >= 0) {
                                modal.onDeny = handler;
                                handler = null;
                                return true;
                            }
                        });
                    }
                }
                if (typeof handler == 'function') {
                    handlers.push({id: btnid, handler: handler});
                }
                cnt++;
            });
        }
        if (typeof options.show == 'function') {
            modal.onShow = options.show;
        }
        if (typeof options.hide == 'function') {
            modal.onHidden = options.hide;
        }
        var content = $.util.template(self.dialogTmpl, {
            ID: id,
            TITLE: title,
            MODAL: options.size ? options.size : 'tiny',
            BUTTONS: buttons.join(''),
            CONTENT: message
        });
        $(document.body).append(content);
        var dlg = $(dlg_id);
        // move embedded modal
        var bd = dlg.find('.content');
        var d = bd.find('.ui.modal');
        if (d.length) {
            if (!$.ntdlg.moved) {
                $.ntdlg.moved = {count: 0, refs: {}}
            }
            $.ntdlg.moved.count++;
            var movedDlg = id + '-moved-' + $.ntdlg.moved.count;
            $.ntdlg.moved.refs[id] = movedDlg;
            d.addClass(movedDlg);
            d.appendTo($(document.body));
        }
        if (buttons.length == 0) {
            dlg.find('.actions').hide();
        }
        $.each(handlers, function(k, v) {
            $('#' + v.id).on('click', function(e) {
                e.preventDefault();
                v.handler.apply(dlg);
            });
        });
        dlg.modal(modal);
        return dlg;
    },
    show: function(dlg) {
        if (dlg && !this.isVisible(dlg)) {
            if (typeof dlg == 'string') {
                dlg = $('#' + dlg);
            }
            dlg.modal('show');
        }
    },
    close: function(dlg) {
        if (dlg) {
            if (typeof dlg == 'string') {
                dlg = $('#' + dlg);
            }
            dlg.modal('hide');
        }
    },
    isVisible: function(dlg) {
        if (dlg) {
            if (typeof dlg == 'string') {
                dlg = $('#' + dlg);
            }
            if (dlg.length) {
                if (dlg.hasClass('modal') && dlg.is(':visible')) {
                    return true;
                }
            }
            return false;
        }
    },
    getBody: function(dlg) {
        if (dlg) {
            if (typeof dlg == 'string') {
                dlg = $('#' + dlg);
            }
            return dlg.find('.content:first');
        }
    },
    dialog: function(id, title, message, icon, buttons, close_cb) {
        var self = this;
        var icon = icon || self.ICON_INFO;
        var buttons = buttons || [];
        var message = $.util.template(self.messageTmpl, {
            ICON: $.util.template(self.iconTmpl, {ICON: icon}),
            MESSAGE: message
        });
        var dlg = self.create(id, title, message, {
            closable: false,
            buttons: buttons,
            hide: function() {
                if (typeof close_cb == 'function') {
                    close_cb();
                }
            }
        });
        dlg.modal('show');
        return dlg;
    }
}, true);
`;
}
