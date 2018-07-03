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
 * Javascript repository.
 */

const Script = module.exports = exports;

const fs = require('fs');
const util = require('util');
const path = require('path');
const debug = require('debug')('script');

const Dirs = [];
const DefaultScripts = [];
const DefaultAssets = [];

var Repository = {};
var Assets = {};
var Scripts = {};

Script.EOL = '\r\n';
Script.CDN = '/js';

Script.create = function(name) {
    if (!Scripts[name]) {
        const scriptName = name.replace(/\//, path.sep);
        Dirs.forEach((dir) => {
            var match;
            [path.join(dir, scriptName + '.js'), path.join(dir, scriptName, 'index.js')].forEach((scriptFile) => {
                debug(`Try loading script file ${scriptFile}...`);
                if (fs.existsSync(scriptFile)) {
                    match = scriptFile;
                    debug(`Script ${name} matched with ${scriptFile}...`);
                    const script = require(scriptFile);
                    Scripts[name] = script.instance();
                    return true;
                }
            });
            if (match) return true;
        });
    }
    if (!Scripts[name]) {
        throw new Error('Script ' + name + ' can\'t be located.');
    }
    return Scripts[name];
}

Script.addDir = function(path) {
    if (Dirs.indexOf(path) < 0) {
        Dirs.push(path);
    }
}

Script.addDefault = function(name) {
    if (DefaultScripts.indexOf(name) < 0) {
        DefaultScripts.push(name);
    }
}

Script.includeDefaults = function() {
    DefaultScripts.forEach((script) => {
        this.create(script).include();
    })
}

Script.addAsset = function(type, name, asset) {
    if (!asset) asset = this.globalAsset();
    DefaultAssets.push({
        asset: asset,
        type: type,
        name: name
    });
}

Script.includeAssets = function() {
    DefaultAssets.forEach((data) => {
        data.asset.use(data.type, data.name);
    })
}

Script.clear = function() {
    Repository = {};
    Assets = {};
    Scripts = {};
}

Script.getContent = function() {
    var result = [];
    for (var repo in Repository) {
        var content = Repository[repo].getContent();
        if (content) result.push(content);
    }
    return result.join(this.EOL);
}

Script.getAssets = function(type) {
    if (Assets[type]) {
        return Assets[type];
    }
    return [];
}

Script.globalAsset = function() {
    if (!this.gAsset) {
        this.gAsset = new this.Asset('');
        this.gAsset.setPath(Script.Asset.JAVASCRIPT, Script.Asset.JAVASCRIPT);
        this.gAsset.setPath(Script.Asset.STYLESHEET, Script.Asset.STYLESHEET);
        this.gAsset.cdn = false;
    }
    return this.gAsset;
}

Script.Repository = function(name) {
    this.name = name;
    this.scripts = {};
    this.wrapper = null;
    this.wrapSize = 1;
    this.included = false;
}

Script.Repository.POSITION_FIRST = 'first';
Script.Repository.POSITION_MIDDLE = 'middle';
Script.Repository.POSITION_LAST = 'last';

Script.Repository.prototype.clear = function() {
    this.scripts = {};
    this.included = false;
    return this;
}

Script.Repository.prototype.add = function(content, position) {
    var position = position || Script.Repository.POSITION_LAST;
    if (content.length) {
        // fix eol
        while (content.substr(-1) == '\r' || content.substr(-1) == '\n') {
            content = content.substr(0, content.length - 1);
        }
        // add to position
        if (!this.scripts[position]) this.scripts[position] = [];
        this.scripts[position].push(content);
    }
    return this;
}

Script.Repository.prototype.toString = function() {
    var result = '';
    [
        Script.Repository.POSITION_FIRST,
        Script.Repository.POSITION_MIDDLE,
        Script.Repository.POSITION_LAST
    ].forEach((position) => {
        if (this.scripts[position]) {
            result += this.scripts[position].join(Script.EOL);
        }
    });
    if (result.length && this.wrapper && this.wrapper.indexOf('%s') >= 0) {
        result = util.format(this.wrapper, result);
    }
    return result;
}

Script.Repository.prototype.getContent = function() {
    if (!this.included) {
        this.included = true;
        return this.toString();
    }
}

Script.Asset = function(name) {
    this.name = name;
    this.paths = {};
    this.cdn = true;
}

Script.Asset.prototype.setPath = function(type, path) {
    this.paths[type] = path;
    return this;
}

Script.Asset.prototype.getPath = function(type) {
    if (this.paths[type]) {
        return this.paths[type];
    }
}

Script.Asset.prototype.add = function(type, asset, priority) {
    if (!Assets[type]) {
        Assets[type] = [];
    }
    if (Assets[type].indexOf(asset) < 0) {
        var priority = priority || Script.Asset.PRIORITY_DEFAULT;
        if (priority == Script.Asset.PRIORITY_FIRST) {
            Assets[type].unshift(asset);
        } else {
            Assets[type].push(asset);
        }
    }
    return this;
}

Script.Asset.prototype.getExtension = function(type) {
    switch (type) {
        case Script.Asset.JAVASCRIPT:
            return '.js';
        case Script.Asset.STYLESHEET:
            return '.css';
    }
}

Script.Asset.prototype.fixExtension = function(asset, type) {
    if (asset.indexOf('?') < 0) {
        const ext = this.getExtension(type);
        if (ext && asset.substr(-ext.length) !== ext) {
            asset += ext;
        }
    }
    return asset;
}

Script.Asset.prototype.isLocal = function(asset) {
    return null == asset.match(/(^http(s)*\:)*\/\/(.*)/) ? true : false;
}

Script.Asset.prototype.getDir = function(type) {
    var result = [];
    var dir = this.getPath(type);
    if (this.name) result.push(this.name);
    if (dir) result.push(dir);
    return result.join('/');
}

Script.Asset.prototype.generate = function(asset, type) {
    if (this.isLocal(asset)) {
        var result = [];
        var dir = this.getDir(type);
        if (this.cdn) result.push(Script.CDN);
        if (dir) result.push(dir);
        result.push(asset);
        asset = result.join('/');
        if ('/' != asset.substr(0, 1)) asset = '/' + asset;
    }
    return this.fixExtension(asset, type);
}

Script.Asset.prototype.use = function(type, asset, priority) {
    this.add(type, this.generate(asset, type), priority);
    return this;
}

Script.Asset.JAVASCRIPT = 'js';
Script.Asset.STYLESHEET = 'css';
Script.Asset.IMAGE = 'img';
Script.Asset.OTHER = 'other';

Script.Asset.PRIORITY_FIRST = 2;
Script.Asset.PRIORITY_DEFAULT = 1;

Script.Script = function(name, repository) {
    this.name = name;
    this.position = Script.Repository.POSITION_LAST;
    this.dependencies = [];
    this.repository = repository;
    this.included = false;
    this.defaultAsset = null;
    this.asset = null;
    this.assets = {};
    this.initialize();
}

Script.Script.prototype.initialize = function() {
}

Script.Script.prototype.addDependencies = function(dependencies) {
    dependencies = Array.isArray(dependencies) ? dependencies : [dependencies];
    dependencies.forEach((dep) => {
        if (this.dependencies.indexOf(dep) < 0) {
            this.dependencies.push(dep);
        }
    })
    return this;
}

Script.Script.prototype.include = function() {
    if (!this.included) {
        this.included = true;
        this.includeDependencies(this.dependencies);
        this.includeAssets();
        this.includeScript();
    }
    return this;
}

Script.Script.prototype.includeDependencies = function(dependencies) {
    dependencies.forEach((dep) => {
        Script.create(dep).include();
    });
    return this;
}

Script.Script.prototype.includeAssets = function() {
    for (var asset in this.assets) {
        var data = this.assets[asset];
        switch (data.type) {
            case Script.Asset.JAVASCRIPT:
                this.useJavascript(data.name, data.asset, data.priority);
                break;
            case Script.Asset.STYLESHEET:
                this.useStylesheet(data.name, data.asset, data.priority);
                break;
        }
    }
    return this;
}

Script.Script.prototype.includeScript = function() {
    var script = this.getScript();
    if (script) {
        this.add(script);
    }
    this.getInitScript();
    return this;
}

Script.Script.prototype.getDefaultAsset = function() {
    if (null == this.defaultAsset) {
        this.defaultAsset = new Script.Asset(this.repository);
    }
    return this.defaultAsset;
}

Script.Script.prototype.getAsset = function() {
    return this.asset ? this.asset : this.getDefaultAsset();
}

Script.Script.prototype.getRepository = function() {
    if (this.repository) {
        var repo = Repository[this.repository];
        if (!repo) {
            repo = new Script.Repository(this.repository);
            Repository[this.repository] = repo;
            this.initRepository(repo);
        }
        return repo;
    }
}

Script.Script.prototype.initRepository = function(repository) {
}

Script.Script.prototype.getScript = function() {
}

Script.Script.prototype.getInitScript = function() {
}

Script.Script.prototype.useDependencies = function(dependencies) {
    this.includeDependencies(Array.isArray(dependencies) ? dependencies : [dependencies]);
    return this;
}

Script.Script.prototype.addAsset = function(type, name, priority) {
    var priority = priority || Script.Asset.PRIORITY_DEFAULT;
    const key = [type, this.getAsset().name, name].join(':');
    if (!this.assets[key]) {
        this.assets[key] = {type: type, asset: this.getAsset(), name: name, priority: priority};
    }
    return this;
}

Script.Script.prototype.useAsset = function(type, name, asset, priority) {
    var asset = asset || this.getAsset();
    asset.add(type, asset.generate(name, type), priority);
    return this;
}

Script.Script.prototype.useJavascript = function(name, asset, priority) {
    this.useAsset(Script.Asset.JAVASCRIPT, name, asset, priority);
    return this;
}

Script.Script.prototype.useStylesheet = function(name, asset, priority) {
    this.useAsset(Script.Asset.STYLESHEET, name, asset, priority);
    return this;
}

Script.Script.prototype.add = function(script, position) {
    this.include();
    this.getRepository().add(script, position ? position : this.position);
    return this;
}

Script.addDir(__dirname);
