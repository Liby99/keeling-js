var path = require("path");
var express = require("express");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var config = require("./data/config.json");
var Ajax = require("./ajax.js");
var Router = require("./router.js");
var debug = require("./debug.js");
var schedule = require("./scheduler.js");

var BASE_DIR = path.join(__dirname + "/../../../");
var DATA_DIR = path.join(BASE_DIR + "data/");
var HTML_REQ = /\.html(\?(.\=.\&)+(.\=.)?)?$/;

class Keeling {
    
    constructor(option) {
        
        // Initiate Options First of all
        this.initiateOption(option);
        
        // Initiate submodules
        this.initiateDebug();
        this.initiateScheduler();
        this.initiateDatabase();
        
        // Initiate the server
        this.initiateServer();
        this.initiateSession();
        this.initiateCookie();
        this.initiateParser();
        this.initiateAjax();
        this.initiateRouter();
    }
    
    initiateOption(option) {
        
        // Initialize the option
        if (!option) {
            try {
                option = require(DATA_DIR + "config.json");
            }
            catch (err) {
                console.error("User config not found. Initiating default config");
            }
        }
        for (var i in config) {
            if (option[i] === undefined) {
                option[i] = config[i];
            }
        }
        
        // Set the port from environment if exist
        option.port = process.env.PORT || option.port;
        
        // Store the config
        this.config = option;
        debug.log("User config initiated");
    }
    
    initiateDebug() {
        
        // Set the debug mode
        debug.set(this.config.debug ? this.config.debug : false);
        debug.log("Debug Mode: " + this.config.debug ? "on" : "off");
    }
    
    initiateScheduler() {
        
        var SCHEDULE_DIR = path.join(BASE_DIR + this.config["schedule_directory"] + "/");
        
        // Initiate the scheduler
        if (schedule.init(SCHEDULE_DIR)) {
            debug.log("Initiated Scheduler");
        }
    }
    
    initiateDatabase() {
        this.initiateMysql();
        this.initiateMongo();
    }
    
    initiateMysql() {
        try {
            var mysqlConfig = require(DATA_DIR + "mysql.json");
            require("./mysql.js").init(mysqlConfig);
        }
        catch (err) {
            debug.log("MySql config not found: \n" + err);
        }
    }
    
    initiateMongo() {
        try {
            var mongoConfig = require(DATA_DIR + "mongo.json");
            require("./mongo.js").init(mongoConfig);
        }
        catch (err) {
            debug.log("Mongo config not found: \n" + err);
        }
    }
    
    initiateServer() {
        
        // Initiate the express server
        this.server = express();
        debug.log("Created Express Server");
    }
    
    initiateSession() {
        
        // Initialize session
        this.server.set('trust proxy', 1);
        this.server.use(session({
            resave: false,
            saveUninitialized: true,
            secret: this.config["session_secret"],
            cookie: {
                maxAge: 60000
            }
        }));
        debug.log("Initiated Session");
    }
    
    initiateCookie() {
        
        // Initialize cookie
        this.server.use(cookieParser());
        debug.log("Initialized Cookie Parser");
    }
    
    initiateParser() {
        
        // Use BodyParser
        this.server.use(bodyParser.urlencoded({ extended: false }));
        this.server.use(bodyParser.json());
    }
    
    initiateAjax() {
        
        var AJAX_DIR = path.join(BASE_DIR + this.config["ajax_directory"] + "/");
        var AJAX_REQ = "/" + this.config["ajax_directory"] + "/*";
        
        // Set the ajax
        var ajax = new Ajax(AJAX_DIR);
        var bindPreprocess = ajax.preprocess;
        var bindAjax = ajax.ajax;
        bindPreprocess = bindPreprocess.bind(ajax);
        bindAjax = bindAjax.bind(ajax);
        this.server.use(AJAX_REQ, bindPreprocess);
        this.server.get(AJAX_REQ, bindAjax);
        this.server.post(AJAX_REQ, bindAjax);
        debug.log("Initiated AJAX");
    }
    
    initiateRouter() {
        
        var self = this;
        
        var PUBLIC_DIR = path.join(BASE_DIR + this.config["public_directory"] + "/");
        var ROUTER_DIR = path.join(BASE_DIR + this.config["router_directory"] + "/");
        
        // Set Render Engine to EJS
        this.server.set("views", PUBLIC_DIR);
        this.server.engine(".html", require("ejs").__express);
        this.server.set('view engine', "html");
        debug.log("Initiated Render Engine");
        
        // Set the router
        var router = new Router(ROUTER_DIR, this.config.error_page);
        var bindRouter = router.router;
        bindRouter = bindRouter.bind(router);
        this.server.get(HTML_REQ, bindRouter);
        this.server.post(HTML_REQ, bindRouter);
        debug.log("Initiated Router");
        
        // Set the default page
        this.server.get("/", function (req, res) {
            res.redirect(self.config["default_page"] + ".html");
        });
        debug.log("Initiated Default Page");
        
        // Set the static
        this.server.use("/", express.static(PUBLIC_DIR));
        debug.log("Initiated Static Field");
    }
    
    /**
     * Use Middleware in express server
     */
    use(middleware) {
        this.server.use(middleware);
    }
    
    /**
     * Start the server, make the server listen to the port in config
     */
    start() {
        
        // Precache self
        var self = this;
        
        schedule.run();
        
        // Listen to the port specified in the
        this.server.listen(this.config.port, function (err) {
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
    createServer (option) {
        
        // Return the newly created server
        return new Keeling(option);
    }
}
