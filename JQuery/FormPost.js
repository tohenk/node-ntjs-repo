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

const { ScriptRepository, ScriptManager } = require('../index');
const JQuery = ScriptManager.require('JQuery');
const Stringify = require('@ntlab/ntlib/stringify');

/**
 * JQuery/FormPost script repository.
 */
class FormPost extends JQuery {

    initialize() {
        this.name = 'FormPost';
        this.position = ScriptRepository.POSITION_FIRST;
        this.addDependencies(['JQuery', 'JQuery/Util', 'JQuery/PostHandler']);
    }

    getOverrides() {
        return {
        }
    }

    getErrHelperOptions() {
        return {
        }
    }

    getScript() {
        const title = this.translate('Form saved');
        const error = this.translate('Error');
        const ok = this.translate('OK');
        const message = this.translate('Please wait while your data being saved.');
        const redirDelay = FormPost.getOption('redir-delay', 0);

        return `
$.formpost = function(form, options) {
    const fp = {
        errhelper: null,
        message: '${message}',
        xhr: false,
        progress: true,
        url: null,
        paramName: null,
        redirDelay: ${redirDelay},
        onsubmit: null,
        onfail: null,
        onerror: null,
        onalways: null,
        onconfirm: null,
        hasRequired: function(form) {
            const self = this;
            let status = false;
            if (self.errhelper.requiredSelector) {
                form.find(self.errhelper.requiredSelector).each(function() {
                    const el = $(this);
                    if ((el.is('input') || el.is('select') || el.is('textarea')) && el.is(':visible') && !el.is(':disabled')) {
                        const value = el.val();
                        if (!value) {
                            status = true;
                            self.errhelper.focused = el;
                            self.errhelper.focusError();
                            return false;
                        }
                    }
                });
            }
            return status;
        },
        formPost: function(form, url, success_cb, error_cb) {
            let params, request;
            form.trigger('formpost');
            if (fp.paramName) {
                params = form.data('submit-params');
                params = typeof params === 'object' ? params : {};
                params[fp.paramName] = form.serialize();
            } else {
                params = form.serializeArray();
            }
            const xtra = form.data('submit');
            if (Array.isArray(xtra) && xtra.length) {
                for (let i = 0; i < xtra.length; i++) {
                    params.push(xtra[i]);
                }
            }
            fp.errhelper.resetError();
            form.trigger('formrequest');
            if (fp.xhr) {
                request = $.ajax({
                    url: url,
                    type: 'POST',
                    dataType: 'json',
                    data: params,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    xhrFields: {
                        'withCredentials': true
                    }
                });
            } else {
                request = $.post(url, params);
            }
            request
                .done(function(data) {
                    $.handlePostData(data, fp.errhelper, function(data) {
                        if (typeof success_cb === 'function') {
                            success_cb(data);
                        }
                    }, function(data) {
                        if (typeof error_cb === 'function') {
                            error_cb(data);
                        }
                        if (typeof fp.onerror === 'function') {
                            fp.onerror(data);
                        }
                    });
                })
                .fail(function() {
                    if (typeof fp.onfail === 'function') {
                        fp.onfail();
                    }
                })
                .always(function() {
                    if (typeof fp.onalways === 'function') {
                        fp.onalways();
                    }
                })
            ;
        },
        bind: function(form) {
            const self = this;
            const submitclicker = function(e) {
                e.preventDefault();
                const submitter = $(this);
                const xtra = [];
                if (submitter.attr('name')) {
                    xtra.push({name: submitter.attr('name'), value: submitter.val()});
                }
                form.data('submit', xtra).submit();
            }
            form.find('[type=submit]').on('click', submitclicker);
            const doit = function() {
                if (typeof self.onsubmit === 'function' && !self.onsubmit(form)) {
                    return false;
                }
                const url = self.url || form.attr('action');
                if (self.progress) {
                    $.ntdlg.wait(self.message);
                }
                self.formPost(form, url, function(json) {
                    form.trigger('formsaved', [json]);
                    if (json.notice) {
                        self.showSuccessMessage('${title}', json.notice, {
                            withOkay: !json.redir,
                            autoClose: typeof $.fpRedir === 'function'
                        });
                    }
                    if (json.redir) {
                        if (typeof $.fpRedir === 'function') {
                            $.fpRedir(json.redir);
                        } else {
                            if (self.redirDelay > 0) {
                                setTimeout(function() {
                                    window.location.href = json.redir;
                                }, self.redirDelay);
                            } else {
                                window.location.href = json.redir;
                            }
                        }
                    }
                }, function(json) {
                    if (typeof self.onalways === 'function') {
                        self.onalways();
                    }
                    const f = function() {
                        self.errhelper.focusError();
                        form.trigger('formerror', [json]);
                        if (typeof $.formErrorHandler === 'function') {
                            $.formErrorHandler(form);
                        }
                    }
                    // handle global error
                    if (json.global || json.error_msg) {
                        if (json.global && json.global.length) {
                            if (self.errhelper.errorContainer) {
                                self.errhelper.addError(json.global, self.errhelper.errorContainer, self.errhelper.ERROR_ASLIST);
                            } else {
                                // concate error as part of error mesage
                            }
                        }
                        if (json.error_msg) {
                            self.showErrorMessage('${error}', json.error_msg, f);
                        } else {
                            f();
                        }
                    } else {
                        f();
                    }
                });
            }
            form.on('submit', function(e) {
                e.preventDefault();
                if (self.hasRequired(form)) {
                    return false;
                }
                if (typeof self.onconfirm === 'function') {
                    self.onconfirm(form, doit);
                } else {
                    doit();
                }
            });
        },
        showSuccessMessage: function(title, message, opts) {
            const autoclose = opts.autoClose !== undefined ? opts.autoClose : false;
            const withokay = opts.withOkay !== undefined ? opts.withOkay : true;
            const buttons = {};
            if (withokay && !autoclose) {
                buttons['${ok}'] = function() {
                    $.ntdlg.close($(this));
                }
            }
            const dlg = $.ntdlg.dialog('form_post_success', title, message, $.ntdlg.ICON_SUCCESS, buttons);
            if (autoclose) {
                dlg.on('dialogopen', function() {
                    $.ntdlg.close($(this));
                });
            }
        },
        showErrorMessage: function(title, message, callback) {
            $.ntdlg.dialog('form_post_error', title, message, $.ntdlg.ICON_ERROR, {
                '${ok}': function() {
                    $.ntdlg.close($(this));
                }
            }, callback);
        }
    }
    Object.assign(fp, ${Stringify.from(this.getOverrides(), 1)});
    const props = ['message', 'progress', 'xhr', 'url', 'paramName', 'onsubmit', 'onconfirm'];
    $.util.applyProp(props, options, fp, true);
    fp.bind(form);
    fp.errhelper = $.errhelper(form, ${Stringify.from(this.getErrHelperOptions(), 1)});
    fp.onalways = function() {
        if (fp.progress) {
            $.ntdlg.wait();
        }
    }
    return fp;
}`;
    }

    static instance() {
        return new this();
    }
}

module.exports = FormPost;