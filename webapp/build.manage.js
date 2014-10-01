({
    baseUrl: ".", 
    name: "bower_components/almond/almond.js",
    include: ['manage'],
    insertRequire: ['manage'],
    out: "dist/app.manage.build.js",
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
        leaflet_markercluster: 'bower_components/leaflet.markercluster/dist/leaflet.markercluster-src',
        typeahead: 'bower_components/typeahead.js/dist/typeahead.bundle.min',
        backgrid: 'bower_components/backgrid/lib/backgrid',
        'backgrid-paginator': 'bower_components/backgrid-paginator/backgrid-paginator',
        'backgrid-filter': 'bower_components/backgrid-filter/backgrid-filter',
        'backbone-pageable': 'bower_components/backbone-pageable/lib/backbone-pageable'
    },
})