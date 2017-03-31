var path = require("path");
var config = require("./data/config.json");
var debug = require("./debug");

var BASE_DIR = path.join(__dirname + "/../../../");
var AJAX_DIR = BASE_DIR + "ajax/";

module.exports = {
    preprocess: function (req, res, next) {
        
        /**
         * Create Formatted Response For the Given response object
         */
        res.formatResponse = function (code, msg, content) {
            res.send(JSON.stringify({
                "code": code,
                "msg": msg,
                "content": content
            }));
        };
        
        /**
         * Response successfully with response content
         */
        res.success = function (content) {
            res.formatResponse(0, "", content);
        };
        
        /**
         * Response with error code and error message
         */
        res.error = function (code, msg) {
            res.formatResponse(code, msg, {});
        };
        
        next();
    },
    ajax: function (req, res) {
        
        // Try get the handler
        try {
            
            // Get the handler specified from the request
            var handler = require(AJAX_DIR + req.params[0] + ".js");
            
            // Check if the request contains the request action
            if (req.query["action"]) {
                
                // Check if the handler has the action
                if (typeof handler[req.query["action"]] === "function") {
                    
                    // Try execute the request
                    try {
                        
                        // Call the handler
                        handler[req.query["action"]](req, res);
                    }
                    catch (err) {
                        
                        // Log the error
                        debug.log(err);
                        res.error(417, "Handler Error");
                    }
                }
                else {
                    res.error(404, "Action " + req.query["action"] + " Not Found");
                }
            }
            else {
                res.error(404, "No Action Specified");
            }
        }
        catch (err) {
            
            if (err.code === "MODULE_NOT_FOUND") {
                
                // If the module has not been found
                debug.log(err);
                res.error(404, "Handler " + req.params[0] + " Not Found");
            }
            else {
                
                // If the error come from elsewhere
                debug.log(err);
                res.error(500, "Internal Server Error");
            }
        }
    }
}
