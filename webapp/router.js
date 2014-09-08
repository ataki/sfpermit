define(function(require) {

    var Backbone = require("backbone");
    var Store = require("store");

    var HeaderView = require("views/header-view");
    var PermitView = require("views/permit-detail-view");
    var PermitListView = require("views/permit-list-view"); 
    var AboutView = require("views/about-view");
    var HelpView = require("views/help-view");

    var permits = Store.DB.permits;

    var Router = Backbone.Router.extend({
        routes: {
            "about": "about",
            "help": "help",
            "permits/p:page": "permitList",
            "permit/:id": "permitPage"
        },

        initialize: function() {
            this.views = {};
            var header = new HeaderView({
                el: "#header"
            });
            header.render();
        },

        about: function() {
            var view = new AboutView();
            view.show();
        },

        help: function() {
            var view = new HelpView();
            view.show();
        },

        permitList: function(page) {
            console.log("navigating to permitList");
            if (!page) {
                page = 1;
            }

            if (!this.views.permitList) {
                this.views.permitList = new PermitListView({
                    page: page,
                    collection: permits,
                    el: "#side .child.list"
                });
                this.views.permitList.render();
            } else {
                // Controller logic, ugh
                this.views.permitList.setPage(page);
            }
        },

        permitPage: function(_id) {
            var id = parseInt(_id);
            var permit = permits.get(id);

            var promise;
            if (permit) {
                handler(permit);
            } else {
                permit = new Permit({id: id});
                permit.on("sync", renderHandler);
                permit.fetch();
            }

            var _ref = this;
            function renderHandler(model) {
                if (_ref.views.permitPage) {
                    _ref.views.permitPage.model = model;
                } else {
                    _ref.views.permitPage = new PermitView({
                        model: model,
                        el: $("#side .detail")
                    });
                }
                _ref.views.permitPage.render().show();
            }
        },
    });

    return Router;
});