/**
 * Mysql Module
 */

var debug = require("./debug");
var mysql = require("mysql");

module.exports = {
    init: function (option) {
        if (option) {
            this.config = option;
            this.connect();
        }
    },
    connect: function () {
        
        // Initiate this reference
        var self = this;
        
        // Create connection
        this.connection = mysql.createConnection(this.config);
        
        // Connect and update status
        this.connection.connect(function (err) {
            if (err) {
                debug.log("Error occurs when connecting to database: \n" + err);
            }
            else {
                debug.log("Successfully connected to database " + self.config.database);
            }
        });

        this.connection.on("error", function (err) {
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                debug.log("Connection Lost. Trying to reconnect the database. ");
                self.connect();
            }
            else {
                throw err;
            }
        });
    },
    end: function () {
        
        //Disconnect and update status
        this.connection.end();
        this.connection = null;
    },
    query: function (queryStr, data, callback, endAfterCall) {
        
        //Check if the connection needs to be ended
        if (endAfterCall === undefined) {
            endAfterCall = true;
        }
        
        //Make sure the connection is constructed
        if (!this.connection) {
            this.connect();
        }
        
        //Start query
        this.connection.query(queryStr, data, function (err, result) {
            
            //Log error if exists
            if (err) {
                console.log(err);
            }
            
            //Callback
            if (callback) {
                callback(err, result);
            }
        });
        
        //End connection if required
        if (endAfterCall) {
            this.end();
        }
    }
}
