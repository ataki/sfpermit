define(function(require) {
	$ = require("jquery");
	_ = require("underscore");
	L = require("leaflet");
	Backbone = require("backbone");
	Mustache = require("mustache");
	config = require("config");
    Store = require("store");

	var LayersView = Backbone.View.extend({
		id: "layers-control-view",
		className: "map-control map-control-shadow",
		template_str: '\
			<h1 class="map-control-inner-padding">Layers</h1>\
			<hr/>\
			<ul class="control-generic-list">\
				{{#schema}}\
				<li class="layer map-control-inner-padding" data-layer="{{name}}">\
					{{name}}\
				</li>\
				{{/schema}}\
			</ul>\
		',
		events: {
			"click .layer": "showLayer"
		},
		initialize: function() {
			this.collection = new Store.Schema();
			_.bindAll(this, "renderList");
			this.collection.on("reset", this.renderList);
		},
		template: function(json) {
			return Mustache.render(this.template_str, {
				schema: json
			});
		},
		render: function() {
			this.collection.fetch({reset: true});
			return this;
		},
		renderList: function() {
			this.$el.html(this.template(this.collection.toJSON()));
		},
		showLayer: function(e) {
			this.layerName = $.trim($(e.target).data("layer"));
		}	
	});

	var LayersControl = L.Control.extend({
		options: {
			position: 'topleft'
		},
		onAdd: function(map) {
			this.view = new LayersView();
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
			Backbone.trigger('map.interaction.enable');
		},
		showView: function() {
			this.view.$el.show();
			Backbone.trigger('map.interaction.disable');
		}
	})

	return LayersControl;
})