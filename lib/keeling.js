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
        
        var self = this;
        
        if (!option) {
            try {
                option = require(DATA_DIR + "config.json");
            }
            catch (err) {
                console.error("User config not found. Initiating default config");
            }
        }
        for (var i in config) {
            if (!option[i]) {
                option[i] = config[i];
            }
        }
        debug.log("User config initiated");
        this.config = option;
        
        var PUBLIC_DIR = path.join(BASE_DIR + this.config["public_directory"] + "/");
        var AJAX_DIR = path.join(BASE_DIR + this.config["ajax_directory"] + "/");
        var ROUTER_DIR = path.join(BASE_DIR + this.config["router_directory"] + "/");
        var SCHEDULE_DIR = path.join(BASE_DIR + this.config["schedule_directory"] + "/");
        var AJAX_REQ = "/" + this.config["ajax_directory"] + "/*";
        
        // Set the debug mode
        debug.set(this.config.debug ? this.config.debug : false);
        
        // Initiate the scheduler
        if (schedule.init(SCHEDULE_DIR)) {
            debug.log("Initiated Scheduler");
        }
        
        // Initiate the express server
        var server = express();
        debug.log("Created Express Server");
        
        // Initialize session
        server.set('trust proxy', 1);
        server.use(session({
            resave: false,
            saveUninitialized: true,
            secret: this.config["session_secret"],
            cookie: {
                maxAge: 60000
            }
        }));
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
        var router = new Router(ROUTER_DIR, this.config.error_page);
        var bindRouter = router.router;
        bindRouter = bindRouter.bind(router);
        server.get(HTML_REQ, bindRouter);
        server.post(HTML_REQ, bindRouter);
        debug.log("Initiated Router");
        
        // Set the ajax
        var ajax = new Ajax(AJAX_DIR);
        var bindPreprocess = ajax.preprocess;
        var bindAjax = ajax.ajax;
        bindPreprocess = bindPreprocess.bind(ajax);
        bindAjax = bindAjax.bind(ajax);
        server.use(AJAX_REQ, bindPreprocess);
        server.get(AJAX_REQ, bindAjax);
        server.post(AJAX_REQ, bindAjax);
        debug.log("Initiated AJAX");
        
        // Set the default page
        server.get("/", function (req, res) {
            res.redirect("/" + self.config["default_page"] + ".html");
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
                console.error("Error starting server " + self.config.name + ": \n" + err);
            }
            else {
                console.log("Successfully started server " + self.config.name + " in port " + self.config.port);
            }
        });
    }
}

module.exports = {
    createServer: function (option) {
        
        // Return the newly created server
        return new Keeling(option);
    }
}
