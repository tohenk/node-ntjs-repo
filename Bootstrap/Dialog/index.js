/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2023 Toha <tohenk@yahoo.com>
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
const Stringify = require('@ntlab/ntlib/stringify');

/**
 * Bootstrap/Dialog script repository.
 */
class Dialog extends JQuery {

    initialize() {
        this.name = 'Dialog';
        this.position = ScriptRepository.POSITION_FIRST;
        this.addDependencies(['Bootstrap', 'JQuery/Define', 'JQuery/Util']);
    }

    getIconSet() {
        const loading = this.translate('Loading...');

        return {
            'ICON_INFO': 'bi-info-circle text-info fs-1',
            'ICON_ALERT':'bi-exclamation-circle text-warning fs-1',
            'ICON_ERROR': 'bi-x-circle text-danger fs-1',
            'ICON_SUCCESS': 'bi-check-circle text-success fs-1',
            'ICON_QUESTION': 'bi-question-circle text-primary fs-1',
            'ICON_INPUT': 'bi-pencil-square text-primary fs-1',
            'BTN_ICON_OK': 'bi-check-lg',
            'BTN_ICON_CANCEL': 'bi-x-lg',
            'BTN_ICON_CLOSE': 'bi-x-circle',
            'spinnerTmpl': `<div class="spinner-border text-secondary" role="status"><span class="visually-hidden">${loading}</span></div>`,
        }
    }

