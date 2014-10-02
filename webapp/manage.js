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
    'backbone',
    'config',
    'store',
    'backgrid',
    'backgrid-paginator',
    'backgrid-filter',
    'backbone-pageable',
    'bootstrap',
], function($, backbone, config, Store, Backgrid) {

    var permits = Store.DB.permits; 

        function endpoint(fragment) {
            return config.API_ENDPOINT_PREFIX + "/" + fragment;
        }

        // Set up instance
        var PermitPagedCollection = Backbone.PageableCollection.extend({
          model: Store.Permit,
          url: endpoint("permit"),
          state: {
            pageSize: 25
          },
          mode: "client", // page entirely on the client side
          parseRecords: function(resp) {
            _.each(resp.objects, function(d) {
                d.edit_link = '/edit/' + d.id;
            });
            return resp.objects;
          }
        });

        var permitCollection = new PermitPagedCollection();


        // Set up ManagerView wrapper over Backgrid View
        var ManagerView = Backbone.View.extend({
            columns: [
                {
                    name: 'case_number',
                    label: 'Case Num',
                    editable: false,
                    cell: 'string'
                },
                {
                    name: 'edit_link',
                    label: 'Edit Link',
                    editable: false,
                    cell: 'uri'
                },
                {
                    name: 'project_name',
                    label: 'Project Name',
                    cell: 'string'
                },
                {
                    name: 'case_decision_date',
                    label: 'Case Decision Date',
                    cell: 'date'
                },
                {
                    name: 'case_decision',
                    label: 'Case Decision',
                    cell: 'string'
                },
                {
                    name: 'net_units',
                    label: 'Net Units',
                    cell: 'integer'
                },
                {
                    name: 'final_status',
                    label: 'Final Status',
                    cell: 'string'
                },
                {
                    name: 'planning_approved',
                    label: 'Planning appro.',
                    cell: 'boolean'
                },
                {
                    name: 'min_filed',
                    label: 'Min Filed',
                    cell: 'date'
                },
                {
                    name: 'max_action',
                    label: 'Max Action',
                    cell: 'date'
                },
                {
                    name: 'in_current_planning',
                    label: 'In Current Plan.',
                    cell: 'boolean'
                }
            ],
            initialize: function() {
                this.collection = permitCollection;
                this.grid = new Backgrid.Grid({
                    columns: this.columns,
                    collection: this.collection
                });
                this.paginator = new Backgrid.Extension.Paginator({
                    collection: this.collection
                });
                this.filter = new Backgrid.Extension.ClientSideFilter({
                    collection: this.collection,
                    fields: ['project_name', 'case_decision', 'final_status', 'case_number']
                });
            },
            render: function() {
                this.$el.append(this.filter.render().el);
                this.$el.append(this.paginator.render().el);
                this.$el.append(this.grid.render().el);
                this.collection.fetch({reset: true});
                return this;
            }
        });

        function initialize() {
            var SFPermitManager = new ManagerView({el: '#manager'});
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

        console.log("Initializing data");
        maybeFetchPermits();  

})