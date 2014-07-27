define(function(require) {
    $ = require("jquery");
    _ = require("underscore");
    L = require("leaflet");
    Backbone = require("backbone");
    Mustache = require("mustache");
    Templates = require("templates");
    Store = require("store");

    /**
    * Represents the Menu at the top
    */

    var CurrentAddress = Store.CurrentAddress;

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
                _ref.afterTemplateFetch(template);
            });
            CurrentAddress.on("change", function() {
                var lat = CurrentAddress.get("latitude")
                    , lng = CurrentAddress.get("longitude");
                _ref.updateCurrentAddress(lat, lng);
            });
            return this;
        },
        afterTemplateFetch: function(template) {
            var html = Mustache.render(template, {});
            this.$el.html(html);
            // in case the get happens before the event has
            // had time to bind
            var lat = CurrentAddress.get("latitude")
            , lng = CurrentAddress.get("longitude");
            this.updateCurrentAddress(lat, lng);
        },
        showSearch: function(e) {
            Backbone.trigger("show.search");
        },
        showPermits: function(e) {
            Backbone.trigger("show.list", Store.get("permits"));
        },
        updateCurrentAddress: function(lat, lng) {
            $(".latitude").text(lat.toFixed(2))
            $(".longitude").text(lng.toFixed(2));
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