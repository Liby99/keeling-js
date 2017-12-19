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
        
        var self = this;
        
        // Initiate Options and Debug Module First of all
        this.initiateOption(option);
        this.initiateDebug();
        
        // Initiate submodules
        this.initiateDatabase(function () {
            
            // Initiate the server
            self.initiateScheduler();
            self.initiateServer();
            self.initiateSession();
            self.initiateCookie();
            self.initiateParser();
            self.initiateAjax();
            self.initiateRouter();
            
            self.initiated = true;
            self.attemptStart();
        });
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
    
    initiateDatabase(callback) {
        var self = this;
        this.initiateMysql(function () {
            self.initiateMongo(callback);
        });
    }
    
    initiateMysql(callback) {
        try {
            var mysqlConfig = require(DATA_DIR + "mysql.json");
            require("./mysql.js").init(mysqlConfig);
        }
        catch (err) {
            debug.log("MySql config not found");
        }
        callback();
    }
    
    initiateMongo(callback) {
        try {
            var self = this;
            var mongoConfig = require(DATA_DIR + "mongo.json");
        }
        catch (err) {
            debug.log("Mongo config not found");
            callback();
            return;
        }
        require("./mongo.js").init(mongoConfig, function () {
            self.initiatedMongo = true;
            callback();
        }, callback);
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
        this.server.use(bodyParser.json({ limit: "10mb" }));
        this.server.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));
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
        
        var engine = this.config["engine"] ? this.config["engine"] : "ejs";
        
        // Set Render Engine to EJS
        this.server.set("views", PUBLIC_DIR);
        this.server.engine(".html", require(engine).__express);
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
        
        // Set the redirection
        if (this.config["redirect"]) {
            this.config["redirect"].forEach((redirect) => {
                this.server.get(redirect["from"], function (req, res) {
                    res.redirect(redirect["to"]);
                });
                debug.log("Initiated Redirection " + redirect["from"] + " to " + redirect["to"]);
            });
        }
        
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
    start(callback) {
        
        // Check if the server has already started or called start
        if (this.calledStart || this.started) {
            throw new Error("Start should be called only once");
        }
        
        // Cache the start callback
        this.startCallback = callback;
        
        // Set called and, if initiated, start the server
        this.calledStart = true;
        if (this.initiated) {
            this.actualStart();
        }
    }
    
    attemptStart() {
        if (this.calledStart && this.initiated) {
            this.actualStart();
        }
    }
    
    actualStart() {
        
        // Precache self
        var self = this;
        
        // Run the scheduler
        schedule.run();
        
        // Listen to the port specified in the
        this.httpServer = this.server.listen(this.config.port, function (err) {
            if (err) {
                console.error("Error starting server " + self.config.name + ": \n" + err);
            }
            else {
                console.log("Successfully started server " + self.config.name + " in port " + self.config.port);
                
                // Update the status
                self.started = true;
                
                // Callback if has start callback
                if (self.startCallback) self.startCallback();
            }
        });
    }
    
    close() {
        
        // Close mongo connection if initiated
        if (this.initiatedMongo) require("./mongo").close();
        
        // Close http server
        this.httpServer.close();
    }
}

module.exports = {
    createServer (option) {
        
        // Return the newly created server
        return new Keeling(option);
    }
}
