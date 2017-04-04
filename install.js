var fs = require("fs");

fs.mkdirSync("../../public");
fs.mkdirSync("../../data");
fs.mkdirSync("../../router");
fs.mkdirSync("../../ajax");
fs.mkdirSync("../../schedule");

fs.writeFileSync("../../data/config.json", JSON.stringify(require("./lib/data/config.json")));
