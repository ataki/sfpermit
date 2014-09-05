define(function(require) {

    var Backbone = require("backbone");
    var Store = require("store");

    var HeaderView = require("views/header-view");
    var PermitView = require("views/permit-detail-view");
    var PermitListView = require("views/permit-list-view"); 
    var AboutView = require("views/about-view");
    var HelpView = require("views/help-view");

    var Router = Backbone.Router.extend({
        routes: {
            "about": "about",
            "help": "help",
            "permits/p:page": "permitList",
            "permit/:id": "permitPage"
        },

        initialize: function() {
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

            var view = new PermitListView({
                page: page,
                el: "#side .child.list"
            });
            view.render();
        },

        permitPage: function(_id) {
            var id = parseInt(_id);
            var permit = Store.PermitCollection.get(id);

            var promise;
            if (permit) {
                promise = $.Deferred();
                promise.resolve(permit);
            } else {
                promise = Store.Permit.fetch({id: id});
            }


            promise.then(function(model) {
                var view = new PermitView({
                    model: model,
                    el: $("#side .detail")
                });
                view.render().show();
            });
        },
    });

    return Router;
});