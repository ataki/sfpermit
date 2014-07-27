define(function(require) {
    /**
     * Store that sits in-between 
     */

    $ = require("jquery");
    _ = require("underscore");
    Backbone = require("backbone");
    config = require("config");

    // universal data
    var data = {};

    function get(name) {
        return data[name];
    }

    function persist(name, d) {
        data[name] = d;
    }

    function setup() {}

    // should be internal; expose for ease of prototyping
    function endpoint(fragment) {
        return config.API_ENDPOINT_PREFIX + "/" + fragment
    }

    function square(x) { return x * x; }


    function distanceMeasure(addr) {
        var lat = addr.get("latitude")
            , lng = addr.get("longitude");
        return function(m) {
            return Math.sqrt(square(lat - m.get("latitude")) +
                square(lng - m.get("longitude")));
        }
    }

    // one for raw, json objects instead of addrs
    function externalDistanceMeasure(center) {
        var lat = center.latitude,
            lng = center.longitude;
        return function(m) {
            return Math.sqrt(square(lat - m.latitude) +
                square(lng - m.longitude));
        }
    }


    var PermitCollection = Backbone.Collection.extend({
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
        },
        getNearby: function(addr) {
            return this.chain().sortBy(distanceMetric(addr));
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

    var Permit = Backbone.Model.extend({
        validate: function() {
            console.log(this.getAddress());
            return !isNaN(this.get("latitude")) && !isNaN(this.get("longitude"));
        },
        getAddress: function() {
            return [this.get("latitude"), this.get("longitude")];
        },
        getColor: function() {
            var prediction = this.get("prediction");
            if (0 < prediction && prediction <= 0.3) {
                return "red";
            } else if (0.3 < prediction && prediction <= 0.7) {
                return "gray";
            } else if (prediction > 0.7) {
                return "green";
            }
            return "red";
        },
        getNetUnitRadius: function() {
            var net_units = this.get("net_units");
            var domain = [0, 729];
            var range = [20, 100];
            var output = (range[1] - range[0]) * net_units / domain[1] + range[0]
            console.log(net_units + " --> " + output);
            return output;
        }
    });

    // singleton
    var CurrentAddressSingleton = new Address({
        latitude: 0,
        longitude: 0
    });

    // current address singletons
    function constructCurrentAddress(position) {
        CurrentAddressSingleton.set({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }
    function constructDefaultCurrentAddress() {
       alert("The application can't seem to find your current location. Without it, we cannot start"); 
    }

    /**
    * Current singleton emits several major events
    * that should be listened to by widgets / controls
    * that need to have this.
    * `
    */
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            constructCurrentAddress,
            constructDefaultCurrentAddress,
            {enableHighAccuracy: true, timeout: 10000, maximumAge: 0}
        );
    }


    return {
        setup: setup,
        endpoint: endpoint,
        get: get,
        persist: persist,
        distanceMeasure: externalDistanceMeasure,
        // Models
        Permit: Permit,
        SearchResults: SearchResults,
        Schema: Schema,
        Address: Address,
        Permit: Permit,
        // Collections,
        PermitCollection: PermitCollection,
        // Singletons
        CurrentAddress: CurrentAddressSingleton
    }
});