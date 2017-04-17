/**
 * Mysql Module
 */

var debug = require("./debug");
var mysql = require("mysql");

module.exports = {
    DEFAULT_LIMIT: 100,
    init (option) {
        if (option) {
            this.config = option;
            if (!this.config["connectionLimit"]) {
                this.config["connectionLimit"] = this.DEFAULT_LIMIT;
            }
            this.connect();
            return true;
        }
        else {
            return false;
        }
    },
    connect () {
        
        // Initiate this reference
        var self = this;
        
        // Create connection
        this.pool = mysql.createPool(this.config);
    },
    end () {
        
        //Disconnect and update status
        this.pool.end();
        this.pool = null;
    },
    getConnection (callback) {
        this.pool.getConnection(callback);
    },
    query (queryStr, data, callback, endAfterCall) {
        
        //Start query
        this.pool.query(queryStr, data, function (err, result) {
            
            //Log error if exists
            if (err) {
                console.log(err);
            }
            
            //Callback
            if (callback) {
                callback(err, result);
            }
        });
    }
}
