requirejs.config({

	baseUrl: "",

	paths: {
		config: 'config',
		jquery: 'bower_components/jquery/dist/jquery.min',
		backbone: 'bower_components/backbone/backbone',
		underscore: 'bower_components/underscore/underscore',
		mustache: 'bower_components/mustache/mustache',
        moment: 'bower_components/moment/min/moment.min',
        bootstrap: 'bower_components/bootstrap/dist/js/bootstrap.min',
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
    'bootstrap',
], function($, _, config, Router, Store, Map) {
    // launches app at right time
    // Nothing interesting here; the setup comes in 
    // map.js and then master-control.js

    var currentAddress = Store.CurrentAddress;
    var permits = Store.DB.permits;

    function initializeAppAndMap() {
        console.log("Fetched nearest permits");
        permits.off("sync");

        var permit = permits.first();
        var initialView = [
            permit.get("latitude"), 
            permit.get("longitude")
        ];

        Map.setup({
            'key': config.APIKEY, 
            'mapId': config.MAPBOX_MAP_ID,
            'initialView': initialView,
            'data': permits.toJSON()
        });

        var router = new Router(); 
        window.router = router;
        Backbone.history.start();
        router.navigate("permits/p1", {trigger: true});
    }

    function initializeData() {
        console.log("Initializing data");
        var options = {
            data: {
                limit: 30, 
                lat: currentAddress.get("latitude"),
                lng: currentAddress.get("longitude")
            }
        };

        if (permits.length == 0) {
            permits.on("sync", initializeAppAndMap);
            permits.fetch(options);
        } else {
            initializeAppAndMap();
        }
    }

    function launch() {
        if (currentAddress.validate()) {
            initializeData();
        } else {
            currentAddress.on("set change", initializeData);
        }
    }

    $('[data-toggle="tooltip"]').tooltip({placement: 'left'});

    $(document).ready(launch);
})
