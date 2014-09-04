define(function(require) {
    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");
    var Mustache = require("mustache");
    var Templates = require("templates");
    var Store = require("store");
    var Forms = require("utils/forms");

    /**
    * Top Header Component
    */

    var CurrentAddress = Store.CurrentAddress;
    var PermitCollection = Store.PermitCollection;
    var Address = Store.Address;

    var Search = Backbone.View.extend({
        tagName: "div",
        id: "search-control-view",
        events: {
            //"keyup input": "debouncedSearch",
            "submit form": "zoomToLocation"
        },
        initialize: function() {
            _.bindAll(this, "addFocus", "removeFocus", "showResults", "zoomToLocation");
            this.collection = new PermitCollection();
            this.collection.on("reset", this.showResults);
        },
        zoomToLocation: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var formData = Forms.serializeForm(this.$("form"));
            var query = $.trim(formData.query) + " San Francisco";

            $.getJSON("/geocode", {query: query}, function(response) {
                if (response) {
                    console.log("going to address " + response.address);
                    var addr = new Address(response);
                    addr.set("zoom", 15);
                    Backbone.trigger("map.setView", addr);
                    Backbone.trigger("hide.search");
                }
            });
        },
        render: function() {
            var _ref = this, resultsView = this._resultsView;
            Templates.get("search.control").done(function(template) {
                var html = Mustache.render(template, _ref.collection.toJSON());
                _ref.$el.html(html);
                _ref.$el.append(resultsView.render().el);
            });
            return this;
        },
        destroy: function() {
            // destroy nested child views before 
            // parent
            if (this._resultsView != null) {
                this._resultsView.destroy();
            }
            this.remove();
        },
        addFocus: function() {
            this.$el.addClass("infocus");
        },
        removeFocus: function() {
            this.$el.removeClass("infocus");
            if (this._resultsView) {
                this._resultsView.hide();
            }
        },
        debouncedSearch: _.debounce(function(e) {
            var query = $.trim($(e.currentTarget).val());
            this.collection.fetch({
                type: 'GET',
                data: {'query': query},
                reset: true
            });
        }, 500),
        showResults: function() {
            this._resultsView.show();
        }
    });

    var Header = Backbone.View.extend({
        id: 'menu-control',
        events: {
            'click .target-search': 'showSearch',
            'click .target-permits': 'showPermits',
            'click .target-about': 'showAbout'
        },
        initialize: function() {
            _.bindAll(this, "showSearch");
            this.searchview = new Search();
        },
        render: function() {
            var _ref = this;
            Templates.get("header.view").done(function(template) {
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
        showAbout: function(e) {
            Backbone.trigger("show.about");
        },
        updateCurrentAddress: function(lat, lng) {
            $(".latitude").text(lat.toFixed(2))
            $(".longitude").text(lng.toFixed(2));
        }
    });

    return Header;
});