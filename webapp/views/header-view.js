define(function(require) {
    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");
    var Mustache = require("mustache");
    var Templates = require("templates");
    var Store = require("store");
    var Forms = require("utils/forms");

    require("typeahead");

    /**
    * Top Header Component
    */

    var CurrentAddress = Store.CurrentAddress;
    var PermitCollection = Store.PermitCollection;
    var Address = Store.Address;

    var endpoint = Store.endpoint;

    function extractValue(d) {
        return d.project_name + " (" + d.case_number + ")";
    }

    var Header = Backbone.View.extend({
        id: 'menu-control',
        events: {
            'click .target-search': 'showSearch',
            'click .target-permits': 'showPermits',
            'click .target-about': 'showAbout'
        },
        render: function() {
            var _ref = this;
            CurrentAddress.on("change", function() {
                var lat = CurrentAddress.get("latitude")
                    , lng = CurrentAddress.get("longitude");
                _ref.updateCurrentAddress(lat, lng);
            });
            if (CurrentAddress.validate()) {
                this.updateCurrentAddress(
                    CurrentAddress.get("latitude"),
                    CurrentAddress.get("longitude")
                );
            }
            this.setupSearch();
            return this;
        },
        setupSearch: function(source) {
            this.engine = new Bloodhound({
                prefetch: {
                    url: endpoint("permit"),
                    ajax: {
                        data: {
                            results_per_page: 10000
                        }
                    },
                    filter: function(response) {
                        var objects = response.objects;
                        return _.map(objects, function(d) {
                            return {
                                'value': extractValue ? extractValue(d) : d.project_name, 
                                'id': d.id,
                                'latitude': d.latitude,
                                'longitude': d.longitude
                            };
                        });
                    },
                    ttl: -1
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                datumTokenizer: function(d) {
                    var term = d.value.replace(",", "");
                    return Bloodhound.tokenizers.whitespace(term);
                }
            });

            this.engine.initialize();

            $("#permit-search").typeahead({
                minLength: 3,
                highlight: true
            }, {
                name: 'permits',
                source: this.engine.ttAdapter()
            });

            // typeahead interaction
            $("#permit-search").on("typeahead:selected", function(evt, d) {
                var addr = new Address({
                    latitude: d.latitude,
                    longitude: d.longitude
                })
                Backbone.trigger("map.setView", addr, d); 
            });
        },
        updateCurrentAddress: function(lat, lng) {
            $(".latitude").text("@" + lat.toFixed(2) + " , ")
            $(".longitude").text(lng.toFixed(2));
        }
    });

    return Header;
});