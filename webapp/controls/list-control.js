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

    var CurrentAddress = Store.CurrentAddress;
    var PermitCollection = Store.PermitCollection;

    var List = Backbone.View.extend({
        id: "list-view",
        className: "paper",
        events: {
            "click .sort-by.proximity": "sortByProximity",
            "click .sort-by.units": "sortByUnits",
            "click .sort-by.risk": "sortByRisk",
            "click .close": "close",
            "click .model-row": "showRow"
        },
        curSortBy: "proximity",
        initialize: function() {
            // binds callback functions to View context
            _.bindAll(this, "highlightSortBy", "sortByProximity", "sortByUnits", 
                "showRow", "close")
        },
        highlightSortBy: function() {
            this.$(".sort-by").removeClass("active");
            this.$(".sort-by." + this.curSortBy).addClass("active");
        },
        sortByProximity: function() {
            var center = CurrentAddress.toJSON();
            var distanceMeasure = Store.distanceMeasure(center);
            var newJSON = _.sortBy(this._json, distanceMeasure);
            _.each(newJSON, function(d) {
                d.sort_by_value = distanceMeasure(d);
            });
            this.render(newJSON);
            this.curSortBy = "proximity";
            this.highlightSortBy();
        },
        sortByUnits: function() {
            var distanceMeasure = function(d) { return -d.net_units; }
            var newJSON = _.sortBy(this._json, distanceMeasure);
            _.each(newJSON, function(d) {
                d.sort_by_value = distanceMeasure(d);
            });
            this.render(newJSON);
            this.curSortBy = "units";
            this.highlightSortBy();
        },
        sortByRisk: function() {
            var distanceMeasure = function(d) { 
                if (d.final_status != "Open") {
                    return 1.1;
                } else { 
                    return d.prediction; 
                }
            }
            var newJSON = _.sortBy(this._json, distanceMeasure);
            _.each(newJSON, function(d) {
                d.sort_by_value = distanceMeasure(d);
            });
            this.render(newJSON);
            this.curSortBy = "risk";
            this.highlightSortBy();
        },
        showRow: function(e) {
            var id = parseInt($(e.currentTarget).data("id"));
            var target = _.find(this._json, function(d) { return d.id == id; });
            if (target) {
                var model = new Store.Address(target);
                Backbone.trigger("map.setView", model, target);
            }
        },
        render: function(json) {
            var $el = this.$el;
            var permits = new PermitCollection(json);
            this._json = permits.map(function(m) { return m.toJSON(); });
            var _json = this._json;
            Templates.get("list.control").done(function(template) {
                _.each(json, function(d) {
                    if (!_.has(d, "url")) {
                        d.url = '#';
                    }
                    d.name = d.project_name.split(",")[0]
                });
                var html = Mustache.render(template, {
                    collection_name: "Permits Nearest You",
                    collection: _json,
                    sort_proximity: (this.curSortBy == "proximity"),
                    sort_risk: (this.curSortBy == "risk"),
                    sort_units: (this.curSortBy == "units")
                });
                $el.html(html);
            });
            return this;
        },
        close: function() {
            // signal to global dispatcher to 
            // hide list control
            Backbone.trigger("hide.list");
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