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
            "": "reroute",
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

            var _ref = this;
            // allow components to navigate by pub-sub
            Backbone.on("navigate:permit", function(id) {
                _ref.navigate("permit/" + id);
            });
        },

        reroute: function() {
            var page = 1;
            if (this.views.permitList) {
                page = this.views.permitList.query.data.page;
            }
            this.navigate("permits/p" + page, {
                trigger: true, 
                replace: true
            });
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
            
            if (this.views.permitPage) {
                this.views.permitPage.hide();
            }
            if (!page) {
                throw new Error("Must have a page");
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

            var _ref = this;
            function handler(model) {
                if (_ref.views.permitPage) {
                    _ref.views.permitPage.model = model;
                } else {
                    _ref.views.permitPage = new PermitView({
                        model: model,
                        el: $("#detail")
                    });
                }
                _ref.views.permitPage.render().show();
            }

            var promise;
            if (permit) {
                handler(permit);
            } else {
                permit = new Permit({id: id});
                permit.on("sync", handler);
                permit.fetch();
            }
        },
    });

    return Router;
});