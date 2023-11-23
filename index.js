/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2018-2023 Toha <tohenk@yahoo.com>
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

    repositories = {}
    assets = {}
    scripts = {}

    /**
     * Create script instance or return one if its already created.
     *
     * @param {string} name Script name
     * @returns {Script}
     */
    create(name) {
        if (!this.scripts[name]) {
            debug(`Load script ${name}`);
            const script = ScriptManager.require(name);
            this.scripts[name] = script.instance()
                .setManager(this)
                .doInitialize();
        }
        if (!this.scripts[name]) {
            throw new Error(`Script ${name} can't be located.`);
        }
        return this.scripts[name];
    }

    /**
     * Set this as default instance.
     *
     * @returns {ScriptManager}
     */
    setInstance() {
        ScriptManager.instance = this;
        return this;
    }

    /**
     * Include all default scripts.
     *
     * @returns {ScriptManager}
     */
    includeDefaults() {
        ScriptManager.defaultScripts.forEach(script => {
            debug('Including default script %s', script);
            this.create(script).include();
        });
        return this;
    }

    /**
     * Include all assets.
     *
     * @returns {ScriptManager}
     */
    includeAssets() {
        ScriptManager.defaultAssets.forEach(data => {
            debug('Including default asset %s', data);
            const asset = data.asset ? data.asset : this.globalAsset();
            asset.use(data.type, data.name);
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
        for (const repo in this.repositories) {
            const content = this.repositories[repo].getContent();
            if (content) {
                result.push(content);
            }
        }
        return result.join(ScriptManager.EOL);
    }

    getAssets(type) {
        if (this.assets[type]) {
            return this.assets[type];
        }
        return [];
    }

    globalAsset() {
        if (!this.gAsset) {
            this.gAsset = new ScriptAsset();
            this.gAsset.setManager(this);
            this.gAsset.setPath(ScriptAsset.JAVASCRIPT, ScriptAsset.JAVASCRIPT);
            this.gAsset.setPath(ScriptAsset.STYLESHEET, ScriptAsset.STYLESHEET);
            this.gAsset.cdn = false;
        }
        return this.gAsset;
    }

    /**
     * Require script file.
     *
     * @param {string} name 
     * @returns {any}
     */
    static require(name) {
        const scriptName = name.replace(/\//, path.sep);
        let scriptFilename = scriptCaches[scriptName];
        if (!scriptFilename) {
            ScriptManager.dirs.forEach(dir => {
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
        scriptCaches[scriptName] = scriptFilename;
        return require(scriptFilename);
    }

    /**
     * Register script directory which script will be looked up.
     *
     * @param {string} path Path name
     * @returns {ScriptManager}
     */
    static addDir(path) {
        if (ScriptManager.dirs.indexOf(path) < 0) {
            ScriptManager.dirs.push(path);
        }
        return ScriptManager;
    }

    /**
     * Add default script to include.
     *
     * @param {string} name Script name
     * @returns {ScriptManager}
     */
    static addDefault(name) {
        if (ScriptManager.defaultScripts.indexOf(name) < 0) {
            debug('Adding default script %s', name);
            ScriptManager.defaultScripts.push(name);
        }
        return ScriptManager;
    }

    /**
     * Add default asset.
     *
     * @param {string} type Asset type
     * @param {string} name Asset name
     * @param {ScriptAsset} asset Asset data
     * @returns {ScriptManager}
     */
    static addDefaultAsset(type, name, asset = null) {
        ScriptManager.defaultAssets.push({
            asset: asset,
            type: type,
            name: name
        });
        return ScriptManager;
    }

    /**
     * Add CDN repository.
     *
     * @param {string} repo
     * @returns {CDN}
     */
    static addCdn(repo) {
        if (!ScriptManager.cdns[repo]) {
            ScriptManager.cdns[repo] = new CDN(repo);
        }
        return ScriptManager.cdns[repo];
    }

    /**
     * Get CDN repository.
     *
     * @param {string} repo Repository name
     * @returns {CDN}
     */
    static getCdn(repo) {
        if (ScriptManager.cdns[repo]) {
            return ScriptManager.cdns[repo];
        }
    }

    /**
     * Parse and register CDN.
     *
     * @param {Object} cdns CDN parameters
     * @returns {ScriptManager}
     */
    static parseCdn(cdns) {
        const providers = {};
        Object.keys(cdns).forEach(repo => {
            const parameters = cdns[repo];
            if (repo === '') {
                Object.assign(providers, parameters);
            } else {
                let enabled = true;
                if (typeof parameters.disabled != 'undefined' && parameters.disabled) {
                    enabled = false;
                }
                if (enabled) {
                    const cdn = ScriptManager.addCdn(repo);
                    if (parameters.url) {
                        cdn.url = parameters.url;
                    } else {
                        Object.keys(providers).forEach(provider => {
                            if (typeof parameters[provider] !== 'undefined') {
                                cdn.pkg = parameters[provider] ? parameters[provider] : repo;
                                cdn.url = providers[provider];
                                return true;
                            }
                        });
                    }
                    if (parameters.version) {
                        cdn.version = parameters.version;
                    }
                    [ScriptAsset.JAVASCRIPT, ScriptAsset.STYLESHEET].forEach(asset => {
                        if (parameters.paths && parameters.paths[asset]) {
                            cdn.setPath(asset, parameters.paths[asset]);
                        }
                        if (parameters[asset]) {
                            const assets = parameters[asset];
                            Object.keys(assets).forEach(name => {
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
                    debug('CDN parsed: %s', cdn);
                }
            }
        });
        return ScriptManager;
    }

    static factory(script) {
        if (!ScriptManager.instance) {
            throw new Error('No manager instance found!');
        }
        return ScriptManager.instance.create(script);
    }

    static newInstance() {
        const instance = new this();
        return instance
            .includeDefaults()
            .setInstance();
    }

    static get dirs() {
        if (ScriptManager._dirs === undefined) {
            ScriptManager._dirs = [];
        }
        return ScriptManager._dirs;
    }

    static get defaultScripts() {
        if (ScriptManager._defaultScripts === undefined) {
            ScriptManager._defaultScripts = [];
        }
        return ScriptManager._defaultScripts;
    }

    static get defaultAssets() {
        if (ScriptManager._defaultAssets === undefined) {
            ScriptManager._defaultAssets = [];
        }
        return ScriptManager._defaultAssets;
    }

    static get cdns() {
        if (ScriptManager._cdns === undefined) {
            ScriptManager._cdns = {};
        }
        return ScriptManager._cdns;
    }

    static get EOL() {
        return '\n'
    }

    static get CDN() {
        return '/js';
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
            // add to position
            if (!this.scripts[position]) {
                this.scripts[position] = [];
            }
            const lines = this.cleanLines(content);
            this.scripts[position].push(...lines);
        }
        return this;
    }

    cleanLines(str) {
        const lines = str.split(ScriptManager.EOL);
        let pos = 0;
        while (true) {
            if (lines.length) {
                if (pos === 0) {
                    if (lines[0].trim() === '') {
                        lines.shift();
                    } else {
                        pos++;
                    }
                    continue;
                } else if (pos === 1) {
                    if (lines[lines.length - 1].trim() === '') {
                        lines.pop();
                    } else {
                        pos++;
                    }
                    continue;
                }
            }
            break;
        }
        return lines;
    }

    toString() {
        const eol = ScriptManager.EOL;
        const result = [];
        [
            ScriptRepository.POSITION_FIRST,
            ScriptRepository.POSITION_MIDDLE,
            ScriptRepository.POSITION_LAST
        ].forEach((position) => {
            if (this.scripts[position]) {
                result.push(...this.scripts[position]);
            }
        });
        if (result.length && this.wrapper && this.wrapper.indexOf('%s') >= 0) {
            for (let i = 0; i < result.length; i++) {
                if (result[i].trim() !== '') {
                    result[i] = ' '.repeat(this.wrapSize * 4) + result[i];
                }
            }
            const wrappers = this.wrapper.split(eol);
            if (wrappers.length && wrappers[0].trim() === '') {
                wrappers.shift();
            }
            if (wrappers.length && wrappers[wrappers.length - 1].trim() === '') {
                wrappers.pop();
            }
            return util.format(wrappers.join(eol), eol + result.join(eol));
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

    manager = null
    name = null
    alias = null
    paths = {}
    cdn = true

    constructor(name = null) {
        this.name = name;
    }

    setManager(manager) {
        this.manager = manager;
        return this;
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
        if (!this.manager.assets[type]) {
            this.manager.assets[type] = [];
        }
        if (this.manager.assets[type].indexOf(asset) < 0) {
            priority = priority || ScriptAsset.PRIORITY_DEFAULT;
            if (priority == ScriptAsset.PRIORITY_FIRST) {
                this.manager.assets[type].unshift(asset);
            } else {
                this.manager.assets[type].push(asset);
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
        const result = [];
        const dir = this.getPath(type);
        if (this.name) {
            result.push(this.name);
        }
        if (dir) {
            result.push(dir);
        }
        return result.join('/');
    }

    generate(asset, type) {
        let result;
        if (this.isLocal(asset)) {
            const cdn = ScriptManager.getCdn(this.alias ? this.alias : this.name);
            if (cdn) {
                result = cdn.get(type, asset, this.getPath(type));
            }
            if (!result) {
                const p = [];
                const dir = this.getDir(type);
                if (this.cdn) {
                    p.push(ScriptManager.CDN);
                }
                if (dir) {
                    p.push(dir);
                }
                p.push(asset);
                result = p.join('/');
                if ('/' != result.substring(0, 1)) {
                    result = '/' + result;
                }
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

    repo = null
    pkg = null
    url = null
    version = null
    paths = {}
    js = {}
    css = {}
    tags = ['%', '<>']

    /**
     * Constructor.
     *
     * @param {string} repo Repository name
     */
    constructor(repo) {
        this.repo = repo;
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

    replaceTag(str, tag, value) {
        this.tags.forEach(marker => {
            const tagged = marker.substr(0, 1) + tag + marker.substr(marker.length > 1 ? 1 : 0, 1);
            if (str.indexOf(tagged) >= 0) {
                str = str.replace(tagged + (value && value.toString().length ? '' : '/'), value);
            }
        });
        return str;
    }

    replacePackage(str) {
        return this.replaceTag(str, 'PKG', this.pkg);
    }

    replaceVersion(str) {
        return this.replaceTag(str, 'VER', this.version);
    }

    replacePath(str, asset, path = null) {
        return this.replaceTag(str, 'TYPE', this.paths[asset] ? this.paths[asset] : path);
    }

    replaceName(str, name) {
        return this.replaceTag(str, 'NAME', name);
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
            cdn = this.replacePackage(this.url);
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
        this.assetPath = null;
        this.defaultAsset = null;
        this.dependencies = [];
        this.asset = null;
        this.assets = {};
        this.included = false;
    }

    doInitialize() {
        this.initialize();
        return this;
    }

    initialize() {
    }

    setManager(manager) {
        this.manager = manager;
        return this;
    }

    addDependencies(dependencies) {
        dependencies = Array.isArray(dependencies) ? dependencies : [dependencies];
        dependencies.forEach(dep => {
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
        dependencies.forEach(dep => {
            this.manager.create(dep).include();
        });
        return this;
    }

    includeAssets() {
        for (const asset in this.assets) {
            const data = this.assets[asset];
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
        const script = this.getScript();
        if (script) {
            this.add(script);
        }
        this.getInitScript();
        return this;
    }

    getDefaultAsset() {
        if (null === this.defaultAsset) {
            this.defaultAsset = new ScriptAsset(this.assetPath);
        }
        return this.defaultAsset;
    }

    getAsset() {
        const asset = this.asset ? this.asset : this.getDefaultAsset();
        if (asset.manager === null) {
            asset.setManager(this.manager);
        }
        return asset;
    }

    getRepository() {
        if (this.repository) {
            const repository = this.repository ? this.repository : this.name;
            let repo = this.manager.repositories[repository];
            if (!repo) {
                repo = new ScriptRepository(repository);
                this.manager.repositories[repository] = repo;
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
        const asset = this.getAsset();
        const key = [type, asset.name, name].join(':');
        if (!this.assets[key]) {
            this.assets[key] = {type: type, asset: asset, name: name, priority: priority};
            debug('Adding asset %s: %s', type, name);
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

    translate(message) {
        if (typeof ScriptManager.translator === 'function') {
            message = ScriptManager.translator(message);
        }
        return message;
    }
}

ScriptManager.addDir(__dirname);

module.exports = {
    Script: Script,
    ScriptAsset: ScriptAsset,
    ScriptRepository: ScriptRepository,
    ScriptManager: ScriptManager,
}