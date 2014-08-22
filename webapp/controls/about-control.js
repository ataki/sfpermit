define(function(require) {
    $ = require('jquery');
    Backbone = require('backbone');
    L = require("leaflet");
    Templates = require("templates");

    var AboutView = Backbone.View.extend({
        id: "about-control-view",
        className: "paper",
        events: {
            'click .dismiss': 'hide'
        },
        render: function() {
            var $el = this.$el;
            Templates.get("about.control.view").done(function(tmpl) {
                var html = Mustache.render(tmpl, {});
                $el.html(html);
            });
        },
        hide: function() {
            Backbone.trigger("hide.about");
        }
    });

    var AboutControl = L.Control.extend({
        options: {
            position: 'topleft'
        },
        onAdd: function(map) {
            this.view = new AboutView();
            this.view.render();
            return this.view.el;
        },
        onRemove: function() {
            if (this.view) {
                this.view.destroy();
            }
        },
        hideView: function() {
            this.view.$el.hide();
        },
        showView: function() {
            this.view.$el.show();
        }
    })

    return AboutControl; 
})