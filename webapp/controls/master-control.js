define(function(require) {

	$ = require("jquery");
	_ = require("underscore");
	L = require("leaflet");
	Mustache = require("mustache");
	Backbone = require("backbone");
	config = require("config");
    Store = require("store");

	var MasterControlView = Backbone.View.extend({
		tagName: 'ul',
		id: "master-control-view",
		className: "map-control",
		initialize: function(options) {
			this.collection = new Store.Permit();
		},
		events: {
			'click .action-layers': 'showLayers',
			'click .action-leads': 'showLeads',
			'click .action-add': 'showManager',
			'click .action-settings': 'showSettings',
			'click .action-help': 'showHelp',
		},
		template_str: '\
			<li class="master-control-tile action-layers">\
				<i class="fa fa-bars"></i>\
				<strong class="master-control-tile-name">Layers</strong>\
			</li>\
			<li class="master-control-tile action-leads">\
				<i class="fa fa-users"></i>\
				<strong class="master-control-tile-name">Leads</strong>\
			</li>\
			<li class="master-control-tile action-add">\
				<i class="fa fa-map-marker"></i>\
				<strong class="master-control-tile-name">Add</strong>\
			</li>\
			<li class="master-control-tile action-settings">\
				<i class="fa fa-gear"></i>\
				<strong class="master-control-tile-name">Settings</strong>\
			</li>\
			<li class="master-control-tile action-help">\
				<i class="fa fa-question-circle"></i>\
				<strong class="master-control-tile-name">Help</strong>\
			</li>\
		',
 		template: function(json) {
 			return Mustache.render(this.template_str, json);
 		},
 		render: function() {
 			this.$el.html(this.template(this.collection.toJSON()));
 			return this;
 		},
 		destroy: function() {
 			this.$close();
 		},
 		showLayers: function() {
 			this.$el.find(".master-control-tile").removeClass("active");
 			$(this).addClass("active");
 			Backbone.trigger("show.layers");
 		},
 		showLeads: function() {
 			this.$el.find(".master-control-tile").removeClass("active");
 			$(this).addClass("active");
  			Backbone.trigger("show.leads");
 		},
 		showManager: function() {
 			this.$el.find(".master-control-tile").removeClass("active");
 			$(this).addClass("active");
  			Backbone.trigger("show.manager");
 		},
 		showSettings: function() {
 			this.$el.find(".master-control-tile").removeClass("active");
 			$(this).addClass("active");
  			Backbone.trigger("show.settings");
 		},
 		showHelp: function() {
 			this.$el.find(".master-control-tile").removeClass("active");
 			$(this).addClass("active");
  			Backbone.trigger("show.help");
 		}
 	})

	var MasterControl = L.Control.extend({
		options: {
			position: 'topleft'
		},
		onAdd: function(map) {
			this.view = new MasterControlView();
			this.view.render();
			return this.view.el;
		},
		onRemove: function() {
			if (this.view) {
				this.view.destroy();
			}
		}
	})

	return MasterControl;
})