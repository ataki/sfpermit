define(function(require) {
    $ = require("jquery");
    config = require("config");

    var store = {};

    function setup() {
        // prefetch templates
    }

    function templateEndpoint(templateName) {
        return config.TEMPLATE_DIR + "/" + templateName + ".mustache";
    }

    function get(templateName) {
        console.log("templates.js: getting " + templateName);
        var defer = $.Deferred();
        if (store[templateName]) {
            defer.resolve(store[templateName]);
        } else {
            var url = templateEndpoint(templateName);
            $.get(url, function(template) {
                console.log("here");
                console.log(template);
                store[templateName] = template;
                console.log(template);
                console.log(store);
                defer.resolve(store[templateName])
            });
        }
        return defer;
    }

    return {
        setup: setup,
        get: get
    }
});