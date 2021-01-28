/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2018-2021 Toha <tohenk@yahoo.com>
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

const fs = require('fs');
const util = require('util');
const path = require('path');
const debug = require('debug')('script');

const scriptCaches = {};

/**
 * Script manager.
 */
class ScriptManager {

    EOL = '\n'
    CDN = '/js'

    dirs = []
    defaultScripts = []
    defaultAssets = []

    repositories = {}
    assets = {}
    scripts = {}
    cdns = {}

    /**
     * Create script instance or return one if its already created.
     *
     * @param {string} name Script name
     * @returns {Script}
     */
    create(name) {
        if (!this.scripts[name]) {
            debug(`Load script ${name}`);
            const scriptName = name.replace(/\//, path.sep);
            let scriptFilename = scriptCaches[scriptName];
            if (!scriptFilename) {
                this.dirs.forEach((dir) => {
                    [
                        path.join(dir, scriptName + '.js'),
                        path.join(dir, scriptName, 'index.js'),
                    ].forEach((scriptFile) => {
                        if (fs.existsSync(scriptFile)) {
                            scriptFilename = scriptFile;
                            return true;
                        }
                    });
                    if (scriptFilename) return true;
                });
            }
            if (!scriptFilename) {
                throw new Error('Can\'t resolve script ' + name);
            }
            debug(`Script ${name} loaded from ${scriptFilename}`);
            const script = require(scriptFilename);
            this.scripts[name] = script.instance();
            scriptCaches[scriptName] = scriptFilename;
        }
        if (!this.scripts[name]) {
            throw new Error('Script ' + name + ' can\'t be located.');
        }
        return this.scripts[name];
    }

    /**
     * Add CDN repository.
     *
     * @param {string} repository
     * @returns {CDN}
     */
    addCdn(repository) {
        if (!this.cdns[repository]) {
            this.cdns[repository] = new CDN(repository);
        }
        return this.cdns[repository];
    }

    /**
     * Get CDN repository.
     *
     * @param {string} repository Repository name
     * @returns {CDN}
     */
    getCdn(repository) {
        if (this.cdns[repository]) {
            return this.cdns[repository];
        }
    }

    /**
     * Parse and register CDN.
     *
     * @param {Object} cdns CDN parameters
     * @returns {ScriptManager}
     */
    parseCdn(cdns) {
        Object.keys(cdns).forEach((repository) => {
            let parameters = cdns[repository];
            let enabled = true;
            if (typeof parameters.disabled != 'undefined' && parameters.disabled) {
                enabled = false;
            }
            if (enabled) {
                let cdn = this.addCdn(repository);
                if (parameters.url) cdn.url = parameters.url;
                if (parameters.version) cdn.version = parameters.version;
                [ScriptAsset.JAVASCRIPT, ScriptAsset.STYLESHEET].forEach((asset) => {
                    if (parameters.paths && parameters.paths[asset]) {
                        cdn.setPath(asset, parameters.paths[asset]);
                    }
                    if (parameters[asset]) {
                        let assets = parameters[asset];
                        Object.keys(assets).forEach((name) => {
                            switch (asset) {
                                case ScriptAsset.JAVASCRIPT:
                                    cdn.addJs(name, assets[name]);
                                    break;
                                case ScriptAsset.STYLESHEET:
                                    cdn.addCss(name, assets[name]);
                                    break;
                            }
                        });
                    }
                });
                debug('CDN parsed: %s', JSON.stringify(cdn));
            }
        });
        return this;
    }

    /**
     * Register script directory which script will be looked up.
     *
     * @param {string} path Path name
     * @returns {ScriptManager}
     */
    addDir(path) {
        if (this.dirs.indexOf(path) < 0) {
            this.dirs.push(path);
        }
        return this;
    }

    /**
     * Add default script to include.
     *
     * @param {string} name Script name
     * @returns {ScriptManager}
     */
    addDefault(name) {
        if (this.defaultScripts.indexOf(name) < 0) {
            this.defaultScripts.push(name);
        }
        return this;
    }

    /**
     * Include all default scripts.
     *
     * @returns {ScriptManager}
     */
    includeDefaults() {
        this.defaultScripts.forEach((script) => {
            this.create(script).include();
        });
        return this;
    }

    /**
     * Add an asset.
     *
     * @param {string} type Asset type
     * @param {string} name Asset name
     * @param {ScriptAsset} asset Asset data
     * @returns {ScriptManager}
     */
    addAsset(type, name, asset) {
        if (!asset) asset = this.globalAsset();
        this.defaultAssets.push({
            asset: asset,
            type: type,
            name: name
        });
        return this;
    }

    /**
     * Include all assets.
     *
     * @returns {ScriptManager}
     */
    includeAssets() {
        this.defaultAssets.forEach((data) => {
            data.asset.use(data.type, data.name);
        });
        return this;
    }

    /**
     * Clear all assets, repositories, and scripts.
     *
     * @returns {ScriptManager}
     */
    clear() {
        this.repositories = {};
        this.assets = {};
        this.scripts = {};
        return this;
    }

    /**
     * Get all script content.
     *
     * @returns {string} Content
     */
    getContent() {
        const result = [];
        for (let repo in this.repositories) {
            let content = this.repositories[repo].getContent();
            if (content) result.push(content);
        }
        return result.join(this.EOL);
    }

    getAssets(type) {
        if (this.assets[type]) {
            return this.assets[type];
        }
        return [];
    }

    globalAsset() {
        if (!this.gAsset) {
            this.gAsset = new ScriptAsset('');
            this.gAsset.setPath(ScriptAsset.JAVASCRIPT, ScriptAsset.JAVASCRIPT);
            this.gAsset.setPath(ScriptAsset.STYLESHEET, ScriptAsset.STYLESHEET);
            this.gAsset.cdn = false;
        }
        return this.gAsset;
    }

    /**
     * Create an instance.
     *
     * @returns {ScriptManager} A ScriptManager instance
     */
    static singleton() {
        if (!ScriptManager.instance) ScriptManager.instance = new this();
        return ScriptManager.instance;
    }

}

/**
 * Script repository.
 */
class ScriptRepository {

