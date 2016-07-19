var path = require("path");

var chai = require("chai");
chai.use(require("chai-http"));
var expect = chai.expect;

var components = require("server-components");
var componentStatic = require("server-components-static");

var express = require("express");
var serverComponentsExpress = require("../src/index.js");

var app = express();

/**
 * Example (sometimes failing) component for testing
 */

var TestComponent = components.newElement();
TestComponent.createdCallback = function () {
    switch (this.getAttribute("should")) {
        case "succeed":
            this.innerHTML = "Rendered!";
            break;
        case "fail":
            throw new Error("Failed on purpose");
        default:
            throw new Error("FAILED UNEXPECTEDLY");
    }
};
components.registerElement("test-component", { prototype: TestComponent });


describe("On a server using server-components-express", () => {
    before(() => {
        app.use(serverComponentsExpress);
    });

    describe("the response objects", () => {
        before(() => {
            app.get('/:should', (req, res) => {
                res.renderFragment(
                    `<test-component should='${req.params.should}'></test-component>`
                );
            });
        });

        it("should render HTML on demand", () =>
            chai.request(app)
                .get('/succeed')
                .then((res) => {
                    expect(res.text).to.match(/Rendered!/);
                })
        );

        describe("when in development mode", () => {
            beforeEach(() => {
                app.set('env', 'development');
            });

            afterEach(() => {
                app.set('env', process.env.NODE_ENV || 'development');
            });

            it("should serve up component errors and stack traces", () =>
                chai.request(app)
                    .get('/fail')
                    .then((res) => expect.fail("Should not get a successful response"))
                    .catch((err) => {
                        var res = err.response;
                        expect(res).to.have.status(500);
                        expect(res.text).to.match(/Failed on purpose/);
                        expect(res.text).to.match(/TestComponent\.createdCallback/);
                    })
            );
        });

        describe("when in production mode", () => {
            beforeEach(() => {
                app.set('env', 'production');
            });

            afterEach(() => {
                app.set('env', process.env.NODE_ENV || 'development');
            });

            it("shouldn't serve up component error traces", () =>
                chai.request(app)
                    .get('/fail')
                    .then((res) => expect.fail("Should not get a successful response"))
                    .catch((err) => {
                        var res = err.response;
                        expect(res).to.have.status(500);
                        expect(res.text).not.to.match(/Failed on purpose/);
                        expect(res.text).not.to.match(/TestComponent\.createdCallback/);
                    })
            );
        });
    });

    describe("the static content serving", () => {
        before(() => {
            componentStatic.forComponent("test-component").setPath(__dirname);
        });

        it("serves up static content for components automatically", () =>
            chai.request(app)
                .get(`/components/test-component/${path.basename(module.filename)}`)
                .buffer(true)
                .then((res) => {
                    expect(res).to.have.status(200);

                    var thisFilesContent = require('fs').readFileSync(module.filename, 'utf8');
                    expect(res.text).to.equal(thisFilesContent);
                })
        );
    });
});
