var path = require("path");
var express = require("express");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var bodyParser = require('body-parser');

var config = require("./data/config.json");
var Ajax = require("./ajax.js");
var Router = require("./router.js");
var debug = require("./debug.js");
var schedule = require("./scheduler.js");

var BASE_DIR = path.join(__dirname + "/../../../");
var DATA_DIR = path.join(BASE_DIR + "data/");
var HTML_REQ = /\.html(\?(.\=.\&)+(.\=.)?)?$/;

/**
 * Class Keeling, the
 * @type {[Keeling]}
 */
class Keeling {
    
    /**
     * [constructor description]
     * @param  {[type]} opt [description]
     * @return {[type]}     [description]
     */
    constructor(option) {
        
        if (!option) {
            try {
                option = require(DATA_DIR + "config.json");
            }
            catch (err) {
                console.error("User config not found. Initiating default config");
            }
        }
        for (var i in option) {
            if (config[i]) {
                config[i] = opt[i];
            }
        }
        debug.log("User config initiated");
        this.config = config;
        
        var PUBLIC_DIR = path.join(BASE_DIR + config["public_directory"] + "/");
        var AJAX_DIR = path.join(BASE_DIR + config["ajax_directory"] + "/");
        var ROUTER_DIR = path.join(BASE_DIR + config["router_directory"] + "/");
        var SCHEDULE_DIR = path.join(BASE_DIR + config["schedule_directory"] + "/");
        var AJAX_REQ = "/" + config["ajax_directory"] + "/*";
        
        // Set the debug mode
        debug.set(opt.debug ? opt.debug : false);
        
        // Initiate the scheduler
        schedule.init();
        debug.log("Initiated Scheduler");
        
        // Initiate the express server
        var server = express();
        debug.log("Created Express Server");
        
        // Initialize session
        server.set('trust proxy', 1);
        server.use(session({ secret: config["session_secret"], cookie: { maxAge: 60000 }}));
        debug.log("Initiated Session");
        
        // Initialize cookie
        server.use(cookieParser());
        debug.log("Initialized Cookie Parser");
        
        // Use BodyParser
        server.use(bodyParser.urlencoded({ extended: false }));
        server.use(bodyParser.json());
        
        // Set Render Engine to EJS
        server.set("views", process.env.PUBLIC_DIR);
        server.engine(".html", require("ejs").__express);
        server.set('view engine', "html");
        debug.log("Initiated Render Engine");
        
        // Set the router
        var router = new Router(ROUTER_DIR, config.error_page);
        server.get(HTML_REQ, router.router);
        server.post(HTML_REQ, router.router);
        debug.log("Initiated Router");
        
        // Set the ajax
        var ajax = new Ajax(AJAX_DIR);
        server.use(AJAX_REQ, ajax.preprocess);
        server.get(AJAX_REQ, ajax.ajax);
        server.post(AJAX_REQ, ajax.ajax);
        debug.log("Initiated AJAX");
        
        // Set the default page
        server.get("/", function (req, res) {
            res.redirect("/" + config["default_page"] + ".html");
        });
        debug.log("Initiated Default Page");
        
        // Set the static
        server.use("/", express.static(process.env.PUBLIC_DIR));
        debug.log("Initiated Static Field");
        
        this.server = server;
    }
    
    /**
     * Start the server, make the server listen to the port in config
     */
    start() {
        
        // Precache self
        var self = this;
        
        schedule.run();
        
        // Listen to the port specified in the
        self.server.listen(self.config.port, function (err) {
            if (err) {
                console.error("Error starting server " + self.opt.name + ": \n" + err);
            }
            else {
                console.log("Successfully started server " + self.config.name + " in port " + self.config.port);
            }
        });
    }
}

module.exports = {
    createServer: function () {
        
        // Return the newly created server
        return new Keeling();
    }
}
