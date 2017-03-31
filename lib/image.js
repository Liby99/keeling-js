var fs = require("fs");
var path = require("path");

var regex = /^data:([A-Za-z-+\/]+);base64,(.+)$/;

module.exports = {
    decodeBase64Image(data) {
        var matches = data.match(regex);
        if (!matches || matches.length !== 3) {
            throw new Error('Invalid input string');
        }
        return new Buffer(matches[2], 'base64');
    }
}
