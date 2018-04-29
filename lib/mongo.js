var debug = require("./debug");
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;

module.exports = {
    db: undefined,
    init: function (option, callback, error) {
        if (option) {
            
            // Setup config
            this.config = option;
            
            if (this.config.connection_str) {
                
                // If has connection string then direction set the connection str
                this.url = this.config.connection_str;
            }
            else {
                
                // Setup connection url if connection str not provided
                var user = (this.config.username && this.config.password) ? (this.config.username + ":" + this.config.password + "@") : "";
                var address = this.config.host + (this.config.port ? (":" + this.config.port) : "");
                var database = "/" + this.config.database;
                this.url = "mongodb://" + user + address + database;
            }
            
            // Connect to database and store db inside this instance
            this.connect(callback, error);
            return true;
        }
        else {
            return false;
        }
    },
    connect: function (callback, error) {
        
        // Create this reference
        var self = this;
        
        // Create the db connection
        MongoClient.connect(this.url, function(err, db) {
            if (err) {
                debug.log("Connecting to MongoDB Failed: ");
                debug.log(err);
                
                if (error) {
                    error();
                }
            }
            else {
                debug.log("Successfully Connected to MongoDB with Database " + self.config.database);
                self.db = db.db(self.config.database);
                
                if (callback) {
                    callback();
                }
            }
        });
    },
    close: function (callback) {
        if (this.db) {
            this.db.close();
        }
    }
}
