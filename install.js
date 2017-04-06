var fs = require("fs");
var config = require("./lib/data/config.json");
var dataPath = "../../data/";

if (!fs.existsSync(dataPath + "config.json")) {
    fs.createReadStream("./lib/data/config.json").pipe(fs.createWriteStream(dataPath + "config.json"));
}
else {
    var userConfig = require(dataPath + "config.json");
    for (var i in config) {
        if (!userConfig[i]) {
            userConfig[i] = config[i];
        }
    }
    fs.writeFileSync(dataPath + "config.json", JSON.stringify(userConfig));
    config = userConfig;
}

var publicPath = "../../" + config["public_directory"];
var routerPath = "../../" + config["router_directory"];
var ajaxPath = "../../" + config["ajax_directory"];
var schedulePath = "../../" + config["schedule_directory"];

if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath);
if (!fs.existsSync(routerPath)) fs.mkdirSync(routerPath);
if (!fs.existsSync(ajaxPath)) fs.mkdirSync(ajaxPath);
if (!fs.existsSync(schedulePath)) fs.mkdirSync(schedulePath);
