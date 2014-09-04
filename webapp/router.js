define(function(require) {

    var Backbone = require("backbone");
    var Store = require("store");

    var PermitView = require("views/permit-detail-view.js");
    var PermitListView = require("views/permit-list-view.js"); 
    var AboutView = require("views/about-view.js");
    var HelpView = require("views/help-view.js");

    var Router = Backbone.Router.extend({
        routes: {
            "about": "about",
            "help": "help",
            "permits/p:page": "dashboard"
            "permit/:id", "permitPage"
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
            if (!page) {
                page = 1;
            }

            var view = new PermitListView({
                page: page,
                el: $("#side .list")
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