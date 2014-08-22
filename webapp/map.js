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

    var HelpControl = require("controls/help-control");
    var MenuControl = require("controls/menu-control");
    var SearchControl = require("controls/search-control");
    var ListControl = require("controls/list-control");
    var AboutControl = require("controls/about-control");
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
    var ctrls = {
      'search': new SearchControl(),
      'menu': new MenuControl(),
      'list': new ListControl(),
      'about': new AboutControl()
    };

    // controls that are always active
    var activeControls = ['menu'];

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
            CurrentAddress.once("change", function(address) {
                // create "global" map
                var initialView = CurrentAddress.toMapView();
                Map.setView(initialView, 16);
            });
        }

        // Disable scrolling to allow for scrolling on panels
        Map.scrollWheelZoom.disable();

        L.tileLayer(generateSDKUrl(key, mapId), {
            attribution: 'Map data &copy;',
            maxZoom: 18
        }).addTo(Map);

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

        // hide panels initially
        hidePanelCtrls();   

        Map.addControl(L.control.zoom({'position': 'bottomleft'}))

        Backbone.on('show.search', function() {
            hidePanelCtrls();
            ctrls.search.showView();
            disableMapInteractions();
        });

        Backbone.on('hide.search', function() {
            ctrls.search.hideView();
            enableMapInteractions();
        });

        Backbone.on('show.about', function() {
            hidePanelCtrls();
            ctrls.about.showView();
        });

        Backbone.on('hide.about', function() {
            ctrls.about.hideView();
        });

        Backbone.on('show.list', function(data) {
            if (!data) {
                throw new Error("list view needs data!");
            } 
            ctrls.search.hideView();
            ctrls.list.updateViewData(data);
            ctrls.list.showView();
        });

        Backbone.on('hide.list', function() {
            enableMapInteractions();
            ctrls.list.cleanUpView();
            ctrls.list.hideView();
        });

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
            console.log(address.toMapView());
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

    // hide all controls when esc key is pressed
    $(document).on("keyup", function(e) {
        if (e.which == 27) {
            Backbone.trigger("hide.search");
            Backbone.trigger("list.hide");
        }
    });

    Backbone.trigger("show.about");

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
