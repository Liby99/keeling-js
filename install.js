var fs = require("fs");
var jsonfile = require("jsonfile");
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
    jsonfile.writeFileSync(dataPath + "config.json", userConfig, {spaces: 4});
    config = userConfig;
}

var basePath = "../../";
var publicPath = basePath + config["public_directory"];
var routerPath = basePath + config["router_directory"];
var ajaxPath = basePath + config["ajax_directory"];
var schedulePath = basePath + config["schedule_directory"];
var start = basePath + "index.js";

if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath);
if (!fs.existsSync(routerPath)) fs.mkdirSync(routerPath);
if (!fs.existsSync(ajaxPath)) fs.mkdirSync(ajaxPath);
if (!fs.existsSync(schedulePath)) fs.mkdirSync(schedulePath);

if (!fs.existsSync(start)) fs.createReadStream("./starter/index.js").pipe(fs.createWriteStream(start));
