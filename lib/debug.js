var path = require("path");
var stackTrace = require("stack-trace");

module.exports = {
    _debug: false,
    set (flag) {
        this._debug = flag;
    },
    isDebugMode () {
        return this._debug;
    },
    log (msg) {
        if (this._debug) {
            var stack = stackTrace.get()[1];
            var file = path.basename(stack.getFileName());
            var method = stack.getFunctionName();
            console.log("\x1b[1m\x1b[34m[" + file + ":" + method + "]: \x1b[0m" + msg);
        }
    },
    error (msg) {
        var stack = stackTrace.get()[1];
        var file = path.basename(stack.getFileName());
        var method = stack.getFunctionName();
        console.error("\x1b[1m\x1b[91m[Error: " + file + ":" + method + "]: \x1b[0m" + msg);
    },
    info (msg) {
        var stack = stackTrace.get()[1];
        var file = path.basename(stack.getFileName());
        var method = stack.getFunctionName();
        console.log("\x1b[1m\x1b[36m[Info: " + file + ":" + method + "]: \x1b[0m" + msg);
    }
}
