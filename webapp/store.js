define(function(require) {
    /**
     * Master store
     */

    $ = require("jquery");
    _ = require("underscore");
    Backbone = require("backbone");
    config = require("config");

    function setup() {}

    // should be internal; expose for ease of prototyping
    function endpoint(fragment) {
        return config.API_ENDPOINT_PREFIX + "/" + fragment
    }

    var Permit = Backbone.Collection.extend({
        url: endpoint("permit"),
        parse: function(data) {
            var results = _.map(data, function(entry) {
                if (entry.case_decision === "Approved") {
                    entry.case_decision = "success";
                } else if (entry.case_decision === "Withdrawn" ||
                           entry.case_decision === "Cancelled" ||
                           entry.case_decision === "Disapproved") {
                    entry.case_decision = "fail";
                } else if (entry.case_decision === "") {
                    entry.case_decision = "neutral";
                } else if (entry.case_decision === "CEQA") {
                    entry.case_decision = "info";
                }
                return entry;
            });
            return results;
        }
    });

    var SearchResults = Backbone.Collection.extend({
        url: endpoint("search") 
    });

    var Schema = Backbone.Collection.extend({
        url: endpoint("schema") 
    });

    var Address = Backbone.Model.extend({
        validate: function() {
            return this.has("longitude") && this.has("latitude");
        },
        toMapView: function() {
            return [this.get("latitude"), this.get("longitude")];
        }
    });


    return {
        setup: setup,
        endpoint: endpoint,
        Permit: Permit,
        SearchResults: SearchResults,
        Schema: Schema,
        Address: Address
    }
});