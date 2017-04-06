var fs = require("fs");
var path = require("path");
var schedule = require("node-schedule");
var debug = require("./debug");

module.exports = {
    _tasks: [],
    _hasDir: false,
    init: function () {
        try {
            this._tasks = fs.readdirSync(process.env.SCHEDULE_DIR).map(function (file) {
                return require(process.env.SCHEDULE_DIR + file);
            });
            this._hasDir = true;
        }
        catch (err) {
            this._hasDir = false;
            debug.log("No Schedule Directory Found");
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
