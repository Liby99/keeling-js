var path = require("path");
var express = require("express");

var config = require("./data/config.json");
var ajax = require("./ajax.js");
var router = require("./router.js");
var debug = require("./debug.js");

var BASE_DIR = path.join(__dirname + "../../../");
var DATA_DIR = path.join(BASE_DIR + "data/");
var VIEW_DIR = path.join(BASE_DIR + "view/");
var RES_DIR = path.join(BASE_DIR + "res/");
var SCHEDULED_DIR = path.join(BASE_DIR + "scheduled/");
var ROUTER_DIR = path.join(BASE_DIR + "router/");
var AJAX_DIR = path.join(BASE_DIR + "ajax/");

class Keeling {
    constructor(opt) {
        
        // Save the options
        this.opt = opt;
        
        // Set the debug mode
        debug.set(opt.debug ? opt.debug : false);
    }
    start() {
        
        // Initiate the express server
        this.server = express();
        
        // Set the static
        this.server.static(RES_DIR);
    }
}

module.exports = {
    createServer: function (opt) {
        return new Keeling(mergeOption(opt, config));
    }
}
