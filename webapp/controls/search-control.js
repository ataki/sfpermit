define(function(require) {
	$ = require("jquery");
	_ = require("underscore");
	L = require("leaflet");
	Backbone = require("backbone");
	Mustache = require("mustache");
    Templates = require("templates");
    Store = require("store");
    Forms = require("utils/forms");

	var SearchResultsCollection = Store.SearchResults;
	var Address = Store.Address;

	var SearchResultsView = Backbone.View.extend({
		tagName: "div",
		id: "search-results-view",
		className: "map-control-shadow",
		show: function() {
			Backbone.trigger('show.search');
		},
		hide: function() {
			Backbone.trigger('hide.search');
		},
		render: function(json) {
			var _ref = this;
            Templates.get("search.results").done(function(template) {
                var html = Mustache.render(template, json);
                _ref.$el.html(html);
            });
			return this;
		},
		destroy: function() {
			this.remove();
		}
	});

    // wrapper view
	var SearchControlView = Backbone.View.extend({
		tagName: "div",
		id: "search-control-view",
		events: {
			//"keyup input": "debouncedSearch",
			"submit form": "zoomToLocation"
		},
		initialize: function() {
			_.bindAll(this, "addFocus", "removeFocus", "showResults", "zoomToLocation");
			this.collection = new SearchResultsCollection();
			this.collection.on("reset", this.showResults);
			this._resultsView = new SearchResultsView({
				collection: this.collection
			});
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

	var SearchControl = L.Control.extend({
		options: {
			position: "topleft"
		},
		onAdd: function(map) {
			this.view = new SearchControlView();
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
	});

	return SearchControl;

});