    constructor(name) {
        this.name = name;
        this.scripts = {};
        this.wrapper = null;
        this.wrapSize = 1;
        this.included = false;
    }
    
    clear() {
        this.scripts = {};
        this.included = false;
        return this;
    }

    add(content, position) {
        position = position || ScriptRepository.POSITION_LAST;
        if (content.length) {
            const eol = ScriptManager.singleton().EOL;
            // fix eol
            while (content.substr(-1) == '\r' || content.substr(-1) == '\n') {
                content = content.substr(0, content.length - 1);
            }
            // add to position
            if (!this.scripts[position]) this.scripts[position] = [];
            Array.prototype.push.apply(this.scripts[position], content.split(eol));
        }
        return this;
    }

    toString() {
        const eol = ScriptManager.singleton().EOL;
        const result = [];
        [
            ScriptRepository.POSITION_FIRST,
            ScriptRepository.POSITION_MIDDLE,
            ScriptRepository.POSITION_LAST
        ].forEach((position) => {
            if (this.scripts[position]) {
                Array.prototype.push.apply(result, this.scripts[position]);
            }
        });
        if (result.length && this.wrapper && this.wrapper.indexOf('%s') >= 0) {
            for (let i = 0; i < result.length; i++) {
                if (result[i].trim() != '') {
                    result[i] = ' '.repeat(this.wrapSize * 4) + result[i];
                }
            }
            return util.format(this.wrapper, result.join(eol));
        }
        return result.join(eol);
    }

    getContent() {
        if (!this.included) {
            this.included = true;
            return this.toString();
        }
    }

    static get POSITION_FIRST()  { return 'first' }
    static get POSITION_MIDDLE() { return 'middle' }
    static get POSITION_LAST()   { return 'last' }
}

/**
 * Script asset.
 */
class ScriptAsset {

    name = null
    alias = null
    paths = {}
    cdn = true

    constructor(name) {
        this.name = name;
    }

    setAlias(alias) {
        this.alias = alias;
        return this;
    }

    setPath(type, path) {
        this.paths[type] = path;
        return this;
    }

    getPath(type) {
        if (this.paths[type]) {
            return this.paths[type];
        }
    }

    add(type, asset, priority) {
        const manager = ScriptManager.singleton();
        if (!manager.assets[type]) {
            manager.assets[type] = [];
        }
        if (manager.assets[type].indexOf(asset) < 0) {
            priority = priority || ScriptAsset.PRIORITY_DEFAULT;
            if (priority == ScriptAsset.PRIORITY_FIRST) {
                manager.assets[type].unshift(asset);
            } else {
                manager.assets[type].push(asset);
            }
        }
        return this;
    }

