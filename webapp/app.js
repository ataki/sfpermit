requirejs.config({

	baseUrl: "",

	paths: {
		config: 'config',
		jquery: 'bower_components/jquery/dist/jquery.min',
		backbone: 'bower_components/backbone/backbone',
		underscore: 'bower_components/underscore/underscore',
		mustache: 'bower_components/mustache/mustache',
        moment: 'bower_components/moment/min/moment.min',
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
    'router',
    'store',
	'map', 
], function($, _, config, Router, Store, Map) {
    // launches app at right time
    // Nothing interesting here; the setup comes in 
    // map.js and then master-control.js

    var currentAddress = Store.CurrentAddress;
    var NearestPermitCollection = Store.NearestPermitCollection;

    var nearestPermits = new NearestPermitCollection();

    function initializeData() {
        console.log("Initializing data");
        var options = {
            data: {
                limit: 30, 
                lat: currentAddress.get("latitude"),
                lng: currentAddress.get("longitude")
            }
        };
        nearestPermits.fetch(options).done(function(response) {
            console.log("fetched nearest permits");
            var permits = response.results;
            Store.persist('permits', permits);
            var initialView = [permits[4].latitude, permits[4].longitude];

            Map.setup({
                'key': config.APIKEY, 
                'mapId': config.MAPBOX_MAP_ID,
                'initialView': initialView,
                'data': permits
            });

            var router = new Router(); 
            window.router = router;
            Backbone.history.start();
            router.navigate("permits/p1", {trigger: true});
        });
    }

    function launch() {
        if (currentAddress.validate()) {
            initializeData();
        } else {
            currentAddress.on("set change", initializeData);
        }
    }

    $(document).ready(launch);
})
