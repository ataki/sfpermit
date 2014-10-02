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

    function formatDatetimeWSeconds(dt) {
        var mm = moment(dt);
        if (mm.isValid()) return mm.format('MMM Do YYYY, HH:mm:ss');
        else return "Unknown";
    }

    function formatDatetime(dt) {
        var mm = moment(dt);
        if (mm.isValid()) return mm.format('MMM Do YYYY');
        else return "Unknown";
    }

    // endpoint for API calls
    function endpoint(fragment) {
        return config.API_ENDPOINT_PREFIX + "/" + fragment
    }

    function googleStreetsViewImage(lat, lng, key) {
        return "http://maps.googleapis.com/maps/api/streetview?size=200x200&location=" + lat + "," + lng + "&key=" + key;
    }

    function square(x) { return x * x; }

    function makeEqualsFilter(name, value) {
        return {"name": name, "op": "==", "val": value};
    }

    function makeLikeFilter(name, value) {
       return {"name": name, "op": "like", "val": '%' + value + '%'}; 
    }

    function makeGTFilter(name, value) {
       return {"name": name, "op": "gt", "val": value}; 
    }

    function makeLTFilter(name, value) {
       return {"name": name, "op": "lt", "val": value}; 
    }

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
        },
        setCoordinates: function(pt_arr) {
            this.set({
                'latitude': pt_arr[0],
                'longitude': pt_arr[1]
            })
        }
    });

    var Comment = Backbone.Model.extend({
        url: function() {
            if (!this.id) return endpoint("comment");
            else return endpoint("comment/" + this.id);
        },
        validate: function() {
            var attrs = this.attributes;
            if (!_.has(attrs, "text") || !_.has(attrs, "permit_id")) 
                return "Not enough fields to comment";
            if (attrs.text.length == 0) 
                return "Comments must have non empty field";
        },
        toJSON: function() {
            var attrs = _.clone(this.attributes);
            attrs.timestamp = formatDatetimeWSeconds(attrs.timestamp);
            return attrs;
        }
    });

    var CommentCollection = Backbone.Collection.extend({
        url: endpoint("comment"),
        model: Comment,
        initialize: function(permit) {
            this.query = {page: 1};
        },
        setPermitId: function(id) {
            this.query.q = JSON.stringify({
                filters: [
                    makeEqualsFilter("permit_id", parseInt(id))
                ]
            });
        },
        parse: function(response) {
            this.metadata = _.omit(response, "objects"); 
            return response.objects;
        },
        fetchForModel: function(id) {
           var filter = makeEqualsFilter("permit_id", id);
            this.query.q = JSON.stringify({
                filters: [filter],
                order_by: [{
                    "field": "timestamp", 
                    "direction": "desc"
                }]
            });
            return this.fetch({data: this.query, reset: true}); 
        }
    });

    var Permit = Backbone.Model.extend({
        validate: function() {
            return !_.isNaN(this.get("latitude")) && !_.isNaN(this.get("longitude")) && 
                    !_.isNull(this.get("latitude")) && !_.isNull(this.get("longitude"));
        },
        getAddress: function() {
            return [this.get("latitude"), this.get("longitude")];
        },
        getColor: function() {
            var prediction = this.get("prediction");
            var final_status = this.get("final_status");
            if (final_status != 'Open') {
                return "#555";
            }
            if (0 < prediction && prediction <= 0.3) {
                return "red";
            } else if (0.3 < prediction && prediction <= 0.7) {
                return "#555";
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
            if (level > 0.65) {
                return "success";
            }
            if (level > 0.3) {
                return "default";
            }
            return "danger";
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
            /**** 
                TODO Rename this method and replace collection.toJSON calls
                to collection.map(function(m) { m.toMustacheJSON(); }).
                This is currently abusing the toJSON() method.
            */
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
            attributes.min_filed = moment(attributes.min_filed).format("MMMM Do YYYY");
            attributes.max_action = moment(attributes.max_action).format("MMMM Do YYYY");
            attributes.case_decision_date = moment(attributes.case_decision_date).format("MMMM Do YYYY");
            attributes.planning_approved = attributes.planning_approved ? "False": "True"; 
            attributes.in_current_planning = attributes.in_current_planning ? "False": "True";
            attributes.prediction *= 100;
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
        url: function() {
            return "/nearest/" + this.metric;
        },
        setMetric: function(m) {
            if (m == "distance" || m == "units" || m == "risk") {
                this.metric = m;
            } else {
                throw "Metric must be distance|units|risk"
            }
        }
    });

    var Log = Backbone.Model.extend({
        url: function() {
            if (this.id) return endpoint("permit_update_log/" + this.id);
            else return endpoint("permit_update_log");
        },
        validate: function() {
            var attrs = this.attributes;
            if (!_.has(attrs, "text") || !_.has(attrs, "permit_id")) return "Not enough attributes";
            if (attrs.text.length == 0) {
                return "Log doesn't have a comment";
            }
        },
        toJSON: function() {
            var attrs = this.attributes;
            attrs.timestamp = formatDatetimeWSeconds(attrs.timestamp);
            return attrs;
        }
    });

    var LogCollection = Backbone.Collection.extend({
        url: endpoint("permit_update_log"),
        model: Log,
        initialize: function() {
            this.query = {page: 1};
        },
        parse: function(response) {
            var sorted_response = _.sortBy(response.objects, function(obj) {
                var mm = moment(obj.timestamp);
                if (!mm.isValid()) {
                    if (obj.type == "decision") {
                        console.log(obj.type);
                        mm = moment();
                    } else {
                        var min_filed = moment(obj.min_filed).toDate();
                        var ts = min_filed.getTime() + 1000;
                        mm = moment(ts);
                    }
                }
                return -mm._d.getTime();
            });
            _.each(sorted_response, function(obj) {
                obj.timestamp_dp = formatDatetime(obj.timestamp);
                obj[obj.type] = true;
            });
            return sorted_response;
        },
        setPage: function(page) {
            this.query.page = page;
        },
        fetchForModel: function(id) {
            var filter = makeEqualsFilter("permit_id", id);
            this.query.q = JSON.stringify({
                filters: [filter],
                order_by: [{
                    "field": "timestamp", 
                    "direction": "desc"
                }]
            });
            return this.fetch({data: this.query, reset: true});
        }
    });

    // singleton
    var CurrentAddressSingleton = new Address({
        latitude: 0,
        longitude: 0
    });

    // current address singletons
    // not correct if you're not exploring in SF,
    // so disabling this setter for now
    function constructCurrentAddress(position) {
        // CurrentAddressSingleton.set({
        //     latitude: position.coords.latitude,
        //     longitude: position.coords.longitude
        // });
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

    // Permit Collection shared by several views
    var permitCollection = new PermitCollection();
    permitCollection.fetch();

    // Persistent data. Use these structures 
    // as read-only ones for reference
    var DB = {
        permits: permitCollection
    };

    return {
        setup: setup,
        endpoint: endpoint,
        get: get,
        persist: persist,
        makeGTFilter: makeGTFilter,
        makeLTFilter: makeLTFilter,
        makeLikeFilter: makeLikeFilter,
        makeEqualsFilter: makeEqualsFilter,
        distanceMeasure: distanceMeasure,
        formatDatetime: formatDatetime,
        formatDatetimeWSeconds: formatDatetimeWSeconds,
        DB: DB,
        // Models
        Permit: Permit,
        SearchResults: SearchResults,
        Schema: Schema,
        Address: Address,
        Permit: Permit,
        Comment: Comment,
        Log: Log,
        // Collections,
        PermitCollection: PermitCollection,
        LogCollection: LogCollection,
        CommentCollection: CommentCollection,
        NearestPermitCollection: NearestPermitCollection,
        // Singletons
        CurrentAddress: CurrentAddressSingleton, 
    }
});