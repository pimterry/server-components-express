# Server Components Express  [![Travis Build Status](https://img.shields.io/travis/pimterry/server-components-express.svg)](https://travis-ci.org/pimterry/server-components-express)
Express integration plugin for [Server Components](http://pimterry.github.io/server-components)

## What is this?

This is a helper for using Server Components with Express. It automatically handles serving static
content for you, so you can just start installing and using server components and have all the content
Just Work, without having to think about how it gets delivered. It provides some helper rendering
methods to make that even easier too.

## Getting started

A minimal setup:

```javascript
var components = require("server-components");

var express = require("express");
var app = express();

// Enable this plugin
app.use(require("server-components-express"));

// Define some components
var DemoComponent = components.newElement();
DemoComponent.createdCallback = function (document) {
    this.innerHTML = "Hello world";
};
components.registerElement("demo-component", { prototype: DemoComponent });

// Use response.renderPage(html) or response.renderFragment(html)
app.get('/', (req, res) => res.renderPage("<demo-component></demo-component>"));

app.listen(8080, () => console.log("Server ready at http://localhost:8080"));
```

This shows the basic setup, and requests to http://localhost:8080 subsequently will receive the rendered result:

```html
<html>
<head></head>
<body>
    <demo-component>Hello world!</demo-component>
</body>
</html>
```

## Serving static content

The key hidden feature server-components-express adds is effortless static content serving. Any components
that internally use [server-components-static](https://github.com/pimterry/server-components-static) to
include static content will return URLs (by default) of the form
`/components/my-component/images/cat-picture.jpg`. This plugin ensures those will automatically resolve
and serve the correct files from within the corresponding component, without you having to copy those
static files into your core codebase.

For example, if you install a component from NPM that includes `cat-picture.jpg` and an `index.js` like:

```javascript
var components = require("server-components");

var content = require("server-components-static").forComponent("cat-component");
content.setPath(__dirname);

var CatComponent = components.newElement();
CatComponent.createdCallback = function (document) {
    var img = document.createElement("img");
    img.src = content.getUrl("cat-picture.jpg");
    this.appendChild(img);
};

components.registerElement("cat-component", { prototype: CatComponent });
```

You can install this from NPM, require it, use it in your HTML with `<cat-component></cat-component>`, and
it will immediately successfully render an image tag pointing to 'cat-picture.jpg', and resolve
the URL for that back to the correct file.

Enabling server-components-express lets you ignore how serving of static content like CSS and images
works for any components you use. As long as they use server-components-static, everything will
Just Work without any interaction.

## API

`expressApp.use(require("server-components-express"));`

Run this to add the static files handler and response helper methods to the given express application.

`response.renderPage(htmlString)`

This will render the given HTML, identically to
[components.renderPage(html)](https://github.com/pimterry/server-components#componentsrenderpagehtml),
and serve the results back in the response.

If any errors occur, the errors will be passed to your configured error handler. By default, that means
in development you'll get a stack trace in your console and in the body of a 500 response, and in
production you'll get a 500 response with 'Service Unavailable' and no further details.

This method returns a promise. If you'd like to do something after the response has been sent, you can
chain further actions. Note that errors in rendering are already caught and handed off to the standard
express error handling functionality, so `catch()` clauses won't typically trigger.

`response.renderFragment(htmlString)`

This will render the given HTML identically to [components.renderFragment(html)], and serve the results
back in the response. It behaves the same as [response.renderPage(html)](https://github.com/pimterry/server-components-express#responserenderpagehtml) above.
