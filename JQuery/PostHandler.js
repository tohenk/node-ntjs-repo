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
 * JQuery/PostHandler script repository.
 */
class PostHandler extends JQuery {

    initialize() {
        this.name = 'PostHandler';
        this.position = ScriptRepository.POSITION_FIRST;
        this.addDependencies(['JQuery', 'JQuery/PostErrorHelper']);
    }

    getScript() {
        return `
$.extend({
    handlePostData: function(data, errhelper, success_cb, error_cb) {
        $.postErr = null;
        let json = typeof(data) === 'object' ? data : $.parseJSON(data);
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
    urlPost: function(url, callback, errhelper) {
        errhelper = errhelper ? errhelper : $.errhelper();
        $.post(url).done(function(data) {
            $.handlePostData(data, errhelper, callback);
        });
    }
});
`;
    }

    static instance() {
        return new this();
    }
}

module.exports = PostHandler;