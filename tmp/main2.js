var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/widgets/Search", "esri/Map", "esri/views/MapView", "esri/views/SceneView", "esri/widgets/BasemapGallery", "calcite-maps/calcitemaps-arcgis-support-v0.8"], function (require, exports, Search_1, Map_1, MapView_1, SceneView_1, BasemapGallery_1, calcitemaps_arcgis_support_v0_8_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Search_1 = __importDefault(Search_1);
    Map_1 = __importDefault(Map_1);
    MapView_1 = __importDefault(MapView_1);
    SceneView_1 = __importDefault(SceneView_1);
    BasemapGallery_1 = __importDefault(BasemapGallery_1);
    calcitemaps_arcgis_support_v0_8_1 = __importDefault(calcitemaps_arcgis_support_v0_8_1);
    var app;
    /******************************************************************
     *
     * App settings
     *
     ******************************************************************/
    app = {
        center: [-40, 40],
        scale: 50000000,
        basemap: 'streets',
        viewPadding: {
            top: 50,
            bottom: 0
        },
        uiComponents: ['zoom', 'compass', 'attribution'],
        mapView: null,
        sceneView: null,
        containerMap: 'mapViewDiv',
        containerScene: 'sceneViewDiv',
        activeView: null,
        searchWidget: null
    };
    /******************************************************************
     *
     * Create the map and scene view and ui components
     *
     ******************************************************************/
    // Map
    var map = new Map_1.default({
        basemap: app.basemap
    });
    // 2D view
    app.mapView = new MapView_1.default({
        container: app.containerMap,
        map: map,
        center: app.center,
        scale: app.scale,
        padding: app.viewPadding,
        ui: {
            components: app.uiComponents
        }
    });
    calcitemaps_arcgis_support_v0_8_1.default.setPopupPanelSync(app.mapView);
    // 3D view
    app.sceneView = new SceneView_1.default({
        container: app.containerScene,
        map: map,
        center: app.center,
        scale: app.scale,
        padding: app.viewPadding,
        ui: {
            components: app.uiComponents
        }
    });
    calcitemaps_arcgis_support_v0_8_1.default.setPopupPanelSync(app.sceneView);
    // Set the active view to scene
    setActiveView(app.mapView);
    // Create the search widget and add it to the navbar instead of view
    app.searchWidget = new Search_1.default({
        view: app.activeView
    }, 'searchWidgetDiv');
    calcitemaps_arcgis_support_v0_8_1.default.setSearchExpandEvents(app.searchWidget);
    // Create basemap widget
    app.basemapWidget = new BasemapGallery_1.default({
        view: app.activeView,
        container: 'basemapPanelDiv'
    });
    /******************************************************************
     *
     * Synchronize the view, search and popup
     *
     ******************************************************************/
    // Views
    function setActiveView(view) {
        app.activeView = view;
    }
    function syncViews(fromView, toView) {
        var viewPt = fromView.viewpoint.clone();
        fromView.container = null;
        if (fromView.type === '3d') {
            toView.container = app.containerMap;
        }
        else {
            toView.container = app.containerScene;
        }
        toView.padding = app.viewPadding;
        toView.viewpoint = viewPt;
    }
    // Search Widget
    function syncSearch(view) {
        watchUtils.whenTrueOnce(view, 'ready', function () {
            app.searchWidget.view = view;
            if (app.searchWidget.selectedResult) {
                app.searchWidget.search(app.searchWidget.selectedResult.name);
            }
        });
    }
    // Tab - toggle between map and scene view
    var tabs = Array.from(document.querySelectorAll('.calcite-navbar li a[data-toggle=\'tab\']'));
    tabs.forEach(function (tab) {
        tab.addEventListener('click', function (event) {
            if (event.target.text.indexOf('Map') > -1) {
                syncViews(app.sceneView, app.mapView);
                setActiveView(app.mapView);
            }
            else {
                syncViews(app.mapView, app.sceneView);
                setActiveView(app.sceneView);
            }
            syncSearch(app.activeView);
        });
    });
    /******************************************************************
     *
     * Apply Calcite Maps CSS classes to change application on the fly
     *
     * For more information about the CSS styles or Sass build visit:
     * http://github.com/esri/calcite-maps
     *
     ******************************************************************/
    var cssSelectorUi = [
        document.querySelector('.calcite-navbar'),
        document.querySelector('.calcite-panels')
    ];
    var cssSelectorMap = document.querySelector('.calcite-map');
    // Theme - light (default) or dark theme
    var settingsTheme = document.getElementById('settingsTheme');
    var settingsColor = document.getElementById('settingsColor');
    settingsTheme.addEventListener('change', function (event) {
        var textColor = event.target.options[event.target.selectedIndex].dataset.textcolor;
        var bgColor = event.target.options[event.target.selectedIndex].dataset.bgcolor;
        cssSelectorUi.forEach(function (element) {
            element.classList.remove('calcite-text-dark', 'calcite-text-light', 'calcite-bg-dark', 'calcite-bg-light', 'calcite-bg-custom');
            element.classList.add(textColor, bgColor);
            element.classList.remove('calcite-bgcolor-dark-blue', 'calcite-bgcolor-blue-75', 'calcite-bgcolor-dark-green', 'calcite-bgcolor-dark-brown', 'calcite-bgcolor-darkest-grey', 'calcite-bgcolor-lightest-grey', 'calcite-bgcolor-black-75', 'calcite-bgcolor-dark-red');
            element.classList.add(bgColor);
        });
        settingsColor.value = '';
    });
    // Color - custom color
    settingsColor.addEventListener('change', function (event) {
        var customColor = event.target.value;
        var textColor = event.target.options[event.target.selectedIndex].dataset.textcolor;
        var bgColor = event.target.options[event.target.selectedIndex].dataset.bgcolor;
        cssSelectorUi.forEach(function (element) {
            element.classList.remove('calcite-text-dark', 'calcite-text-light', 'calcite-bg-dark', 'calcite-bg-light', 'calcite-bg-custom');
            element.classList.add(textColor, bgColor);
            element.classList.remove('calcite-bgcolor-dark-blue', 'calcite-bgcolor-blue-75', 'calcite-bgcolor-dark-green', 'calcite-bgcolor-dark-brown', 'calcite-bgcolor-darkest-grey', 'calcite-bgcolor-lightest-grey', 'calcite-bgcolor-black-75', 'calcite-bgcolor-dark-red');
            element.classList.add(customColor);
            if (!customColor) {
                settingsTheme.dispatchEvent(new Event('change'));
            }
        });
    });
    // Widgets - light (default) or dark theme
    var settingsWidgets = document.getElementById('settingsWidgets');
    settingsWidgets.addEventListener('change', function (event) {
        var theme = event.target.value;
        cssSelectorMap.classList.remove('calcite-widgets-dark', 'calcite-widgets-light');
        cssSelectorMap.classList.add(theme);
    });
    // Layout - top or bottom nav position
    var settingsLayout = document.getElementById('settingsLayout');
    settingsLayout.addEventListener('change', function (event) {
        var layout = event.target.value;
        var layoutNav = event.target.options[event.target.selectedIndex].dataset.nav;
        document.body.classList.remove('calcite-nav-bottom', 'calcite-nav-top');
        document.body.classList.add(layout);
        var nav = document.querySelector('nav');
        nav.classList.remove('navbar-fixed-bottom', 'navbar-fixed-top');
        nav.classList.add(layoutNav);
        setViewPadding(layout);
    });
    // Set view padding for widgets based on navbar position
    function setViewPadding(layout) {
        var padding, uiPadding;
        // Top
        if (layout === 'calcite-nav-top') {
            padding = {
                padding: {
                    top: 50,
                    bottom: 0
                }
            };
            uiPadding = {
                padding: {
                    top: 15,
                    right: 15,
                    bottom: 30,
                    left: 15
                }
            };
        }
        else {
            // Bottom
            padding = {
                padding: {
                    top: 0,
                    bottom: 50
                }
            };
            uiPadding = {
                padding: {
                    top: 30,
                    right: 15,
                    bottom: 15,
                    left: 15
                }
            };
        }
        app.mapView.set(padding);
        app.mapView.ui.set(uiPadding);
        app.sceneView.set(padding);
        app.sceneView.ui.set(uiPadding);
        // Reset popup
        if (app.activeView.popup.visible &&
            app.activeView.popup.dockEnabled) {
            app.activeView.popup.visible = false;
            app.activeView.popup.visible = true;
        }
    }
});
//# sourceMappingURL=main2.js.map