var expandDefinitions = require('./');
var map = require('vinyl-map');

module.exports = function streamWrapper() {
    return map(function mapFile(contents) {
        var input = contents.toString();
        var output = expandDefinitions(input);
        return output;
    });
};