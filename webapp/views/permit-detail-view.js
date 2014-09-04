define(function(require) {
    var Backbone = require("backbone");
    var Mustache = require("mustache");
    var _ = require("underscore");

    var Timeline = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, "render", "onAdd");
            this.collection.on("reset", this.render);
            this.collection.on("add", this.onAdd);
        },
        render: function() {
            var _ref = this;
            // Partial diffing possible here...
            Templates.get("permit-detail-timeline").done(function(tmpl) {
                _ref.tmpl = tmpl;
                var html = Mustache.render(tmpl, _ref.collection.toJSON()); 
                _ref.$el.html(html);
            });
            return this;
        },
        onAdd: function(model) {
            var html = Mustache.render(this.tmpl, model.toJSON());
            this.$el.append(html);
        }
    })

    var PermitDetail = Backbone.View.extend({
        events: {
            'click .hide': 'hide'
        },
        initialize: function() {
            _.bindAll(this, "hide")
            this.logs = null;
        },
        render: function() {
            var _ref = this;
            Templates.get("permit-detail-view").done(function(tmpl) {
                var html = Mustache.render(tmpl, _ref.model.toJSON());
                _ref.$el.html(html);
                _ref.logs = new LogCollection();
                _ref.timeline = new Timeline({
                    collection: logs,
                    el: _ref.$el(".timeline")
                });
                _ref.logs.fetch({data: {page: 1}, reset: true});
            });
            return this;
        },
        show: function() {
            this.$el.show();    
        },
        hide: function() {
            this.$el.hide();
        }
    });
});