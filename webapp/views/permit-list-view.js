define(function(require) {

    /*
    * Presents a paginated PermitCollection, with
    * ability to sort. Expects a `collection` and 
    * `el` to be passed into the Constructor.
    */

    $ = require("jquery");
    _ = require("underscore");
    L = require("leaflet");
    Backbone = require("backbone");
    Mustache = require("mustache");
    Templates = require("templates");
    Store = require("store");

    var PermitCollection = Store.PermitCollection;

    var PermitPreview = Backbone.View.extend({
        className: "permit-preview",
        render: function() {
            var model = this.model;
            var _ref = this;
            Templates.get("permit-preview-view").done(function(tmpl) {
                var html = Mustache.render(tmpl, model.toJSON());
                _ref.$el.html(html);
            });
            return this;
        } 
    });

    var PermitList = Backbone.View.extend({
        id: "list-view",
        className: "paper",
        events: {
            "change form": "syncForm",
            "click .model-row .toggler": "toggleRow"
        },
        curSortBy: "proximity",
        initialize: function(options) {
            // binds callback functions to View context
            _.bindAll(this, "mini", "fullsize", "syncForm", "refresh", 
                "render", "setPage", "toggleRow");
            this.query = {
                data: {
                    page: options.page || 1
                },
                reset: true
            }
            this.collection.on("reset", this.render);
            this.collection.fetch(this.query);
            this.previews = {};
        },
        toggleRow: function(e) {
            var $row = $(e.currentTarget).parent().parent();
            var id = parseInt($row.data("id"));
            var model = this.collection.get(id);
            if (model) {
                if (!this.previews[id]) {
                    var view = new PermitPreview({
                        el: $row.find(".model-preview-row").get(),
                        model: model
                    });
                    view.render();
                    this.previews[id] = view;
                }
                // state is hidden at first
                this.previews[id].$el.toggleClass("hidden");
            }
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
            Templates.get("permit-list-view").done(function(template) {
                var html = Mustache.render(template, {
                    collection: json
                });
                $el.html(html);
            });
            return this;
        },
        // --- Controller Logic
        setPage: function(page) {
            this.query.data.page = page;    
            this.collection.fetch(this.query);
        }
    });

    return PermitList;
})