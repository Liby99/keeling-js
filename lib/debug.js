var path = require("path");
var stackTrace = require("stack-trace");

module.exports = {
    _debug: false,
    set (flag) {
        this._debug = flag;
    },
    log (msg) {
        if (this._debug) {
            var stack = stackTrace.get()[1];
            var file = path.basename(stack.getFileName());
            var method = stack.getFunctionName();
            console.log("[" + file + ":" + method + "]: " + msg);
        }
    }
}
