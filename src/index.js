var express = require("express");
var components = require("server-components");
var componentsStatic = require("server-components-static");

var send = require("send");

module.exports = function (req, res, next) {
    res.renderPage = (html) => {
        return components.renderPage(html).then((output) => {
            res.send(output);
        }).catch((e) => next(e));
    };

    res.renderFragment = (html) => {
        return components.renderFragment(html).then((output) => {
            res.send(output);
        }).catch((e) => next(e));
    };

    var componentStaticRegex = new RegExp(componentsStatic.baseUrl + "/([^/]+)/(.+)");
    var staticUrlMatch = req.path.match(componentStaticRegex);
    if (staticUrlMatch) {
        var componentName = staticUrlMatch[1];
        var requestedFile = staticUrlMatch[2];

        var filePath = componentsStatic.getPath(componentName, requestedFile);

        send(req, filePath).pipe(res);
    } else {
        next();
    }
};