    getExtension(type) {
        switch (type) {
            case ScriptAsset.JAVASCRIPT:
                return '.js';
            case ScriptAsset.STYLESHEET:
                return '.css';
        }
    }

    fixExtension(asset, type) {
        if (asset.indexOf('?') < 0) {
            const ext = this.getExtension(type);
            if (ext && asset.substr(-ext.length) !== ext) {
                asset += ext;
            }
        }
        return asset;
    }

    isLocal(asset) {
        return null == asset.match(/(^http(s)*\:)*\/\/(.*)/) ? true : false;
    }

    getDir(type) {
        let result = [];
        let dir = this.getPath(type);
        if (this.name) result.push(this.name);
        if (dir) result.push(dir);
        return result.join('/');
    }

    generate(asset, type) {
        let result;
        if (this.isLocal(asset)) {
            let cdn = ScriptManager.singleton().getCdn(this.alias ? this.alias : this.name);
            if (cdn) {
                result = cdn.get(type, asset, this.getPath(type));
            }
            if (!result) {
                let p = [];
                let dir = this.getDir(type);
                if (this.cdn) p.push(ScriptManager.singleton().CDN);
                if (dir) p.push(dir);
                p.push(asset);
                result = p.join('/');
                if ('/' != result.substr(0, 1)) result = '/' + result;
            }
        } else {
            result = asset;
        }
        const generated = this.fixExtension(result, type);
        debug(`Generate asset ${asset} = ${generated}`);
        return generated;
    }

    use(type, asset, priority) {
        this.add(type, this.generate(asset, type), priority);
        return this;
    }

    static get JAVASCRIPT()       { return 'js' }
    static get STYLESHEET()       { return 'css' }
    static get IMAGE()            { return 'img' }
    static get OTHER()            { return 'other' }

    static get PRIORITY_FIRST()   { return 2 }
    static get PRIORITY_DEFAULT() { return 1 }
}

/**
 * A CDN mapping for script assets.
 */
class CDN {

    repository = null
    url = null
    version = null
    paths = {}
    js = {}
    css = {}

    /**
     * Constructor.
     *
     * @param {string} repository Repository name
     */
    constructor(repository) {
        this.repository = repository;
    }

    /**
     * Set asset path.
     *
     * @param {string} asset Asset name
     * @param {string} path Asset path
     * @returns {CDN}
     */
    setPath(asset, path) {
        this.paths[asset] = path;
        return this;
    }

    /**
     * Get asset path.
     *
     * @param {string} asset Asset name
     * @returns {string}
     */
    getPath(asset) {
        if (this.paths[asset]) {
            return this.paths[asset];
        }
    }

    /**
     * Add javascript asset.
     *
     * @param {string} name Javascript name
     * @param {string} path Javascript path
     * @returns {CDN}
     */
    addJs(name, path) {
        this.js[name] = path;
        return this;
    }

    /**
     * Get javascript asset.
     *
     * @param {string} name JAvascript name
     * @returns {string}
     */
    getJs(name) {
        if (this.js[name]) {
            return this.js[name];
        }
    }

    /**
     * Add stylesheet asset.
     *
     * @param {string} name Stylesheet name
     * @param {string} path Stylesheet path
     * @returns {CDN}
     */
    addCss(name, path) {
        this.css[name] = path;
        return this;
    }

    /**
     * Get stylesheet asset.
     *
     * @param {string} name Stylesheet name
     * @returns {string}
     */
    getCss(name) {
        if (this.css[name]) {
            return this.css[name];
        }
    }

