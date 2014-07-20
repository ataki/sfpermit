define(function(require) {
	$ = require('jquery');
	Backbone = require('backbone');
    L = require("leaflet");

	var HelpControlView = Backbone.View.extend({
		id: "help-control-view",
		className: "map-control map-control-shadow map-control-inner-padding",
		template_str: '\
			<h1>Help</h1>\
			<hr/>\
			<p>\
			Welcome to Project Cortana, a geospatial tool for exploring energy leads\
			around the US. Some features that are available are\
			-	Explore or search by lead address<br/>\
			- Zoom in to view leads and other areas<br/>\
			- Edit and add leads to a team-map<br/>\
			To get started, click on the "leads" button to the left to open up a list\
			of closed leads.\
			</p>\
			<button class="btn-primary" type="button">Test</button>\
		',
		events: {
			'click button': 'test'
		},
		template: function() {
			return Mustache.render(this.template_str, {});
		},
		render: function() {
			this.$el.html(this.template());
			return this;
		},
		destroy: function() {
			this.remove();
		},
		test: function() {
			alert('here');
		}
	});

	var HelpControl = L.Control.extend({
		options: {
			position: 'topleft'
		},
		onAdd: function(map) {
			this.view = new HelpControlView();
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

	return HelpControl; 
})