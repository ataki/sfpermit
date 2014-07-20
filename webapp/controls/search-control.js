define(function(require) {
	$ = require("jquery");
	_ = require("underscore");
	L = require("leaflet");
	Backbone = require("backbone");
	Mustache = require("mustache");
    Templates = require("templates");
    Store = require("store");

	var SearchResultsCollection = Store.SearchResults;

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
            Templates.get("search.results").then(function(template) {
                var html = Mustache.render(template, json);
                this.$el.html(this.template(json));
            });
			return this;
		},
		destroy: function() {
			this.remove();
		}
	})

    // wrapper view
	var SearchControlView = Backbone.View.extend({
		tagName: "div",
		id: "search-control-view",
		events: {
			"focus input": "addFocus",
			"blur input": "removeFocus",
			"keypress input": "debouncedSearch"
		},
		initialize: function() {
			_.bindAll(this, "addFocus", "removeFocus", "showResults");
			this.collection = new SearchResultsCollection();
			this.collection.on("reset", this.showResults);
			this._resultsView = new SearchResultsView({
				collection: this.collection
			});
		},
		render: function() {
            _ref = this;
            Templates.get("search.control").then(function(template) {
                console.log("finished");
                var html = Mustache.render(_ref.template, json);
                _ref.$el.html(html);
                _ref.$el.append(this._resultsView.render().el);
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
	})

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
		}
	}) 

	return SearchControl;

});