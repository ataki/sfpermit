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
        leaflet_markercluster: 'bower_components/leaflet.markercluster/dist/leaflet.markercluster-src',
        typeahead: 'bower_components/typeahead.js/dist/typeahead.bundle.min' 
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

        bootstrap: {
            deps: ['jquery']
        },

        typeahead: {
            deps: ['jquery']
        }
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

    window.debug = window.debug || {};

    // launches the app using a cascading series
    // of initialization functinos.
    // Nothing interesting here; the setup comes in 
    // map.js and then master-control.js

    var currentAddress = Store.CurrentAddress;
    var permits = Store.DB.permits;

    function initializeAppAndMap() {
        console.log("Fetched nearest permits");
        permits.off("sync", initializeAppAndMap);

        var initialView = [37.7749, -122.419];

        Map.setup({
            'key': config.APIKEY, 
            'mapId': config.MAPBOX_MAP_ID,
            'initialView': initialView,
            'data': permits.toJSON()
        });

        var router = new Router(); 
        Backbone.history.start();
        router.navigate("permits/p1", {trigger: true});
    }


    function initializeData() {
        console.log("Initializing data");
        var options = {
            data: {
                limit: 30
            }
        };

        // check if permits have already been
        // fetched. If not, fetch it
        if (permits.length == 0) {
            permits.on("sync", initializeAppAndMap);
            permits.fetch(options);
        } else {
            initializeAppAndMap();
        }
    }


    function bindStyles() {
        // Bootstrap-like style initialization
        $('[data-toggle="tooltip"]').tooltip({placement: 'left'});
    }


    function launch() {
        bindStyles();

        if (currentAddress.validate()) {
            initializeData();
        } else {
            currentAddress.on("set change", initializeData);
        }
    }


    $(document).ready(launch);
})
