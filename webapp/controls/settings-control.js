define(function(require) {
	$ = require("jquery");
	_ = require("underscore");
	L = require("leaflet");
	Backbone = require("backbone");
	Mustache = require("mustache");

	var SettingsView = Backbone.View.extend({
		
	});

	var SettingsControl = L.Control.extend({
		options: {
			position: 'topleft'
		},
		onAdd: function(map) {
			this.view = new SettingsView();
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
	})

	return SettingsControl;
})