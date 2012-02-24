exports.baseLevelPath = require.resolve('../../.bem/level.js');
exports.getTechs = function() {
    var techs;
    techs = techs || this.__base();
    delete techs['scss'];
    delete techs['coffee'];
    return techs;
};
