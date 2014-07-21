define(function(require) {
    $ = require("jquery");
    config = require("config");

    var store = {};
    window.store = store;

    function setup() {
        // prefetch templates
    }

    function templateEndpoint(templateName) {
        return config.TEMPLATE_DIR + "/" + templateName + ".mustache";
    }

    function get(templateName) {
        var defer = $.Deferred();
        if (store[templateName]) {
            defer.resolve(store[templateName]);
        } else {
            var url = templateEndpoint(templateName);
            $.get(url, function(template) {
                store[templateName] = template;
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