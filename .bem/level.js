var PATH = require('bem/lib/path');

exports.getTechs = function() {
    var techs = {
        'introspection': './techs/introspection.js',
        'haml': './techs/haml.js',
        'scss': './techs/scss.js',
        'coffee': './techs/coffee.js'
    };

    for (var alias in techs) {
        var p = techs[alias];
        if (/\.{1,2}\//.test(p)) techs[alias] = PATH.absolute(p, __dirname);
    }

    return techs

};

exports.defaultTechs = ['haml', 'scss', 'coffee'];
