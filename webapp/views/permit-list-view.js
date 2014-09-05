define(function(require) {

    /*
    * Sidebar list of permits
    */

    $ = require("jquery");
    _ = require("underscore");
    L = require("leaflet");
    Backbone = require("backbone");
    Mustache = require("mustache");
    Templates = require("templates");
    Store = require("store");

    var PermitCollection = Store.PermitCollection;

    var PermitList = Backbone.View.extend({
        id: "list-view",
        className: "paper",
        events: {
            "change form": "syncForm",
            "click .refresh": "refresh",
            "click .mini": "mini"
        },
        curSortBy: "proximity",
        initialize: function(options) {
            // binds callback functions to View context
            _.bindAll(this, "mini", "fullsize", "syncForm", "refresh", 
                "render");
            this.query = {
                data: {
                    page: options.page || 1
                },
                reset: true
            }
            this.collection = new PermitCollection();
            this.collection.on("reset", this.render);
            this.collection.fetch(this.query);
        },
        refresh: function() {
            var _ref = this;
            this.collection.fetch(this.query);
        },
        syncForm: function() {
            // TODO
        },
        mini: function() {
            $el.addClass("mini");
        },
        fullsize: function() {
            $el.removeClass("mini");
        },
        render: function() {
            var $el = this.$el;
            var json = this.collection.toJSON();
            console.log(json);
            Templates.get("permit-list-view").done(function(template) {
                var html = Mustache.render(template, {
                    collection: json
                });
                $el.html(html);
            });
            return this;
        }
    });

    return PermitList;
})