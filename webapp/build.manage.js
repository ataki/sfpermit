({
    baseUrl: ".", 
    name: "bower_components/almond/almond.js",
    include: ['manage'],
    out: "dist/app.manage.build.js",
    optimize: "none",
    wrap: true,
    paths: {
        config: 'config',
        jquery: 'bower_components/jquery/dist/jquery.min',
        backbone: 'bower_components/backbone/backbone',
        underscore: 'bower_components/underscore/underscore',
        bootstrap: 'bower_components/bootstrap/dist/js/bootstrap.min',
        moment: 'bower_components/moment/min/moment.min',
        backgrid: 'bower_components/backgrid/lib/backgrid',
        'backgrid-paginator': 'bower_components/backgrid-paginator/backgrid-paginator',
        'backgrid-filter': 'bower_components/backgrid-filter/backgrid-filter',
        'backbone-pageable': 'bower_components/backbone-pageable/lib/backbone-pageable'
    },
})