define(function(require) {
    var Backbone = require("backbone");
    var Mustache = require("mustache");
    var _ = require("underscore");
    var Store = require("store");
    var Templates = require("templates");

    var LogCollection = Store.LogCollection;
    var CommentCollection = Store.CommentCollection;
    var Comment = Store.Comment;
    var Log = Store.Log;

    var formatDatetimeWSeconds = Store.formatDatetimeWSeconds;

    var CommentView = Backbone.View.extend({
        events: {
            "submit form": "postComment"
        },
        initialize: function(options) {
            _.bindAll(this, "postComment", "render", "renderComment");
            this.logs = options.logs;
            this.collection.comparator = function(d) { return -d.timestamp };
            this.collection.on("reset", this.render);
            this.collection.on("add", this.renderComment);
        },
        render: function() {
            var _ref = this;
            var comments = this.collection; 
            Templates.get("permit-detail-comment").done(function(tmpl) {
                var htmls = comments.map(function(m) {
                    var json = m.toJSON();
                    json.timestamp_dp = formatDatetimeWSeconds(json.timestamp);
                    return Mustache.render(tmpl, m.toJSON());
                });
                var html = htmls.join("\n");
                _ref.$(".permit-comments-list").html(html);
            });
        },
        postComment: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var raw = this.$(".permit-form form").serializeArray();
            var keys = _.map(raw, function(d) { return d.name; });
            var values = _.map(raw, function(d) { return d.value; });
            var formData = _.object(keys, values);
            var comment = new Comment();
            comment.set({
                permit_id: this.model.id,
                text: formData.text,
                timestamp: new Date(),
            });
            var errors;
            if (!(errors = comment.validate())) {
                comment.save();
                // TODO Only clear textarea if we
                // save the signal. Gives users a
                // chance to save their comments
                this.$(".permit-form form textarea").val('');

                this.collection.add(comment);
                this.collection.sort();

                // Post data to timeline if necessary
                if (_.has(formData, "postToTimeline")) {
                    var log = new Log({
                        permit_id: this.model.id,
                        type: "note",
                        text: formData.text.substring(0, 125),
                        timestamp: new Date()
                    });
                    log.save();
                    this.logs.add(log);
                }
            }
        },
        renderComment: function(m) {
            var _ref = this;
            Templates.get("permit-detail-comment").done(function(tmpl) {
                var html = Mustache.render(tmpl, m.toJSON());
                _ref.$(".permit-comments-list").prepend(html);
            });
        }
    });

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
                var eventsHTML = _ref.collection.map(function(m) {
                    return Mustache.render(tmpl, m.toJSON()); 
                });
                var html = eventsHTML.join("\n");
                _ref.$el.html(html);
            });
            return this;
        },
        onAdd: function(model) {
            var html = Mustache.render(this.tmpl, model.toJSON());
            this.$el.prepend(html);
        }
    })

    var PermitDetail = Backbone.View.extend({
        events: {
            'click .hide': 'hide'
        },
        initialize: function() {
            _.bindAll(this, "hide")
            // own logs because this model includes logs,
            // but put them onto the new 
            this.logs = null;
            this.comments = null;
        },
        render: function() {
            var _ref = this;
            Templates.get("permit-detail-view").done(function(tmpl) {
                var html = Mustache.render(tmpl, _ref.model.toJSON());
                _ref.$el.html(html);
                _ref.logs = new LogCollection();
                _ref.comments = new CommentCollection();
                // Set up timeline
                _ref.timeline = new Timeline({
                    collection: _ref.logs,
                    el: _ref.$(".timeline")
                });
                _ref.logs.fetchForModel(parseInt(_ref.model.id));

                // Set up comments
                _ref.commentview = new CommentView({
                    model: _ref.model,
                    logs: _ref.logs,
                    collection: _ref.comments, 
                    el: _ref.$(".permit-comments")
                });
                _ref.comments.fetchForModel(parseInt(_ref.model.id));
            });
            return this;
        },
        show: function() {
            this.$el.removeClass("hidden");
        },
        hide: function() {
            this.$el.addClass("hidden");
        }
    });

    return PermitDetail;
});