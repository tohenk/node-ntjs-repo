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

const { Script, ScriptAsset } = require('@ntlab/ntjs');
const debug = require('debug')('script:JQuery');

/**
 * JQuery script repository.
 */
class JQuery extends Script {

    constructor() {
        super('JQuery', 'jquery');
    }

    initialize() {
        this.assetPath = this.repository;
        this.addAsset(ScriptAsset.JAVASCRIPT, 'jquery.min');
    }

    initRepository(repository) {
        if (JQuery.getOption('xhr')) {
            debug('Init repository for XHR');
            repository.wrapSize = 2;
            repository.wrapper = `
(function($) {
    (function loader(f) {
        if (document.ntloader && !document.ntloader.isScriptLoaded()) {
            setTimeout(function() {
                loader(f);
            }, 100);
        } else {
            f($);
        }
    })(function($) {%s});
})(jQuery);`;
        } else {
            debug('Init repository for normal request');
            repository.wrapSize = 1;
            repository.wrapper = `
(function($) {%s})(jQuery);`;
        }
    }

    static instance() {
        return new this();
    }
}

module.exports = JQuery;