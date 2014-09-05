define(function(require) {

    /**
     * Map Module. Initializes components
     * and creates data flows from action -->
     * dispatcher --> component
     */

    var $ = require("jquery");
    var _ = require("underscore");
    var L = require("leaflet");
    var Store = require("store");

    var GlobalAlert = require("utils/global-alert");

    // leaflet map
    var Map = L.map('map', {'zoomControl': false});

    // maps markers to a permit id; useful for reusing
    // markers later on
    var Markers = {};

    // update current address when necessary
    var CurrentAddress = Store.CurrentAddress;

    // global alert; convenient to display messages
    var globalEditAlert = new GlobalAlert();

    // map of all leaflet controls
    var ctrls = {};

    // controls that are always active
    var activeControls = [];

    // global controls
    function hidePanelCtrls() {
        _.each(ctrls, function(ctrl, name) {
            var match = _.find(activeControls, function(n) { return n == name;});
            if (!match) ctrl.hideView();
        });
        // in case any of the panels had disabled map interaciton
        enableMapInteractions();
    }

    // enables all listeners on leaflet map
    function enableMapInteractions() {
        Map.dragging.enable();
        Map.touchZoom.enable();
        Map.doubleClickZoom.enable();
        // Map.scrollWheelZoom.enable();
        Map.boxZoom.enable();
        Map.keyboard.enable();
        globalEditAlert.off();
    }

    // disable all listeners on leaflet map
    function disableMapInteractions() {
        Map.dragging.disable();
        Map.touchZoom.disable();
        Map.doubleClickZoom.disable();
        Map.boxZoom.disable();
        Map.keyboard.disable();

        globalEditAlert.showPersistent();
    }

    function generateSDKUrl(key, mapId) {
        return 'http://{s}.tiles.mapbox.com/v3/' + mapId + '/{z}/{x}/{y}.png';
    }
    
    // initial setup for controls 
    function setup(options) {
        // allow custom keys in setup to override config keys
        var key = options.key || config.APIKEY
            , mapId = options.mapId
            , data = options.data;

        if (CurrentAddress.get("latitude") != 0 && CurrentAddress.get("longitude") != 0) {
            var initialView = CurrentAddress.toMapView();
            Map.setView(initialView, 16);
        } else {
            // create "global" map
            CurrentAddress.once("change", function(address) {
                var initialView = CurrentAddress.toMapView();
                Map.setView(initialView, 16);
            });
        }

        // Disable scrolling to allow for scrolling on panels
        Map.scrollWheelZoom.disable();

        var tileLayer = L.tileLayer(generateSDKUrl(key, mapId), {
            attribution: 'Map data &copy;',
            maxZoom: 18
        }).addTo(Map);

        var firstTime = true;
        tileLayer.on("load", function() {
            if (firstTime) {
              Backbone.trigger("show.about");
              firstTime = false;
            }
        });

        Templates.get("map.popup").done(function(template) {
            _.each(options.data, function(d) {
                var permit = new Store.Permit(d);
                if (permit.validate()) {
                    var addr = permit.getAddress();
                    var json = permit.toJSON();
                    var html = Mustache.render(template, json);
                    var marker = L.circleMarker(addr, {color: permit.getColor()})
                        .setRadius(permit.getNetUnitRadius())
                        .addTo(Map)
                        .bindPopup(html);
                    Markers[d.id] = marker;
                }
            });
        });

        // enable global editing
        globalEditAlert.setMessage("Map editing disabled");

        // add all map controls to map and hide
        _.each(ctrls, function(ctrl, name) {
            Map.addControl(ctrl);
        })

        // need to add zoom manually
        Map.addControl(L.control.zoom({'position': 'bottomleft'}))

        Backbone.on('map.interaction.disable', function() {
            disableMapInteractions();
        });

        Backbone.on('map.interaction.enable', function() {
            enableMapInteractions();
        });

        Backbone.on("map.setView", function(address, d) {
            var addr = address.toMapView();
            Map.panTo(addr);
            Map.setZoom(address.get("zoom") || config.DEFAULT_MAP_ZOOM);
            CurrentAddress.set({
                latitude: address.get("latitude"),
                longitude: address.get("longitude")
            });

            if (d) {
                var marker = Markers[d.id];
                if (marker) {
                    setTimeout(function() {
                        marker.openPopup();
                    }, 500);
                }
            }
        });
    };

    setTimeout(function() {
        $(".flashes").fadeOut('slow', function() {
            $(this).remove();
        });
    }, 2000);


    // Exports
    return {
        'setup': setup
    };
})
