requirejs.config({

	baseUrl: "",

	paths: {
		config: 'config/config',
		jquery: 'bower_components/jquery/dist/jquery.min',
		backbone: 'bower_components/backbone/backbone',
		underscore: 'bower_components/underscore/underscore',
		mustache: 'bower_components/mustache/mustache',
		leaflet: 'bower_components/leaflet/dist/leaflet',
	},

	shim: {
		underscore: {
			exports: '_'
		},

		leaflet: {
			exports: 'L'
		},

		backbone: {
			deps: ['jquery', 'underscore'],
			exports: 'Backbone'
		},
	}
})

require([
	'jquery', 
	'underscore', 
	'config',
    'store',
	'map', 
], function($, _, config, store, Map) {
    // launches app at right time
    // Nothing interesting here; the setup comes in 
    // map.js and then master-control.js

    function launch() {
    	$.getJSON(store.endpoint('permit'), {'limit': 500}, function(results) {
            var permits = results.objects;   
            var initialView = [ permits[4].latitude, permits[4].longitude ];
            Map.setup({
            	'key': config.APIKEY, 
            	'mapId': config.MAPBOX_MAP_ID,
            	'initialView': initialView,
            	'data': permits
            	});
            });
    }

    $(document).ready(launch);
})
