Code Javascript Everywhere!
===========================

This is a port of [PHP-NTJS](https://github.com/tohenk/php-ntjs).

NODE-NTJS allows to dynamically manage your javascripts, stylesheets, and
scripts so you can focus on your code. You can code your javascript using
ES6 class, or write directly in the javascript code, even on template.

JQuery and SemanticUI/FomanticUI
--------------------------------

Support for popular javascript like JQuery, SemanticUI/FomanticUI.

Using external CDN
------------------

An external CDN is also supported, simply pass CDN parameters to ScriptManager
```js
const { ScriptManager } = require('@ntlab/ntjs');

const cdn = {
    jquery: {
        version: '3.5.1',
        url: 'https://code.jquery.com/%NAME%',
        js: {
            jquery: 'jquery-%VER%',
            'jquery.min': 'jquery-%VER%.min'
        }
    },
    'semantic-ui': {
        version: '2.8.7',
        url: 'https://cdnjs.cloudflare.com/ajax/libs/fomantic-ui/%VER%/%NAME%'
    }
}
ScriptManager.parseCdn(cdn);
```

Example Usage
-------------

See usage example in [NODE-EXPRESS-MIDDLEWARE](https://github.com/tohenk/node-express-middleware).

TODO
----

* Script output minifying is not yet supported.
