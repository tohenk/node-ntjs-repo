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

const { ScriptRepository, ScriptManager } = require('../index');
const JQuery = ScriptManager.require('JQuery');

/**
 * JQuery/PostErrorHelper script repository.
 */
class PostErrorHelper extends JQuery {

    initialize() {
        this.name = 'PostErrorHelper';
        this.position = ScriptRepository.POSITION_FIRST;
        this.addDependencies(['JQuery']);
    }

    getScript() {
        const err = 'Error';
        return `
$.errformat = {REPLACE: 0, INPLACE: 1, ASLIST: 2}
$.errhelper = function(container, options) {
    const helper = {
        container: null,
        errorContainer: null,
        errorFormat: $.errformat.ASLIST,
        requiredSelector: '.required',
        errClass: null,
        parentSelector: null,
        parentClass: 'error',
        listClass: 'error_list',
        toggleClass: null,
        inplace: null,
        focused: null,
        visibilityUseClass: false,
        getError: function(err, fmt, sep) {
            let error = '';
            $.map($.isArray(err) ? err : new Array(err), function(e) {
                if (error.length && sep) {
                    error = error + sep;
                }
                e = $.isArray(e) ? e.join(': ') : e;
                if (fmt) {
                    error = error + $.util.template(fmt, {error: e});
                } else {
                    error = error + e;
                }
            });
            return error;
        },
        doShow: function(el, show = true) {
            const self = this;
            if (self.visibilityUseClass && self.toggleClass) {
                if (show) {
                    el.removeClass(self.toggleClass);
                } else {
                    el.addClass(self.toggleClass);
                }
            } else {
                if (show) {
                    el.show();
                } else {
                    el.hide();
                }
            }
        },
        showError: function(el) {
            const self = this;
            self.doShow(el, true);
            if (self.toggleClass) {
                el.removeClass(self.toggleClass);
                el.parents().removeClass(self.toggleClass);
            }
        },
        addErrorClass: function(el) {
            const self = this;
            if (self.errClass) {
                if (el.is('input[type="hidden"]')) {
                    el = el.siblings('input');
                }
                el.addClass(self.errClass);
            }
        },
        addError: function(err, el, errtype) {
            const self = this;
            errtype = errtype ? errtype : $.errformat.REPLACE;
            if (Array.isArray(el)) {
                el.forEach(function(x) {
                    self.showError(x);
                });
                el = el[el.length - 1];
            }
            let error;
            switch (errtype) {
                case $.errformat.REPLACE:
                    error = self.getError(err, null, ', ');
                    if (error.length) {
                        el.html(error);
                        self.addErrorClass(el);
                        self.showError(el);
                    }
                    break;
                case $.errformat.INPLACE:
                    error = self.getError(err, null, ', ');
                    if (typeof self.inplace == 'function') {
                        let iel = self.inplace(el, error);
                        self.addErrorClass(iel);
                        self.showError(iel);
                    }
                    break;
                case $.errformat.ASLIST:
                    error = self.getError(err, '<li>%error%</li>');
                    let ul = el.find('ul.' + self.listClass);
                    if (ul.length) {
                        ul.append(error);
                    } else {
                        $('<ul class="' + self.listClass + '">' + error + '</ul>').appendTo(el);
                    }
                    self.addErrorClass(el);
                    self.showError(el);
                    break;
            }
        },
        handleError: function(err) {
            let handled = false;
            // reference self using variable
            if ($.isArray(err)) {
                const el = $('#' + err[0]);
                // check if error element is exist
                if (el.length) {
                    handled = true;
                    helper.addError(err[1], helper.errorFormat == $.errformat.ASLIST ? el.parent() : el, helper.errorFormat);
                    if (helper.parentClass) {
                        if (helper.parentSelector) {
                            el.parents(helper.parentSelector).addClass(helper.parentClass).show();
                        } else {
                            el.parent().addClass(helper.parentClass).show();
                        }
                    }
                    if (helper.focused == null) {
                        if (el.is('input[type="hidden"]')) {
                            helper.focused = el.siblings('input');
                        } else {
                            helper.focused = el;
                        }
                    }
                } else {
                    err = err[0] + ': ' + err[1];
                }
            }
            if (!handled) {
                // error message shown in container
                if (helper.errorContainer) {
                    helper.addError(err, helper.errorContainer, helper.errorFormat);
                } else {
                    if ($.ntdlg) {
                        $.ntdlg.message('dlgerr', '$err', err, $.ntdlg.ICON_ERROR);
                    } else {
                        alert(err);
                    }
                }
            }
        },
        focusError: function() {
            const self = this;
            if (self.focused != null) {
                $.scrollto(self.focused);
                self.focused.focus();
            }
        },
        resetError: function() {
            const self = this;
            self.focused = null;
            if (self.container) {
                if (self.listClass) {
                    self.container.find('.' + self.listClass).remove();
                }
                if (self.errClass) {
                    self.container.find('.' + self.errClass).removeClass(self.errClass);
                }
                if (self.parentClass) {
                    if (self.parentSelector) {
                        self.container.find(self.parentSelector).removeClass(self.parentClass);
                    } else {
                        self.container.find('.' + self.parentClass).removeClass(self.parentClass);
                    }
                }
            }
            if (self.errorContainer) {
                if (Array.isArray(self.errorContainer)) {
                    self.doShow(self.errorContainer[0], false);
                } else {
                    self.doShow(self.errorContainer, false);
                }
            }
            if (typeof self.onErrReset == 'function') {
                self.onErrReset(self);
            }
        }
    }
    helper.container = container;
    options = options ? options : {};
    $.util.applyProp(['errorContainer', 'errorFormat', 'requiredSelector', 'parentSelector', 'parentClass',
        'errClass', 'listClass', 'toggleClass', 'visibilityUseClass', 'inplace', 'onErrReset'], options, helper);
    if (typeof helper.errorContainer == 'string' && helper.container) {
        let p = helper.container;
        let containers = helper.errorContainer.split(' ');
        let items = [];
        while (true) {
            if (containers.length == 0) break;
            let selector = containers.shift();
            let el = p.find(selector);
            if (el.length) {
                p = el;
                items.push(el);
            } else {
                break;
            }
        }
        if (items.length) {
            if (items.length > 1) {
                helper.errorContainer = items;
            } else {
                helper.errorContainer = items[0];
            }
        } else {
            delete helper.errorContainer;
        }
    }
    return helper;
}
`;
    }

    static instance() {
        return new this();
    }
}

module.exports = PostErrorHelper;