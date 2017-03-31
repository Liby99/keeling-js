var path = require("path");
var express = require("express");
var session = require("express-session");
var cookieParser = require("cookie-parser");

var config = require("./data/config.json");
var ajax = require("./ajax.js");
var router = require("./router.js");
var debug = require("./debug.js");
var schedule = require("./scheduler.js");

var BASE_DIR = path.join(__dirname + "/../../../");
var DATA_DIR = path.join(BASE_DIR + "data/");
var PUBLIC_DIR = path.join(BASE_DIR + "public/");

var HTML_REQ = /\.html(\?(.\=.\&)+)?$/;
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
    constructor(opt) {
        
        // Save the options
        this.opt = opt;
        
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
        server.use(session({
            secret: 'keyboard cat',
            resave: false,
            saveUninitialized: true,
            cookie: { secure: true }
        }));
        debug.log("Initiated Session");
        
        // Initialize cookie
        server.use(cookieParser());
        debug.log("Initialized Cookie Parser");
        
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
        
        // Set the static
        server.use("/", express.static(RES_DIR));
        debug.log("Initiated Static Field");
        
        // Set the default page
        server.get("/", function (req, res) {
            res.redirect("/" + config["default_page"] + ".html");
        });
        debug.log("Initiated Default Page");
        
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
        self.server.listen(self.opt.port, function (err) {
            if (err) {
                debug.log("Error starting server " + self.opt.name + ": \n" + err);
            }
            else {
                debug.log("Successfully started server " + self.opt.name + " in port " + self.opt.port);
            }
        });
    }
}

module.exports = {
    debug: debug,
    createServer: function (opt) {
        
        // Merge the option to config
        if (opt) {
            for (var i in opt) {
                if (config[i]) {
                    config[i] = opt[i];
                }
            }
        }
        
        // Return the newly created server
        return new Keeling(config);
    }
}
