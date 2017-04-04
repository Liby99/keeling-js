var fs = require("fs");

fs.mkdirSync("../../public");
fs.mkdirSync("../../data");
fs.mkdirSync("../../router");
fs.mkdirSync("../../ajax");
fs.mkdirSync("../../schedule");

fs.createReadStream("./lib/data/config.json").pipe(fs.createWriteStream("../../data/config.json"));
