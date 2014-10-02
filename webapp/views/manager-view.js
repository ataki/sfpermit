define(function(require) {
    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");
    console.log("here", window.Backbone);
    window.Backbone = Backbone;
    

    return ManagerView;
});