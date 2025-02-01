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

const { ScriptRepository, ScriptManager } = require('@ntlab/ntjs');
const SemanticUI = ScriptManager.require('SemanticUI');

/**
 * SemanticUI/Loader script repository.
 */
class Loader extends SemanticUI {

    initialize() {
        this.name = 'Loader';
        this.position = ScriptRepository.POSITION_MIDDLE;
        this.addDependencies(['SemanticUI', 'JQuery/Util']);
    }

    getScript() {
        return `
$.loader = function(container, options) {
    const loader = {
        container: container,
        url: options.url,
        column: options.column || 0,
        load(page) {
            const self = this;
            self.page = page || self.page || 1;
            $.get(self.url.replace(/PAGE/, self.page))
                .done(function(json) {
                    if (json.items) {
                        self.add(json.items);
                        if (json.count !== undefined) {
                            self.buildInfo(json.items, json.count);
                        }
                    }
                    if (json.pages && json.pages.length) {
                        self.buildNav(json.pages);
                    }
                    if (typeof options.loaded === 'function') {
                        options.loaded.call(self, json);
                    }
                });
        },
        add(items) {
            const self = this;
            items = Array.isArray(items) ? items : [items];
            let tbody = self.container.find('tbody');
            if (tbody.length) {
                tbody.remove();
            }
            $('<tbody></tbody>').appendTo(self.container);
            tbody = self.container.find('tbody');
            items.forEach(item => {
                const row = options.formatRow.call(self, item);
                row.appendTo(tbody);
            });
        },
        buildInfo(items, count) {
            const self = this;
            const title = self.container.siblings('.x-title');
            if (title.length) {
                switch (count) {
                    case 0:
                        title.html('${this.translate('No result')}');
                        break;
                    case 1:
                        title.html('${this.translate('Showing one result')}');
                        break;
                    default:
                        title.html($.util.template('${this.translate('Showing result from %FIRST% to %LAST% of %COUNT%')}', {
                            FIRST: items[0].nr,
                            LAST: items[items.length - 1].nr,
                            COUNT: count
                        }));
                        break;
                }
            }
        },
        buildNav(items) {
            const self = this;
            let tfoot = self.container.find('tfoot');
            if (tfoot.length) {
                tfoot.remove();
            }
            $('<tfoot></tfoot>').appendTo(self.container);
            tfoot = self.container.find('tfoot');
            const menus = [];
            items.forEach(item => {
                if (item.icon) {
                    menus.push($.util.template('<a class="icon item" data-page="%PAGE%">' +
                        '<i class="%ICON%"></i></a>', {PAGE: item.page, ICON: item.icon}));
                } else {
                    menus.push($.util.template('<a class="%CLASS%" data-page="%PAGE%">%PAGE%</a>', {
                        CLASS: 'item' + (item.page === self.page ? ' active' : ''),
                        PAGE: item.page
                    }));
                }
            });
            if (self.column === 0) {
                self.column = self.container.find('thead tr th').length;
            }
            $('<tr><th colspan="' + self.column + '">' +
                '<div class="ui right floated pagination menu">' + menus.join('') +
                '</div></th></tr>').appendTo(tfoot);
            tfoot.find('a.item').on('click', function(e) {
                e.preventDefault();
                const page = parseInt($(this).attr('data-page'));
                self.load(page);
            });
        },
        iconOverlay(icon, overlay) {
            icon = '<i class="' + icon + ' icon"></i>';
            if (overlay) {
                icon = '<i class="icons">' + icon + '<i class="corner ' + overlay + ' icon"></i></i>'
            }
            return icon;
        },
        icon(type) {
            type = --type;
            const icons = ['phone', 'voicemail', 'paper plane', 'envelope', 'bullhorn', 'bell'];
            if (type >= 0 && type < icons.length) {
                return this.iconOverlay(icons[type]);
            }
        }
    }
    return loader;
}
`;
    }

    static instance() {
        return new this();
    }
}

module.exports = Loader;