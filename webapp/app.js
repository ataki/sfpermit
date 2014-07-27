requirejs.config({

	baseUrl: "",

	paths: {
		config: 'config/config',
		jquery: 'bower_components/jquery/dist/jquery.min',
		backbone: 'bower_components/backbone/backbone',
		underscore: 'bower_components/underscore/underscore',
		mustache: 'bower_components/mustache/mustache',
		leaflet: 'bower_components/leaflet/dist/leaflet',
        leaflet_markercluster: 'bower_components/leaflet.markercluster/dist/leaflet.markercluster'
	},

	shim: {
		underscore: {
			exports: '_'
		},

		leaflet: {
			exports: 'L'
		},

        leaflet_markercluster: {
            deps: ['leaflet']
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
        var query = JSON.stringify({limit: 30});

    	$.getJSON(store.endpoint('permit'), {q: query}, function(results) {
            store.persist('permits', results.objects);
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
