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
    Map = require("map").map;

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
            "click .sync": "syncForm",
            "click .clear": "clearFilters",
            "click .model-row .toggler": "toggleRow",
            "click .sort-by.proximity": "sortByProximity",
            "click .sort-by.risk": "sortByRisk",
            "click .sort-by.units": "sortByUnits"
        },
        curSortBy: "proximity",
        initialize: function(options) {
            // binds callback functions to View context
            _.bindAll(this, "mini", "fullsize", "syncForm", "refresh", 
                "render", "setPage", "toggleRow", "renderInnerList",
                "sortByProximity", "sortByUnits", "sortByRisk");
            this.query = {
                data: {
                    page: options.page || 1
                },
                reset: true
            }
            this.previews = {};
            this.risk_direction = 1;
            this.units_direction = -1;
            this.proximity_direction = 1;
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
            var raw = this.$("form").serializeArray();
            raw = _.filter(raw, function(d) {
                return d.value != "*";
            });
            var filters = _.map(raw, function(d) {
                if (d.name.search(":max") != -1) {
                    return Store.makeLTFilter(d.name.replace(":max", ""), parseInt(d.value));
                } else if (d.name.search(":min") != -1) {
                    return Store.makeGTFilter(d.name.replace(":min", ""), parseInt(d.value));
                }
                else {
                    return Store.makeEqualsFilter(d.name, d.value);
                }
            });
            this.query.data.q = JSON.stringify({
                "filters": filters
            });
            this.collection.fetch(this.query);
        },
        clearFilters: function() {
            this.query.data = _.omit(this.query.data, "q");
            this.$("form").trigger("reset");
            this.collection.fetch(this.query);
        },
        mini: function() {
            $el.addClass("mini");
        },
        fullsize: function() {
            $el.removeClass("mini");
        },
        render: function() {
            var $el = this.$el;
            var _ref = this;
            Templates.get("permit-list-view").done(function(template) {
                var html = Mustache.render(template, {});
                $el.html(html);
                _ref.collection.on("reset", _ref.renderInnerList);
                _ref.collection.fetch(_ref.query, {reset: true});
                _ref.collection.on("sort", _ref.renderInnerList);
            });
            return this;
        },
        renderInnerList: function() {
            var $el = this.$(".model-list");
            var json = this.collection.toJSON();
            var _ref = this;
            Templates.get("permit-list-inner-view").done(function(template) {
                var html = Mustache.render(template, { collection: json });
                $el.html(html);
                _ref.cleanUpPreviews();
            });
        },
        cleanUpPreviews: function() {
            _.each(_.values(this.previews), function(v) {
                v.remove();
            });
            this.previews = {};
        },
        sortByProximity: function() {
            var direction = this.proximity_direction;
            var center = window._map_.getCenter();
            var comparator = Store.distanceMeasure(new Store.Address({
                "latitude": center.lat,
                "longitude": center.lng
            }));
            this.collection.comparator = function(m) { 
                return comparator(m);
            }
            this.collection.sort();
            this.proximity_direction *= -1;
        },
        sortByUnits: function() {
            var direction = this.units_direction;
            this.collection.comparator = function(m) { 
                return m.get("net_units") * direction;
            }
            this.collection.sort();
            this.units_direction *= -1;
        },
        sortByRisk: function() {
            var direction = this.risk_direction;
            this.collection.comparator = function(m) {
                return m.get("prediction") * direction;
            }
            this.collection.sort();
            this.risk_direction *= -1;
        },

        // --- Controller Logic

        setPage: function(page) {
            if (this.query.data.page != page) {
                this.query.data.page = page;    
                this.collection.fetch(this.query);
            }
        }
    });

    return PermitList;
})