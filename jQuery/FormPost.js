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
 * FormPost script repository.
 */

const Script = module.exports = exports;

const util = require('util');
const script = require('./../index');
const jquery = require('./index');

Script.instance = function() {
    return new this.FormPost();
}

Script.FormPost = function() {
    jquery.jQuery.call(this);
}

util.inherits(Script.FormPost, jquery.jQuery);

Script.FormPost.prototype.initialize = function() {
    this.name = 'FormPost';
    this.position = script.Repository.POSITION_FIRST;
    this.addDependencies(['jQuery', 'jQuery/ErrorHelper']);
}

Script.FormPost.prototype.getScript = function() {
    var title = 'Form saved';
    var error = 'Error';
    var message = 'Please wait while changes are being submitted.';
    return `
$.formpost = function(form, options) {
    var fp = {
        errhelper: null,
        message: '${message}',
        xhr: false,
        progress: true,
        url: null,
        paramName: null,
        onsubmit: null,
        onfail: null,
        onerror: null,
        onalways: null,
        onconfirm: null,
        hasRequired: function(form) {
            var self = this;
            var status = false;
            if (self.errhelper.requiredSelector) {
                form.find(self.errhelper.requiredSelector).each(function() {
                    var el = $(this);
                    if ((el.is('input') || el.is('select') || el.is('textarea')) && el.is(':visible') && !el.is(':disabled')) {
                        var value = el.val();
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
            form.trigger('formpost');
            if (fp.paramName) {
                var params = form.data('submit-params');
                params = typeof params == 'object' ? params : {};
                params[fp.paramName] = form.serialize();
            } else {
                var params = form.serializeArray();
            }
            var xtra = form.data('submit');
            if ($.isArray(xtra) && xtra.length) {
                for (var i = 0; i < xtra.length; i++) {
                    params.push(xtra[i]);
                }
            }
            fp.errhelper.resetError();
            form.trigger('formrequest');
            if (fp.xhr) {
                var request = $.ajax({
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
                var request = $.post(url, params);
            }
            request.done(function(data) {
                fp.handlePostData(data, fp.errhelper, function(data) {
                    if (typeof(success_cb) == 'function') {
                        success_cb(data);
                    }
                }, function(data) {
                    if (typeof(error_cb) == 'function') {
                        error_cb(data);
                    }
                    if (typeof($.onerror) == 'function') {
                        fp.onerror(data);
                    }
                });
            }).fail(function() {
                if (typeof(fp.onfail) == 'function') {
                    fp.onfail();
                }
            }).always(function() {
                if (typeof(fp.onalways) == 'function') {
                    fp.onalways();
                }
            });
        },
        handlePostData: function(data, errhelper, success_cb, error_cb) {
            $.postErr = null;
            var json = typeof(data) === 'object' ? data : $.parseJSON(data);
            if (json.success) {
                if (typeof success_cb == 'function') {
                    success_cb(json);
                }
            } else {
                if (json.error) {
                    $.map($.isArray(json.error) || $.isPlainObject(json.error) ? json.error : new Array(json.error), errhelper.handleError);
                }
                if (typeof error_cb == 'function') {
                    error_cb(json);
                }
            }
        },
        bind: function(form) {
            var self = this;
            var submitclicker = function(e) {
                e.preventDefault();
                var submitter = $(this);
                var xtra = [];
                if (submitter.attr('name')) {
                    xtra.push({name: submitter.attr('name'), value: submitter.val()});
                }
                form.data('submit', xtra).submit();
            }
            form.find('input[type=submit]').on('click', submitclicker);
            form.find('button[type=submit]').on('click', submitclicker);
            var doit = function() {
                if (self.hasRequired(form) || (typeof self.onsubmit == 'function' && !self.onsubmit(form))) {
                    return false;
                }
                var url = self.url || form.attr('action');
                if (self.progress) {
                    $.ntdlg.wait(self.message);
                }
                self.formPost(form, url, function(json) {
                    var done = function() {
                        if (json.redir) {
                            window.location.href = json.redir;
                        }
                        form.trigger('formsaved', [json]);
                    }
                    if (json.notice) {
                        if (json.redir) {
                            $.ntdlg.dialog('form_post_success', '${title}', json.notice, $.ntdlg.ICON_SUCCESS);
                            done();
                        } else {
                            $.ntdlg.message('form_post_success', '${title}', json.notice, $.ntdlg.ICON_SUCCESS, function() {
                                done();
                            });
                        }
                    } else {
                        done();
                    }
                }, function(json) {
                    if (typeof self.onalways == 'function') {
                        self.onalways();
                    }
                    var f = function() {
                        self.errhelper.focusError();
                        form.trigger('formerror');
                        if (typeof $.formErrorHandler == 'function') {
                            $.formErrorHandler(form);
                        }
                    }
                    if (json.error_msg) {
                        var err = json.error_msg;
                        if (json.global && json.global.length) {
                            if (self.errhelper.errorContainer) {
                                self.errhelper.errorContainer.removeClass('hidden');
                                self.errhelper.addError(json.global, self.errhelper.errorContainer, self.errhelper.ERROR_ASLIST);
                            } else {
                                // concate error as part of error mesage
                            }
                        }
                        $.ntdlg.dialog('form_post_error', '${error}', err, $.ntdlg.ICON_ERROR, {
                            'okay': {
                                type: 'green approve',
                                caption: '<i class="green check icon"></i>Ok'
                            }
                        }, f);
                    } else {
                        f();
                    }
                });
            }
            form.on('submit', function(e) {
                e.preventDefault();
                if (typeof self.onconfirm == 'function') {
                    self.onconfirm(form, doit);
                } else {
                    doit();
                }
            });
        }
    }
    var props = ['message', 'progress', 'xhr', 'url', 'paramName', 'onsubmit', 'onconfirm'];
    $.each(props, function(i, v) {
        if (typeof options[v] != 'undefined') {
            fp[v] = options[v];
        }
    });
    fp.bind(form);
    fp.errhelper = $.errhelper(form);
    fp.onalways = function() {
        if (fp.progress) {
            $.ntdlg.wait('close');
        }
    }
    return fp;
}
`;
}
