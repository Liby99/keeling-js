var path = require("path");
var debug = require("./debug");

function getErrorFile(err) {
    var message = err.message.split(" ");
    message.shift();
    message.shift();
    return message.join(" ").split("\'")[1];
}

class Router {
    
    constructor(routerDir, errorPage) {
        this.routerDir = routerDir;
        this.errorPage = errorPage;
    }

    processRoute(req, res) {
        
        // Cache the file
        var file = req.path.substring(1, req.path.indexOf(".html"));
        
        // Try getting the router module
        var route = require(this.routerDir + file + ".js");
        
        // Run the router module
        route(req, res, function (data) {
            
            // And run the renderer
            res.render(file, data, function (err, html) {
                
                // Check if there's renderer error
                if (err) {
                    
                    // The renderer has error
                    debug.log("Render Error: \n" + err);
                    res.error(500, "Internal Server Error");
                }
                else {
                    
                    // Send the rendered html
                    debug.log(file + ".html successfully rendered");
                    res.send(html);
                }
            });
        });
    }
    
    sendStaticHtml(req, res) {
        
        var self = this;
        
        // Cache the file
        var file = req.path.substring(1, req.path.indexOf(".html"));
        
        // Try sending the static html
        res.render(file, {}, function (err, html) {
            
            // Check if there's an error rendering the static file
            if (err) {
                
                if (err.view) {
                    
                    //
                    debug.log("Static html not found. Redirecting to 404");
                    res.error(404, "Page not found");
                }
                else {
                    
                    debug.log("Renderer error: \n" + err);
                    res.error(500, "Internal Server Error");
                }
            }
            else {
                
                // Directly send the rendered html
                res.send(html);
                debug.log("Directly sent static html " + file);
            }
        });
    }
    
    router(req, res) {
        
        var self = this;
        
        /**
         * Return Error to the Front-End. Has multi purpose
         * @return {[type]} [description]
         */
        res.error = function (code, msg) {
            var resSelf = this;
            res.render("/" + self.errorPage + ".html", {
                code: code,
                msg: msg
            }, function (err, html) {
                if (err) {
                    res.send("<center><h3>Error " + code + ": " + msg + "</h3></center>");
                }
                else {
                    resSelf.send(html);
                }
            });
        };
        
        // Cache the file
        var file = req.path.substring(1, req.path.indexOf(".html"));
        
        // Try to process the router
        try {
            this.processRoute(req, res);
        }
        catch (err) {
            
            // Check if the error is module not found
            if (err.code === "MODULE_NOT_FOUND" && this.routerDir + file + ".js" === getErrorFile(err)) {
                
                // Send static html if the module not found
                this.sendStaticHtml(req, res);
            }
            else {
                
                // Then the router file might have error
                debug.log("Router " + file + " Error: \n" + err);
                res.error(500, "Internal Server Error");
            }
        }
    }
}

module.exports = Router;
