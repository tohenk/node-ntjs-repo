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
 * Semantic UI script repository.
 */

const Script = module.exports = exports;

const util = require('util');
const script = require('./../index');
const jquery = require('./../jQuery');

Script.instance = function() {
    return new this.SemanticUI();
}

Script.SemanticUI = function() {
    jquery.jQuery.call(this);
}

util.inherits(Script.SemanticUI, jquery.jQuery);

Script.SemanticUI.prototype.initialize = function() {
    this.name = 'SemanticUI';
    this.dependencies = ['jQuery'];
    this.asset = new script.Asset('semantic-ui');
    this.addAsset(script.Asset.JAVASCRIPT, 'semantic.min');
    this.addAsset(script.Asset.STYLESHEET, 'semantic.min');
}