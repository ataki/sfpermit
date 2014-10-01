define(function(require) {
	/**
	 * Module for transient / persistent global alerts
	 * Usage
	 *
	 * 	var alert = new AlertView(); // renders itself into the global window
	 *  alert.setMessage("Hello World");
	 * 	alert.showPersistent(); // persists until manual call to "off"
	 *  alert.showTransient(seconds); // persistents until time indicated	
	 *  alert.off(); // empties and hides global alert 
	 *  alert.setMessage("New Message");
   *  ..etc...
    * alert.destroy(); // when you're finished, remove 
	 */

	var Backbone = require("backbone");

	var AlertView = Backbone.View.extend({
		className: "global-alert",
		template_str: '<span class="message">Your Msg Here</span>',
		template: function() {
			return this.template_str;
		},
		initialize: function() {
			this.$el.html(this.template());
			this.$el.hide();
			this.$el.prependTo('body');
            this._offed = false;
		},
		setMessage: function(msg) {
			this.$('.message').text(msg);
		},
        setHTML: function(html) {
            this.$('.message').html(html);
        },
		off: function() {
			this.$el.hide();
		},
		showPersistent: function() {
			this.$el.show();
		}, 
		showTransient: function(seconds) {
			var _ref = this;
			setTimeout(function() {
				_ref.off();
                _ref.destroy();
			}, seconds * 1000);
            this.$el.show();
		},
		destroy: function() {
            if (!this._offed) {
                this._offed = true;
                this.remove();
            }
		}
	}) 

	return AlertView;
})