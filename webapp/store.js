define(function(require) {
    /**
     * Store that sits in-between 
     */

    $ = require("jquery");
    _ = require("underscore");
    Backbone = require("backbone");
    config = require("config");
    moment = require("moment");

    // universal data
    var data = {};

    function get(name) {
        return data[name];
    }

    function persist(name, d) {
        data[name] = d;
    }

    function setup() {}

    function formatDatetime(dt) {
        return moment(dt).format('MMMM Do YYYY, h:mm:ss a');
    }

    // endpoint for API calls
    function endpoint(fragment) {
        return config.API_ENDPOINT_PREFIX + "/" + fragment
    }

    function googleStreetsViewImage(lat, lng, key) {
        return "http://maps.googleapis.com/maps/api/streetview?size=200x200&location=" + lat + "," + lng + "&key=" + key;
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

    var SearchResults = Backbone.Collection.extend({
        url: endpoint("search") 
    });

    var Schema = Backbone.Collection.extend({
        url: endpoint("schema") 
    });

    var Address = Backbone.Model.extend({
        validate: function() {
            return this.has("longitude") && this.has("latitude")
                && _.isNumber(this.get("latitude"))
                && _.isNumber(this.get("longitude"));
        },
        toMapView: function() {
            return [this.get("latitude"), this.get("longitude")];
        }
    });

    var Permit = Backbone.Model.extend({
        validate: function() {
            return !isNaN(this.get("latitude")) && 
                    !isNaN(this.get("longitude"));
        },
        getAddress: function() {
            return [this.get("latitude"), this.get("longitude")];
        },
        getColor: function() {
            var prediction = this.get("prediction");
            var final_status = this.get("final_status");
            if (final_status != 'Open') {
                return "gray";
            }
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
            return output;
        },
        getPredictionLevel: function() {
            var level = this.get("prediction");
            if (level > 0.6) {
                return "success";
            }
            else if (level > 0.3) {
                return "warning";
            }
            else {
                return "danger";
            }
        },
        getDaysLevel: function() {
            var days = this.get("days");
            if (days > 365 * 3.5) {
                return "danger";
            }
            else if (days > 365 * 2) {
                return "warning";
            }
            else if (days < 0) {
                return "default";
            }
            else {
                return "success";
            }
        },
        roundPrediction: function(pred) {
            if (typeof pred === "number") {
                return pred.toFixed(2);
            } else {
                return 0.00;
            }
        },
        toJSON: function() { 
            var attributes = _.clone(this.attributes);
            attributes.prediction_level = this.getPredictionLevel();
            attributes.days_level = this.getDaysLevel(); 
            attributes.prediction = this.roundPrediction(attributes.prediction)
            if (attributes.final_status == null) {
                attributes.final_status = 'Unknown';
            }
            if (attributes.days < 0) {
                attributes.days = 0;
            }
            attributes.image_url = googleStreetsViewImage(
                attributes.latitude, 
                attributes.longitude,
                config.GOOGLE_APIKEY
            );
            return attributes;
        }
    });

    var PermitCollection = Backbone.Collection.extend({
        url: endpoint("permit"),
        model: Permit,
        parse: function(response) {
            this.metadata = _.omit(response, "objects");
            var objects = response.objects;
            return _.map(objects, function(entry) {
                // Map decisions to human readable
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

                // for templates
                entry[entry.final_status] = true;
                return entry;
            });
        }
    });

    var NearestPermitCollection = PermitCollection.extend({
        initialize: function() {
            this.metric = "distance"
        },
        setMetric: function(m) {
            if (m == "distance" || m == "units" || m == "risk") {
                this.metric = m;
            } else {
                throw "Metric must be distance|units|risk"
            }
        },
        url: function() {
            return "/nearest/" + this.metric;
        }
    })

    var LogCollection = Backbone.Collection.extend({
        url: endpoint("permit_update_log"),
        parse: function(response) {
            _.each(response.objects, function(obj) {
                obj.timestamp_dp = formatDatetime(obj);
                obj[obj.type] = true;
            });
            return response.objects;
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
        LogCollection: LogCollection,
        NearestPermitCollection: NearestPermitCollection,
        // Singletons
        CurrentAddress: CurrentAddressSingleton
    }
});