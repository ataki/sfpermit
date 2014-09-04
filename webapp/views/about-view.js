define(function(require) {

    var Backbone = require("backbone");
    var Templates = require("templates");

    var About = Backbone.View.extend({
        id: "about-control-view",
        className: "paper modal",
        events: {
            'click .dismiss': 'hide'
        },
        render: function() {
            var $el = this.$el;
            Templates.get("about-view").done(function(tmpl) {
                var html = Mustache.render(tmpl, {});
                $el.html(html);
            });
        },
        hide: function() {
            $el.modal("hide");
        }
    });

    return About;
});