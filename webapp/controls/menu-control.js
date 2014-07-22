define(function(require) {
    $ = require("jquery");
    _ = require("underscore");
    L = require("leaflet");
    Backbone = require("backbone");
    Mustache = require("mustache");
    Templates = require("templates");
    Store = require("store");

    var Menu = Backbone.View.extend({
        id: 'menu-control',
        events: {
            'click .target-search': 'showSearch',
            'click .target-permits': 'showPermits'
        },
        initialize: function() {
            _.bindAll(this, "showSearch");
        },
        render: function() {
            var _ref = this;
            Templates.get("menu.control").done(function(template) {
                var html = Mustache.render(template, {});
                _ref.$el.html(html);
            });
            return this;
        },
        showSearch: function(e) {
            Backbone.trigger("show.search");
        },
        showPermits: function(e) {
            Backbone.trigger("list.show", Store.get("permits"));
        }
    });

    var Control = L.Control.extend({
        options: {
            position: 'topleft'
        },
        onAdd: function(map) {
            this.view = new Menu();
            this.view.render();
            return this.view.el;
        },
        onRemove: function() {
            if (this.view) {
                this.view.destroy();
            }
        }
    })

    return Control;
})