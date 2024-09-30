/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2023-2024 Toha <tohenk@yahoo.com>
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
 * JQuery/AjaxHelper script repository.
 */
class AjaxHelper extends JQuery {

    initialize() {
        this.name = 'AjaxHelper';
        this.position = ScriptRepository.POSITION_FIRST;
        this.addDependencies(['JQuery']);
    }

    getScript() {
        return `
$.ajaxhelper = function(el) {
    const helper = {
        el: null,
        dataKey: '_acxhr',
        load: function(url, params, callback) {
            const self = this;
            if (typeof params === 'function') {
                callback = params;
                params = {};
            }
            const oxhr = self.el.data(self.dataKey);
            if (oxhr && 'pending' === oxhr.state()) {
                oxhr.abort();
            }
            self.el.trigger('xhrstart');
            const xhr = $.ajax({
                url: url,
                dataType: 'json',
                data: params
            }).done(function(data) {
                callback(data);
            }).always(function() {
                self.el.trigger('xhrend');
            });
            self.el.data(self.dataKey, xhr);
        }
    }
    if (typeof el === 'string') {
        helper.el = $(el);
    } else {
        helper.el = el;
    }
    return helper;
}`;
    }

    static instance() {
        return new this();
    }
}

module.exports = AjaxHelper;