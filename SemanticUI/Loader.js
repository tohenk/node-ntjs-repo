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
 * Data loader script repository.
 */

const Script = module.exports = exports;

const util = require('util');
const script = require('./../index');
const semantic = require('./index');

Script.instance = function() {
    return new this.Loader();
}

Script.Loader = function() {
    semantic.SemanticUI.call(this);
}

util.inherits(Script.Loader, semantic.SemanticUI);

Script.Loader.prototype.initialize = function() {
    this.name = 'Loader';
    this.position = script.Repository.POSITION_MIDDLE;
    this.addDependencies(['SemanticUI', 'jQuery/Util']);
}

Script.Loader.prototype.getScript = function() {
    return `
$.loader = function(container, options) {
    var loader = {
        container: container,
        url: options.url,
        column: options.column || 0,
        load: function(page) {
            var self = this;
            var page = page || self.page || 1;
            self.page = page;
            $.get(self.url.replace(/PAGE/, page)).then(function(json) {
                if (json.items) self.add(json.items);
                if (json.pages && json.pages.length) self.buildNav(json.pages);
                if (typeof options.loaded == 'function') {
                    options.loaded.call(self, json);
                }
            });
        },
        add: function(items) {
            var self = this;
            var items = $.isArray(items) ? items : [items];
            var tbody = self.container.find('tbody');
            if (tbody.length) tbody.remove();
            $('<tbody></tbody>').appendTo(self.container);
            var tbody = self.container.find('tbody');
            $.each(items, function(idx, item) {
                var row = options.formatRow.call(self, item);
                row.appendTo(tbody);
            });
        },
        buildNav: function(items) {
            var self = this;
            var tfoot = self.container.find('tfoot');
            if (tfoot.length) tfoot.remove();
            $('<tfoot></tfoot>').appendTo(self.container);
            var tfoot = self.container.find('tfoot');
            var menus = [];
            $.each(items, function(idx, item) {
                if (item.icon) {
                    menus.push($.util.template('<a class="icon item" data-page="%PAGE%">' +
                        '<i class="%ICON%"></i></a>', {PAGE: item.page, ICON: item.icon}));
                } else {
                    menus.push($.util.template('<a class="%CLASS%" data-page="%PAGE%">%PAGE%</a>', {
                        CLASS: 'item' + (item.page == self.page ? ' active' : ''),
                        PAGE: item.page
                    }));
                }
            });
            if (self.column == 0) {
                self.column = self.container.find('thead tr th').length;
            }
            $('<tr><th colspan="' + self.column + '">' +
              '<div class="ui right floated pagination menu">' + menus.join('') +
              '</div></th></tr>').appendTo(tfoot);
            tfoot.find('a.item').on('click', function(e) {
                e.preventDefault();
                var page = parseInt($(this).attr('data-page'));
                self.load(page);
            });
        },
        iconOverlay: function(icon, overlay) {
            icon = '<i class="' + icon + ' icon"></i>';
            if (overlay) {
                icon = '<i class="icons">' + icon + '<i class="corner ' + overlay + ' icon"></i></i>'
            }
            return icon;
        },
        icon: function(type) {
            var icon;
            switch (type) {
                case 1:
                    icon = this.iconOverlay('phone');
                    break;
                case 2:
                    icon = this.iconOverlay('phone volume');
                    break;
                case 3:
                    icon = this.iconOverlay('share square');
                    break;
                case 4:
                    icon = this.iconOverlay('envelope');
                    break;
                case 5:
                    icon = this.iconOverlay('bullhorn');
                    break;
                case 6:
                    icon = this.iconOverlay('bell');
                    break;
            }
            return icon;
        }
    }
    return loader;
}
`;
}
