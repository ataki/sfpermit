({
    baseUrl: ".", 
    name: "bower_components/almond/almond.js",
    include: ['app'],
    insertRequire: ['app'],
    out: "dist/app.build.js",
    wrap: true,
    paths: {
        config: 'config',
        jquery: 'bower_components/jquery/dist/jquery.min',
        backbone: 'bower_components/backbone/backbone',
        underscore: 'bower_components/underscore/underscore',
        mustache: 'bower_components/mustache/mustache',
        moment: 'bower_components/moment/min/moment.min',
        bootstrap: 'bower_components/bootstrap/dist/js/bootstrap.min',
        leaflet: 'bower_components/leaflet/dist/leaflet',
        leaflet_markercluster: 'bower_components/leaflet.markercluster/dist/leaflet.markercluster',
        typeahead: 'bower_components/typeahead.js/dist/typeahead.bundle.min' 
    },
})