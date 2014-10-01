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
        typeahead: 'bower_components/typeahead.js/dist/typeahead.bundle.min',
        backgrid: 'bower_components/backgrid/lib/backgrid',
        'backgrid-paginator': 'bower_components/backgrid-paginator/backgrid-paginator',
        'backgrid-filter': 'bower_components/backgrid-filter/backgrid-filter',
        'backbone-pageable': 'bower_components/backbone-pageable/lib/backbone-pageable'
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
        },

        backgrid: {
            deps: ['jquery', 'backbone', 'underscore'],
            exports: 'Backgrid'
        },

        'backgrid-paginator': {
            deps: ['backgrid']
        },

        'backgrid-filter': {
            deps: ['backgrid']
        }
    }
})

require([
    'jquery', 
    'config',
    'store',
    'views/manager-view',
    'bootstrap',
], function($, config, Store, Manager) {

    var permits = Store.DB.permits; 

    function initialize() {
        var SFPermitManager = new Manager({
            el: '#manager'
        });
        SFPermitManager.render();
    }

    function maybeFetchPermits() {
        // check if permits have already been
        // fetched. If not, fetch it
        if (permits.length == 0) {
            permits.on("sync", initialize);
            permits.fetch({reset: true});
        } else {
            initialize();
        }
    }

    $(document).ready(function() {
        console.log("Initializing data");
        maybeFetchPermits(); 
    });

})
