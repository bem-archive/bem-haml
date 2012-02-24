var INHERIT = require('inherit'),
    FS = require('fs');

exports.Tech = INHERIT(require('bem/lib/techs/js').Tech, {

    getBuildResultChunk: function(relPath, path, suffix) {
        return [
            '# ' + relPath + ': begin',
            FS.readFileSync(path),
            '# ' + relPath + ': end',
            '\n'].join('\n');
    },

});
