({
    baseUrl: ".", 
    name: "bower_components/almond/almond.js",
    include: ['upload'],
    insertRequire: ['upload'],
    out: "dist/app.upload.build.js",
    wrap: true,
    paths: {
        config: 'config',
        jquery: 'bower_components/jquery/dist/jquery.min',
        bootstrap: 'bower_components/bootstrap/dist/js/bootstrap.min',
        datepicker: 'bower_components/bootstrap-datepicker/js/bootstrap-datepicker'
    },
})