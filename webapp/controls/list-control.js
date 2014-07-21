define(function(require) {

    /*
    * A generic list view of things
    */

    $ = require("jquery");
    _ = require("underscore");
    L = require("leaflet");
    Backbone = require("backbone");
    Mustache = require("mustache");
    Templates = require("templates");

    var List = Backbone.View.extend({
        id: "list-view",
        className: "paper",
        render: function(json) {
            var $el = this.$el;
            Templates.get("generic.list").done(function(template) {
                _.each(json, function(d) {
                    if (!_.has(d, "url")) {
                        d.url = '#';
                    }
                    d.name = d.project_name
                });
                var html = Mustache.render(template, {
                    collection_name: "Permits Nearest You",
                    collection: json
                });
                $el.html(html);
            });
            return this;
        }
    });

    var Control = L.Control.extend({
        options: {
            position: 'topleft'
        },
        onAdd: function(map) {
            this.view = new List();
            return this.view.el;
        },
        onRemove: function() {
            if (this.view) {
                this.view.destroy();
            }
        },
        updateViewData: function(json) {
            this.view.render(json);
        },
        hideView: function() {
            this.view.$el.hide();
        },
        showView: function() {
            this.view.$el.show();
        },
        cleanUpView: function() {
            this.view.$el.empty();
        }
    })

    return Control;
})