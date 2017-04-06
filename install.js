var fs = require("fs");
var config = require("./lib/data/config.json");

fs.mkdirSync("../../public");
fs.mkdirSync("../../data");
fs.mkdirSync("../../" + config["router_directory"]);
fs.mkdirSync("../../" + config["ajax_directory"]);
fs.mkdirSync("../../" + config["schedule_directory"]);

if (!fs.existsSync("../../data/config.json")) {
    fs.createReadStream("./lib/data/config.json").pipe(fs.createWriteStream("../../data/config.json"));
}
else {
    var userConfig = require("../../data/config.json");
    for (var i in config) {
        if (!userConfig[i]) {
            userConfig[i] = config[i];
        }
    }
    fs.writeFileSync("../../data/config.json", JSON.stringify(userConfig));
}
