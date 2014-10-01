define(function(require) {
    var $ = require("jquery")
    , _ = require("underscore")
    , Backbone = require("backbone")
    , Backgrid = require("backgrid")
    , Store = require("store");

    require("backgrid-paginator");
    require("backgrid-filter");
    require("backbone-pageable");

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

    return ManagerView;
});