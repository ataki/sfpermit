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
    var Templates = require("templates");

    var GlobalAlert = require("utils/global-alert");
    var CurrentAddress = Store.CurrentAddress;

    // Load Marker Clusters
    require("leaflet_markercluster");

    // leaflet map
    var map = L.map('map', {'zoomControl': false});
    var markerCluster = new L.MarkerClusterGroup();
    var markerIds = {};
    window._map = map;

    // update current address when necessary
    var currentAddress = Store.CurrentAddress;

    var globalEditAlert = new GlobalAlert();

    var ctrls = {};
    var activeControls = [];

    var permits = Store.DB.permits;
    permits.on("reset", renderAllPoints);

    if (permits.length != 0) {
        renderAllPoints();
    }

    function renderAllPoints() {
        Templates.get("map-popup").done(function(template) {
            markerCluster.clearLayers();
            permits.each(function(permit) {
                if (permit.validate()) {
                    var addr = permit.getAddress();
                    var json = permit.toJSON();
                    var html = Mustache.render(template, json);
                    var marker = new L.circleMarker(addr, {
                        color: permit.getColor()
                    });
                    marker.bindPopup(html);
                    markerIds[permit.id] = marker;
                    markerCluster.addLayer(marker);
                }
            });
            // adds MarkerClustering layer to the map
            map.addLayer(markerCluster);
        });
    }

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
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        // map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
        globalEditAlert.off();
    }

    // disable all listeners on leaflet map
    function disableMapInteractions() {
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();

        globalEditAlert.showPersistent();
    }

    function generateSDKUrl(key, mapId) {
        return 'http://{s}.tiles.mapbox.com/v3/' + mapId + '/{z}/{x}/{y}.png';
    }

    map.on("drag", function() {
        var center = map.getCenter()
            , lat = center.lat
            , lng = center.lng;
        CurrentAddress.set({
            "latitude": lat,
            "longitude": lng
        })
    });

    // global broadcast actions
    Backbone.on('map.interaction.disable', function() {
        disableMapInteractions();
    });

    Backbone.on('map.interaction.enable', function() {
        enableMapInteractions();
    });

    function tryGoingToMarker(marker) {
        try {
            markerCluster.zoomToShowLayer(marker, function() {
                console.log("zoomToShowLayer works");
            });
        } catch (err) {
            // pass 
        }
    }

    Backbone.on("map.setView", function(address, d) {
        console.log("panning to ", address.toMapView());
        var addr = address.toMapView();
        map.panTo(addr);
        map.setZoom(address.get("zoom") || config.DEFAULT_MAP_ZOOM);
        currentAddress.set({
            latitude: address.get("latitude"),
            longitude: address.get("longitude")
        });

        if (d) {
            var maybeMarker = markerIds[d.id];
            try {
                if (typeof maybeMarker.openPopup === "function") {
                    maybeMarker.openPopup();
                }
            } catch (err) {
                tryGoingToMarker(maybeMarker);
            }
        }
    });
    
    // initial setup for controls 
    function setup(options) {
        var key = options.key || config.APIKEY
            , mapId = options.mapId
            , data = options.data
            , initialView = options.initialView;

        console.log("initialView: ", initialView);
        CurrentAddress.setCoordinates(initialView);
        map.setView(initialView, 11);

        // Disable scrolling to allow for scrolling on panels
        map.scrollWheelZoom.disable();

        var tileLayer = L.tileLayer(generateSDKUrl(key, mapId), {
            attribution: 'Map data &copy;',
            maxZoom: 18
        }).addTo(map);

        var firstTime = true;
        tileLayer.on("load", function() {
            if (firstTime) {
              Backbone.trigger("show.about");
              firstTime = false;
            }
        });

        // enable global editing
        // globalEditAlert.setMessage("Map editing disabled");

        // add all map controls to map and hide
        _.each(ctrls, function(ctrl, name) {
            map.addControl(ctrl);
        })

        // need to add zoom manually
        map.addControl(L.control.zoom({'position': 'bottomleft'}))
    };

    setTimeout(function() {
        $(".flashes").fadeOut('slow', function() {
            $(this).remove();
        });
    }, 2000);


    // Exports
    return {
        'setup': setup,
        'map': map
    };
})
