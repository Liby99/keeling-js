var path = require("path");
var stackTrace = require("stack-trace");

module.exports = function (msg) {
    var stack = stackTrace.get()[1];
    var file = path.basename(stack.getFileName());
    var method = stack.getFunctionName();
    console.log("[" + file + ":" + method + "]: " + msg);
}
