var path = require("path");
var config = require("./data/config.json");
var debug = require("./debug");

var options = {
    root: process.env.PUBLIC_DIR,
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
}

function processRoute(req, res) {
    
    // Cache the file
    var file = req.path.substring(1, req.path.indexOf(".html"));
    
    // Try getting the router module
    var route = require(process.env.ROUTER_DIR + file + ".js");
    
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

function sendStaticHtml(req, res) {
    
    // Cache the file
    var file = req.path.substring(1, req.path.indexOf(".html"));
    
    // Try sending the static html
    res.render(file, {}, function (err, html) {
        
        // Check if there's an error rendering the static file
        if (err) {
            
            //
            debug.log("Static html not found. Redirecting to 404");
            
            // Avoid infinity redirecting
            if (file === "error") {
                res.send("<h2>Error 404: Page not found.</h2>");
            }
            else {
                res.error(404, "Page not found");
            }
        }
        else {
            
            // Directly send the rendered html
            res.send(html);
            debug.log("Directly sent static html " + file);
        }
    });
}

module.exports = {
    preprocess: function (req, res, next) {
        
        // Wrap error function for response
        res.error = function (code, msg) {
            res.redirect("/" + config.error_page + ".html?code=" + code + "&msg=" + msg);
        };
        
        // Pass to next middleware
        next();
    },
    router: function (req, res) {
        
        // Cache the file
        var file = req.path.substring(1, req.path.indexOf(".html"));
        
        // Try to process the router
        try {
            processRoute(req, res);
        }
        catch (err) {
            
            // Check if the error is module not found
            if (err.code === "MODULE_NOT_FOUND") {
                
                // Send static html if the module not found
                sendStaticHtml(req, res);
            }
            else {
                
                // Then the router file might have error
                debug.log("Router " + file + " Error: \n" + err);
                res.error(500, "Internal Server Error");
            }
        }
    }
}
