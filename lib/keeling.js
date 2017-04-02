var path = require("path");
var express = require("express");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var bodyParser = require('body-parser')

var config = require("./data/config.json");
var ajax = require("./ajax.js");
var router = require("./router.js");
var debug = require("./debug.js");
var schedule = require("./scheduler.js");

var BASE_DIR = path.join(__dirname + "/../../../");
var DATA_DIR = path.join(BASE_DIR + "data/");
var PUBLIC_DIR = path.join(BASE_DIR + "public/");

var HTML_REQ = /\.html(\?(.\=.\&)+(.\=.)?)?$/;
var AJAX_REQ = "/ajax/*";

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
    constructor() {
        
        var opt = {};
        try {
            opt = require(DATA_DIR + "config.json");
            for (var i in opt) {
                if (config[i]) {
                    config[i] = opt[i];
                }
            }
            console.error("User config not found. Initiating default config");
        }
        catch (err) {
            debug.log("User config initiated");
        }
        this.config = config;
        
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
        app.use(session({ secret: config["session_secret"], cookie: { maxAge: 60000 }}));
        debug.log("Initiated Session");
        
        // Initialize cookie
        server.use(cookieParser());
        debug.log("Initialized Cookie Parser");
        
        // Use BodyParser
        server.use(bodyParser.urlencoded({ extended: false }));
        server.use(bodyParser.json());
        
        // Set Render Engine to EJS
        server.set("views", PUBLIC_DIR);
        server.engine(".html", require("ejs").__express);
        server.set('view engine', "html");
        debug.log("Initiated Render Engine");
        
        // Set the router
        server.use(HTML_REQ, router.preprocess);
        server.get(HTML_REQ, router.router);
        server.post(HTML_REQ, router.router);
        debug.log("Initiated Router");
        
        // Set the ajax
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
        server.use("/", express.static(PUBLIC_DIR));
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
