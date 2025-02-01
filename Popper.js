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

const { Script, ScriptAsset } = require('@ntlab/ntjs');

class Popper extends Script {

    initialize() {
        this.name = 'Popper';
        this.assetPath = 'popper.js';
        this.version = version;
        const versions = [Popper.UMD, Popper.ESM, Popper.CJS];
        if (versions.indexOf(this.version) >= 0) {
            this.getAsset().setPath(ScriptAsset.JAVASCRIPT, this.version);
        } else {
            throw new Error(`Popper version not supported %{this.version}`);
        }
        this.addAsset(ScriptAsset.JAVASCRIPT, 'popper.min');
    }

    static get UMD() {
        return 'umd';
    }

    static get ESM() {
        return 'esm';
    }

    static get CJS() {
        return 'cjs';
    }

    static setVersion(v) {
        version = v;
    }

    static instance() {
        return new this();
    }
}

let version = Popper.UMD;

module.exports = Popper;