var expandDefinitions = require('./');
var map = require('vinyl-map');

module.exports = map(function mapFile(contents) {
    var input = contents.toString();
    var output = expandDefinitions(input);
    return output;
});
