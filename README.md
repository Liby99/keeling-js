# Keeling Js

A fast, lightweight NodeJs server based on ExpressJs

## Installation

Please install Keeling Js using this command:

```
$ npm install https://github.com/liby99/keeling-js
```

## File Structure

```
├── index.js
├─┬ data/
│ ├── config.json
├─┬ public/
│ ├── *.html
│ ├── js/
│ ├── css/
│ └── ...
├─┬ router/
│ └── *.js
├─┬ ajax/
│ └── *.js
└─┬ schedule/
  └── *.js
```

## Usage

The application should have an entry point in the root directory, namely
`index.js`, and it should have this server setup code:

```js
var keeling = require("keeling-js");
var server = keeling.createServer();
server.start();
```

Then by running this script in terminal

```
$ node index.js
```

the keeling server is running and you can simply go to the browser and type in
the url `http://localhost:21023` to access the server. For now this will bring
you to a error page with 404 not found error, since there's nothing for the
default home page `index.html` yet.

## Configuration

After setting up basic server, you should then create the `data` directory and
put in a `config.json` file. A sample config file will look like this:

```json
{
    "debug": true,
    "name": "Keeling Js Default Server",
    "port": 21023,
    "default_page": "index",
    "error_page": "error"
}
```

> Note that you can ignore any entry if you think the default value is fine.

Setting `debug` to `true` will enable the use of `debug.log("MESSAGE")` and this
will be elaborated in the submodule section.

`name` property is just for the program identification.

The `port` property will specify which port do the server listen to.

The `default_page` and `error_page` properties will set the entry point and
error page of the server.

> The `.html` will be automatically appended to the `default_page` and
`error_page` file name. So no need to specify `.html` here.

## Static & Router

Then you should setup your public files in the `public/` directory, including
the `.html` files. Everything in `public/` directory will be sent to user
statically except the `.html` files.

For `.html` files, the server will search for the `.js` router in `router/`
directory with the **SAME PATH NAME** in `public/`. For example for a request
of `/index.html`, it should have a router `router/index.js` in order for the
router to handle the rendering data for `/index.html`.

The sample router should look like this:

```js
module.exports = function (req, res, callback) {
    var data = {};
    // ... process data
    callback(data);
}
```

and such data will be used for EJS to render the html page. Of course if there's
no data needed in the html page, then you can not passing anything into the
callback function. Every `.html` file will be rendered using EJS engine.

## Ajax Request

The ajax requests are treated completely different than the routers. In the
front-end, all ajax requests should has a format like this:

```
/ajax/<HANDLER>?action=<ACTION>
```

The `<HANDLER>` term is associate with the javascript file with the same name in
`ajax/` directory, and `<ACTION>` term will be associated with the function name
inside that handler module.

For example, a request like `/ajax/user?action=add` will call the method `add`
of module `ajax/user.js`, when the `ajax/user.js` looks like this:

```js
// ajax/user.js
module.exports = {
    add: function(req, res) {
        // ... process data
        res.success(data);
    },
    ACTION_2: function (req, res) {
        res.error(1, "ACTION 2 ERROR");
    },
    ...
}
```

Note that there's two function in `res` called `success(data)` and `error(code,
msg)`. The front end will receive standardized json response if one use `success
(data)` or `error(code, msg)`:

```json
{
    "code": 1000,
    "msg": "ERROR_MSG",
    "content": {
        "CONTENT1": "content 1"
    }
}
```

> When calling `success(data)`, the `code` will be `0` and the `msg` is empty.

## Error Page

You should always put an error page there! The name of your error page should be
the same as the `error_page` value in your config file (The default is
`error.html`).

In Keeling Js, when there's any error in the router, the error page will be
redirected with two query parameters `code` and `msg`, so the url will look like
this:

```
/error.html?code=404&msg=page%20not%20found
```

You can also redirect the response to the error page using the wrapped application

```js
res.error(404, "Page Not Found");
```

## Submodules

### Scheduler

### debug

### Crypto
