var fs = require("fs");
var path = require("path");
var schedule = require("node-schedule");
var debug = require("./debug").log;

var BASE_DIR = path.join(__dirname + "/../../../");
var SCHEDULE_DIR = path.join(BASE_DIR + "schedule/");

module.exports = {
    _tasks: [],
    _hasDir: false,
    init: function () {
        try {
            this._tasks = fs.readdirSync(SCHEDULE_DIR).map(function (file) {
                return require(SCHEDULE_DIR + file);
            });
            this._hasDir = true;
        }
        catch (err) {
            this._hasDir = false;
            debug("No Schedule Directory Found");
        }
    },
    run: function () {
        if (this._hasDir) {
            this._tasks.forEach(function (task) {
                schedule.scheduleJob(task.schedule, task.task);
                debug("Scheduled task " + task.name);
            });
        }
    }
}
