requirejs.config({

    baseUrl: "",

    paths: {
        config: 'config',
        jquery: 'bower_components/jquery/dist/jquery.min',
        bootstrap: 'bower_components/bootstrap/dist/js/bootstrap.min',
        datepicker: 'bower_components/bootstrap-datepicker/js/bootstrap-datepicker'
    },

    shim: {
        underscore: {
            exports: '_'
        },

        bootstrap: {
            deps: ['jquery']
        },

        datepicker: {
            deps: ['bootstrap']
        }
    }
})

require([
    'jquery', 
    'bootstrap',
    'datepicker' 
], function($) {
    var dtFields = [
        "min_filed",
        "max_action",
        "case_decision_date",
    ];

    $(document).ready(function() {
        $.each(dtFields, function(i, name) {
            var el = document.getElementById(name);
            console.log(el);
            $(el).datepicker({
                default: Date.now()
            });
        });

        $("#case_decision option[value=\"\"]")
            .text("None")
            .attr('selected', true);

        $("#final_status option[value=\"Open\"]")
            .attr('selected', true);
    });
})
