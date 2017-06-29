var debug = require("./debug");
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;

module.exports = {
    db: undefined,
    init: function (option, callback) {
        if (option) {
            
            // Setup config
            this.config = option;
            
            // Setup connection url
            var user = (this.config.username && this.config.password) ? (this.config.username + ":" + this.config.password + "@") : "";
            var address = this.config.host + (this.config.port ? (":" + this.config.port) : "");
            var database = "/" + this.config.database;
            this.url = "mongodb://" + user + address + database;
            
            // Connect to database and store db inside this instance
            this.connect(callback);
            return true;
        }
        else {
            return false;
        }
    },
    connect: function (callback) {
        
        // Create this reference
        var self = this;
        
        // Create the db connection
        MongoClient.connect(this.url, function(err, db) {
            if (err) {
                debug.log("Connecting to MongoDB Failed: ");
                debug.log(err);
            }
            else {
                debug.log("Successfully Connected to MongoDB with Database " + self.config.database);
                self.db = db;
                
                if (callback) {
                    callback();
                }
            }
        });
    }
}
