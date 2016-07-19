var components = require("server-components");

var express = require("express");
var app = express();

// Enable this plugin
app.use(require("./src/index.js"));

// Define some components
var DemoComponent = components.newElement();
DemoComponent.createdCallback = function (document) {
    this.innerHTML = "Hello world";
};
components.registerElement("demo-component", { prototype: DemoComponent });

// Use response.renderPage(html) or response.renderFragment(html)
app.get('/', (req, res) => res.renderPage("<demo-component></demo-component>"));

app.listen(8080, () => console.log("Server ready at http://localhost:8080"));
