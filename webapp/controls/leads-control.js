define(function(require) {
	$ = require("jquery");
	_ = require("underscore");
	L = require("leaflet");
	Backbone = require("backbone");
	Mustache = require("mustache");
	config = require("config");
    Store = require("store");

    var Address = Store.Address;

	var PermitsListView = Backbone.View.extend({
		id: 'leads-control-view',
		className: 'map-control map-control-shadow map-control-inner-padding',
		template_str: '\
			<h1>\
				<span>Leads</span>\
				<span class="btn-toolbar">\
					<i class="fa fa-edit toggleEditable"></i>\
					<i class="fa fa-clock-o"></i>\
					<i class="fa fa-save"></i>\
				</span>\
			</h1>\
			<hr/>\
			<h4 class="inline-heading">Nearby Closed</h4>\
			<h5 class="inline-heading">&nbsp;&nbsp;Click on a top lead to show the lead on the map.</h5>\
			<ul class="leads">\
				{{#leads}}\
				<li>\
					<ul class="lead" data-model-id="{{id}}">\
						<li class="stage indicator indicator-{{stage}}"></li>\
						<li class="address">{{geo_address}}</li>\
					</ul>\
				</li>\
				{{/leads}}\
			</ul>\
		',
		events: {
			'click .lead': 'goToLead',
			'click .toggleEditable': 'toggleMapEditable'
		},
		initialize: function() {
			this.collection = new Store.Permit();
			_.bindAll(this, "renderLeads", "goToLead", "toggleMapEditable");
			this.collection.on("sync", this.renderLeads);
			this.editable = false;
		},
		template: function() {
			return Mustache.render(this.template_str, {
				leads: _.first(this.collection.toJSON(), 15)
			})
		},
		render: function() {
			this.collection.fetch();
			return this;
		},
		renderLeads: function() {
			this.$el.html(this.template());
		},
		enableMapInteraction: function() {
			Backbone.trigger('map.interaction.enable');	
		},
		disableMapInteraction: function() {
			Backbone.trigger('map.interaction.disable');
		},
		goToLead: function(e) {
			var id = parseInt($(e.currentTarget).data("model-id"), 10)
			var permit = this.collection.find(function(m) {
				return m.id == id;
			});
			var address = new Store.Address(permit.toJSON());
			Backbone.trigger("map.goto", address);
		},
		toggleMapEditable: function() {
			if (!this.editable) {
				this.editable = true;
				Backbone.trigger('map.interaction.enable');
			} else {
				this.editable = false;
				Backbone.trigger('map.interaction.disable');
			}
		}
	});

	var Control = L.Control.extend({
		options: {
			position: 'topleft'
		},
		onAdd: function(map) {
			this.view = new PermitsListView();
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
			Backbone.trigger('map.interaction.disable');
		}
	});

	return Control;
})