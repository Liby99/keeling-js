var fs = require("fs");
var path = require("path");
var schedule = require("node-schedule");
var debug = require("./debug");

module.exports = {
    _tasks: [],
    _hasDir: false,
    init: function (scheduleDir) {
        try {
            this._tasks = fs.readdirSync(scheduleDir).map(function (file) {
                return require(scheduleDir + file);
            });
            this._hasDir = true;
            return true;
        }
        catch (err) {
            if (err.code == "ENOENT") {
                this._hasDir = false;
                debug.log("No Schedule Directory Found");
                return false;
            }
            else {
                throw err;
            }
        }
    },
    run: function () {
        if (this._hasDir) {
            this._tasks.forEach(function (task) {
                schedule.scheduleJob(task.schedule, task.task);
                debug.log("Scheduled task " + task.name);
            });
        }
    }
}
