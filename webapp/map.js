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
    var GlobalAlert = require("utils/global-alert");

    var Map = L.map('map', {'zoomControl': false});

    var globalEditAlert = new GlobalAlert();
    
    var ctrls = {
      'search': new SearchControl(),
      'menu': new MenuControl()
    };

    // controls that are always active
    var activeControls = [
        'search', 'menu'
    ];


    function generateSDKUrl(key, mapId) {
        return 'http://{s}.tiles.mapbox.com/v3/' + mapId + '/{z}/{x}/{y}.png';
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

    function enableMapInteractions() {
        Map.dragging.enable();
        Map.touchZoom.enable();
        Map.doubleClickZoom.enable();
        Map.scrollWheelZoom.enable();
        Map.boxZoom.enable();
        Map.keyboard.enable();

        globalEditAlert.off();
    }

    function disableMapInteractions() {
        console.log("disabling map interactions");
        Map.dragging.disable();
        Map.touchZoom.disable();
        Map.doubleClickZoom.disable();
        Map.scrollWheelZoom.disable();
        Map.boxZoom.disable();
        Map.keyboard.disable();

        globalEditAlert.showPersistent();
    }
    
    // initial setup for controls 
    function setup(options) {
        // allow custom keys in setup to override config keys
        var key = options.key || config.APIKEY
            , mapId = options.mapId
            , data = options.data
            , initialView = options.initialView;

        // create "global" map
        Map.setView(initialView, 11);

        L.tileLayer(generateSDKUrl(key, mapId), {
            attribution: 'Map data &copy;',
            maxZoom: 18
        }).addTo(Map);

        _.each(options.data, function(lead) {
            var address = new Store.Address(lead);
            console.log(address);
            if (address.validate()) {
                var addr = address.toMapView();
                L.marker(addr)
                    .addTo(Map)
                    .bindPopup(address.get("project_name"))
                    .openPopup();
            }
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

        // Backbone.on('show.help', function() {
        //     hidePanelCtrls();
        //     ctrls.help.showView();
        // });
        // Backbone.on('show.search', function() {
        //     hidePanelCtrls();
        // });
        
        Backbone.on('show.search', function() {
            ctrls.search.showView();
        });

        Backbone.on('hide.search', function() {
            ctrls.search.hideView();
        });

        Backbone.on('map.interaction.disable', function() {
            disableMapInteractions();
        });

        Backbone.on('map.interaction.enable', function() {
            enableMapInteractions();
        });

        Backbone.on("map.setView", function(address) {
            var addr = address.toMapView();
            Map.panTo(addr);
            Map.setZoom(address.get("zoom") || config.DEFAULT_MAP_ZOOM);
        });
    };

    // Interactions

    $(document).on("keyup", function(e) {
        if (e.which == 27) {
            Backbone.trigger("hide.search");
        }
    });

    // Exports
    return {
        'setup': setup
    };
})