    replaceVersion(str) {
        if (null == this.version) {
            return str.replace(/%VER%\//g, '');
        }
        return str.replace(/%VER%/g, this.version);
    }

    replacePath(str, asset, path = null) {
        let p = this.paths[asset] ? this.paths[asset] : path;
        if (null == p) {
            return str.replace(/%TYPE%\//g, '');
        }
        return str.replace(/%TYPE%/g, p);
    }

    replaceName(str, name) {
        return str.replace(/%NAME%/g, name);
    }

    get(asset, name, path) {
        let cdn, file;
        switch (asset) {
            case ScriptAsset.JAVASCRIPT:
                file = Object.keys(this.js).length > 0 ? this.getJs(name) : name;
                break;
            case ScriptAsset.STYLESHEET:
                file = Object.keys(this.css).length > 0 ? this.getCss(name) : name;
                break;
        }
        if (file) {
            file = this.replaceVersion(file);
            cdn = this.url;
            cdn = this.replacePath(cdn, asset, path);
            cdn = this.replaceVersion(cdn);
            cdn = this.replaceName(cdn, file);
        }
        return cdn;
    }
}

/**
 * Script object.
 */
class Script {

    constructor(name, repository) {
        this.name = name;
        this.position = ScriptAsset.POSITION_LAST;
        this.repository = repository;
        this.defaultAsset = null;
        this.dependencies = [];
        this.asset = null;
        this.assets = {};
        this.included = false;
        this.initialize();
    }

    initialize() {
    }

    addDependencies(dependencies) {
        dependencies = Array.isArray(dependencies) ? dependencies : [dependencies];
        dependencies.forEach((dep) => {
            if (this.dependencies.indexOf(dep) < 0) {
                this.dependencies.push(dep);
            }
        })
        return this;
    }

    include() {
        if (!this.included) {
            this.included = true;
            this.includeDependencies(this.dependencies);
            this.includeAssets();
            this.includeScript();
        }
        return this;
    }

    includeDependencies(dependencies) {
        const manager = ScriptManager.singleton();
        dependencies.forEach((dep) => {
            manager.create(dep).include();
        });
        return this;
    }

    includeAssets() {
        for (let asset in this.assets) {
            let data = this.assets[asset];
            switch (data.type) {
                case ScriptAsset.JAVASCRIPT:
                    this.useJavascript(data.name, data.asset, data.priority);
                    break;
                case ScriptAsset.STYLESHEET:
                    this.useStylesheet(data.name, data.asset, data.priority);
                    break;
            }
        }
        return this;
    }

    includeScript() {
        let script = this.getScript();
        if (script) {
            this.add(script);
        }
        this.getInitScript();
        return this;
    }

    getDefaultAsset() {
        if (null == this.defaultAsset) {
            this.defaultAsset = new ScriptAsset(this.repository);
        }
        return this.defaultAsset;
    }

    getAsset() {
        return this.asset ? this.asset : this.getDefaultAsset();
    }

    getRepository() {
        if (this.repository) {
            const manager = ScriptManager.singleton();
            let repo = manager.repositories[this.repository];
            if (!repo) {
                repo = new ScriptRepository(this.repository);
                manager.repositories[this.repository] = repo;
                this.initRepository(repo);
            }
            return repo;
        }
    }

    initRepository(repository) {
    }

    getScript() {
    }

    getInitScript() {
    }

    useDependencies(dependencies) {
        this.includeDependencies(Array.isArray(dependencies) ? dependencies : [dependencies]);
        return this;
    }

    addAsset(type, name, priority) {
        priority = priority || ScriptAsset.PRIORITY_DEFAULT;
        const key = [type, this.getAsset().name, name].join(':');
        if (!this.assets[key]) {
            this.assets[key] = {type: type, asset: this.getAsset(), name: name, priority: priority};
            debug('Adding asset %s', this.assets[key]);
        }
        return this;
    }

    useAsset(type, name, asset, priority) {
        asset = asset || this.getAsset();
        asset.add(type, asset.generate(name, type), priority);
        return this;
    }

    useJavascript(name, asset, priority) {
        this.useAsset(ScriptAsset.JAVASCRIPT, name, asset, priority);
        return this;
    }

    useStylesheet(name, asset, priority) {
        this.useAsset(ScriptAsset.STYLESHEET, name, asset, priority);
        return this;
    }

    add(script, position) {
        this.include();
        this.getRepository().add(script, position ? position : this.position);
        return this;
    }

    addFirst(script) {
        this.add(script, ScriptRepository.POSITION_FIRST);
        return this;
    }

    addMiddle(script) {
        this.add(script, ScriptRepository.POSITION_MIDDLE);
        return this;
    }

    addLast(script) {
        this.add(script, ScriptRepository.POSITION_LAST);
        return this;
    }
}

ScriptManager.singleton().addDir(__dirname);

module.exports = {
    Script: Script,
    ScriptAsset: ScriptAsset,
    ScriptRepository: ScriptRepository,
    ScriptManager: ScriptManager.singleton(),
}