    getScript() {
        const icons = this.getIconSet();

        return `
$.define('ntdlg', {
    ICON_INFO: null,
    ICON_ALERT: null,
    ICON_ERROR: null,
    ICON_SUCCESS: null,
    ICON_QUESTION: null,
    ICON_INPUT: null,
    BTN_ICON_OK: null,
    BTN_ICON_CANCEL: null,
    BTN_ICON_CLOSE: null,
    dialogTmpl:
        '<div id="%ID%" class="modal fade" tabindex="-1" aria-labelledby="%ID%-title">' +
        '  <div class="%MODAL%">' +
        '    <div class="modal-content">' +
        '      <div class="modal-header">' +
        '        <h5 id="%ID%-title" class="modal-title">%TITLE%</h5>' +
        '        %CLOSE%' +
        '      </div>' +
        '      <div class="modal-body">%CONTENT%</div>' +
        '      <div class="modal-footer">%BUTTONS%</div>' +
        '    </div>' +
        '  </div>' +
        '</div>',
    iconTmpl:
        '<span class="dialog-icon %ICON%"></span>',
    messageTmpl:
        '<div class="d-flex flex-row">' +
        '  <div class="flex-shrink-0 px-2">%ICON%</div>' +
        '  <div class="flex-grow-1 ms-3 align-self-center">%MESSAGE%</div>' +
        '</div>',
    buttonClass:
        'btn btn-outline-%TYPE%',
    buttonIconTmpl:
        '<span class="%ICON%"></span> %CAPTION%',
    buttonTmpl:
        '<button id="%ID%" type="button" class="%BTNCLASS%">%CAPTION%</button>',
    closeTmpl:
        '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="$close"></button>',
    create: function(id, title, message, options) {
        const self = this;
        const dlg_id = '#' + id;
        $(dlg_id).remove();
        if ($.ntdlg.moved && typeof $.ntdlg.moved.refs[id] != 'undefined') {
            $('div.' + $.ntdlg.moved.refs[id]).remove();
            delete $.ntdlg.moved.refs[id];
        }
        const closable = typeof options.closable != 'undefined' ? options.closable : true;
        const buttons = [];
        const handlers = [];
        let cnt = 0;
        if (options.buttons) {
            $.each(options.buttons, function(k, v) {
                let caption, btnType, btnIcon, handler;
                if ($.isArray(v) || $.isPlainObject(v)) {
                    caption = v.caption ? v.caption : k;
                    btnType = v.type ? v.type : (0 == cnt ? 'primary' : 'secondary');
                    if (v.icon) btnIcon = v.icon;
                    handler = typeof v.handler == 'function' ? v.handler : null;
                } else {
                    caption = k;
                    btnType = 0 == cnt ? 'primary' : 'secondary';
                    handler = typeof v == 'function' ? v : null;
                }
                let btnid = id + '_btn_' + caption.replace(/\W+/g, "-").toLowerCase();
                let btnclass = $.util.template(self.buttonClass, {TYPE: btnType});
                if (btnIcon) {
                    caption = $.util.template(self.buttonIconTmpl, {CAPTION: caption, ICON: btnIcon});
                }
                buttons.push($.util.template(self.buttonTmpl, {
                    ID: btnid,
                    BTNCLASS: btnclass,
                    CAPTION: caption
                }));
                if (typeof handler == 'function') {
                    handlers.push({id: btnid, handler: handler});
                }
                cnt++;
            });
        }
        const m = ['modal-dialog', 'modal-dialog-centered'];
        if (options.size) m.push('modal-' + options.size);
        const content = $.util.template(self.dialogTmpl, {
            ID: id,
            TITLE: title,
            MODAL: m.join(' '),
            CLOSE: closable ? self.closeTmpl : '',
            BUTTONS: buttons.join(''),
            CONTENT: message
        });
        $(document.body).append(content);
        const dlg = $(dlg_id);
        // move embedded modal
        const bd = dlg.find('.modal-body');
        const d = bd.find('div.modal');
        if (d.length) {
            if (!$.ntdlg.moved) {
                $.ntdlg.moved = {count: 0, refs: {}}
            }
            $.ntdlg.moved.count++;
            const movedDlg = id + '-moved-' + $.ntdlg.moved.count;
            $.ntdlg.moved.refs[id] = movedDlg;
            d.addClass(movedDlg);
            d.appendTo($(document.body));
        }
        if (buttons.length == 0) {
            dlg.find('.modal-footer').hide();
        }
        $.each(handlers, function(k, v) {
            $('#' + v.id).on('click', function(e) {
                e.preventDefault();
                v.handler.apply(dlg);
            });
        });
        const opts = ['backdrop', 'keyboard', 'show', 'remote'];
        const events = ['show.bs.modal', 'shown.bs.modal', 'hide.bs.modal', 'hidden.bs.modal', 'loaded.bs.modal'];
        const modal_options = {};
        $.util.applyProp(opts, options, modal_options);
        $.util.applyEvent(dlg, events, options);
        // compatibility with JQuery UI dialog
        $.each({open: 'shown.bs.modal', close: 'hidden.bs.modal'}, function(prop, event) {
            if (typeof options[prop] == 'function') {
                dlg.on(event, options[prop]);
            }
        });
        self._create(dlg[0], modal_options);
        return dlg;
    },
    dialog: function(id, title, message, icon, buttons, close_cb) {
        const self = this;
        icon = icon || self.ICON_INFO;
        buttons = buttons || [];
        message = $.util.template(self.messageTmpl, {
            ICON: $.util.template(self.iconTmpl, {ICON: icon}),
            MESSAGE: message
        });
        const dlg = self.create(id, title, message, {
            'shown.bs.modal': function(e) {
                e.preventDefault();
                let focused = dlg.find('input.focused');
                if (focused.length) {
                    focused.focus();
                }
            },
            'hidden.bs.modal': function(e) {
                e.preventDefault();
                if (typeof close_cb == 'function') {
                    close_cb();
                }
            },
            buttons: buttons
        });
        $.ntdlg.show(dlg);
        return dlg;
    },
    show: function(dlg) {
        const self = this;
        if (dlg && !this.isVisible(dlg)) {
            if (typeof dlg == 'string') {
                dlg = $('#' + dlg);
            }
            let d = self._get(dlg[0]);
            if (!d) {
                d = self._create(dlg[0]);
            }
            if (d) d.show();
        }
    },
    close: function(dlg) {
        const self = this;
        if (dlg) {
            if (typeof dlg == 'string') {
                dlg = $('#' + dlg);
            }
            const d = self._get(dlg[0]);
            if (d) d.hide();
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
            return dlg.find('.modal-body:first');
        }
    },
    _create: function(el, options) {
        return new bootstrap.Modal(el, options || {});
    },
    _get: function(el) {
        return bootstrap.Modal.getInstance(el);
    },
    init: function() {
        // icon set
        $.extend(this, ${Stringify.from(icons, 2)});
        // https://stackoverflow.com/questions/19305821/multiple-modals-overlay
        // fix z-index
        const p = bootstrap.Modal.prototype;
        if (typeof p.__showElement == 'undefined') {
            p.__showElement = p._showElement;
            p._showElement = function(relatedTarget) {
                this.__showElement(relatedTarget);
                let cIdx = zIdx = parseInt($(this._element).css('z-index'));
                if ($.ntdlg.zIndex) {
                    zIdx = Math.max(zIdx, $.ntdlg.zIndex);
                }
                const modalCount = $('.modal:visible').length;
                if (modalCount > 1 || zIdx > cIdx) {
                    zIdx += 10 * (modalCount - 1);
                    $(this._element).css('z-index', zIdx);
                    $(this._backdrop).css('z-index', zIdx - 1);
                }
            }
        }
        // re-add modal-open class if there're still opened modal
        if (typeof p.__resetAdjustments == 'undefined') {
            p.__resetAdjustments = p._resetAdjustments;
            p._resetAdjustments = function() {
                this.__resetAdjustments();
                if ($('.modal:visible').length > 0) {
                    $(document.body).addClass('modal-open');
                }
            }
        }
    }
}, true);
`;
    }

    getInitScript() {
        this.addLast(`$.ntdlg.init()`);
    }

    static instance() {
        return new this();
    }
}

module.exports = Dialog;