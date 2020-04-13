import MapView from 'esri/views/MapView';
import Track from 'esri/widgets/Track';
import Graphic from 'esri/Graphic';
import Map from 'esri/Map';
import geometryEngine from 'esri/geometry/geometryEngine';
import Locate from 'esri/widgets/Locate';
import Search from 'esri/widgets/Search';
import Point from 'esri/geometry/Point';
import { Geometry, Polygon } from 'esri/geometry';
import SceneView from 'esri/views/SceneView';
import Circle from 'esri/geometry/Circle';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import esriConfig from 'esri/config';
import WebTileLayer from 'esri/layers/WebTileLayer';
import Basemap from 'esri/Basemap';
import VectorTileLayer from 'esri/layers/VectorTileLayer';


const measureUnits = 'meters';
let myBuffer: Polygon;
let bufferGraphic: any;
let lineGraphic: any;
let textGraphic: any;

let app = {
  center: [35.927856445311086, 31.15766030505698],
  scale: 2311162,
  maxAllowDistance: 100,
  maxAllowDistanceWarring: 120,
  maxAllowDistanceDanger: 150,
  basemap: 'streets-navigation-vector',
  viewPadding: {
    top: 50,
    bottom: 0
  },
  uiComponents: ['zoom', 'compass', 'attribution'],
  mapView: null,
  sceneView: null,
  searchGeometry: '',
  containerMap: 'viewDiv',
  containerScene: 'sceneViewDiv',
  activeView: null,
  searchWidget: null,
  useGoogleMaps: true
};


esriConfig.request.corsEnabledServers
  .push('mts0.google.com', 'mts1.google.com', 'mts2.google.com',
    'mts3.google.com');


let vtlLayer = new VectorTileLayer({
  url: 'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer'
});

let basemap = new Basemap({
  baseLayers: [vtlLayer]
});


const map = new Map({});


app.mapView = new MapView({
  container: app.containerMap,
  map: map,
  center: app.center,
  scale: app.scale
});


 

/*
let tiledLayer = new WebTileLayer({
  urlTemplate: 'https://mts{subDomain}.google.com/vt/lyrs=s@186112443&hl=x-local&src=app&x={col}&y={row}&z={level}&s=Galile',
  subDomains: ['0', '1', '2', '3'],
  copyright: 'Google Maps'
});

map.add(tiledLayer);
*/

if (!app.useGoogleMaps) {
  map.basemap = basemap;
}
else {
  let tiledLayer = new WebTileLayer({
    urlTemplate: 'https://mts{subDomain}.google.com/vt/lyrs=m&hl=he&src=app&x={col}&y={row}&z={level}&s=rehovot',
    subDomains: ['0', '1', '2', '3'],
    copyright: 'Google Maps'
  });

  map.add(tiledLayer);
}




setActiveView(app.mapView);


/*
var map = new Map({
  basemap: "satellite",
  ground: "world-elevation"
});

var view = new SceneView({
  scale: 123456789,
  container: "viewDiv",
  map: map
});
*/

const polySym = {
  type: 'simple-fill', // autocasts as new SimpleFillSymbol()
  color: [20, 100, 10, 0.3],
  outline: {
    color: [0, 0, 0, 0.3],
    width: 2
  }
};


function setActiveView(view: any) {
  app.activeView = view;
}



app.searchWidget = new Search(
  {
    view: app.activeView,
    allPlaceholder: 'כאן מקלידים את הכתובת',
    popupEnabled: false

  },
  'searchWidgetDiv'
);
/*
app.activeView.ui.add(app.searchWidget, {
  position: 'top-left',
  index: 0
});
*/

app.searchWidget.on('search-complete', function (event) {
  // The results are stored in the event Object[]
});


app.searchWidget.on('select-result', function (event) {
  let res = event.result;
  app.searchGeometry = res.feature.geometry;
  myBuffer = drawCircleWithMeasurement(new Point(res.feature.geometry));
  $('#welcomePage').removeClass('open');
  track.start();
});


/*
const locate = new Locate({
  view: app.activeView,
  useHeadingEnabled: false,
  goToOverride: (view, options) => {
    options.target.scale = 1500;
    return view.goTo(options.target);
  }
});
app.activeView.ui.add(locate, 'top-left');
*/

const track = new Track({
  view: app.activeView,
  graphic: new Graphic({
    symbol: {
      type: 'simple-marker',
      size: '12px',
      color: 'green',
      outline: {
        color: '#efefef',
        width: '1.5px'
      }
    }
  }),
  useHeadingEnabled: false
});
app.activeView.ui.add(track, 'top-left');


track.on('track', function (trackEvent) {
  console.log(trackEvent);

  let gpsPoint = new Point({
    latitude: trackEvent.position.coords.latitude,
    longitude: trackEvent.position.coords.longitude
  });

  let isIntersect = geometryEngine.intersects(gpsPoint, myBuffer);


  /*
  let vertexResult = geometryEngine.nearestVertex(myBuffer, gpsPoint);
  let closestPoint = vertexResult.coordinate;
  */


  drawLine(gpsPoint, app.searchGeometry);
  //*** ADD ***//
  let distance = geometryEngine.geodesicLength(lineGraphic.geometry, 'meters');
  drawText(gpsPoint, distance);


  if (distance > app.maxAllowDistance && distance < app.maxAllowDistanceWarring) {
    $('#alertWarning').show();
  }
  else if (distance > app.maxAllowDistanceWarring) {
    $('#alertDanger').show();
  }
  else {
    $('#alertWarning').hide();
    $('#alertDanger').hide();
  }








  console.log('isIntersect', isIntersect);
});



function drawLine(point, point2) {
  app.activeView.graphics.remove(lineGraphic);
  lineGraphic = new Graphic({
    geometry: {
      type: 'polyline',
      paths: [
        [point.longitude, point.latitude],
        [point2.longitude, point2.latitude]
      ]
    },
    symbol: {
      type: 'simple-line',
      color: '#333',
      width: 1
    }
  });
  app.activeView.graphics.add(lineGraphic);
}



function drawText(point, distance) {
  app.activeView.graphics.remove(textGraphic);
  textGraphic = new Graphic({
    geometry: point,
    symbol: {
      type: 'text',
      text: distance.toFixed(2) + ' מטר',
      color: 'black',
      font: {
        size: 12
      },
      haloColor: 'white',
      haloSize: 1
    }
  });
  app.activeView.graphics.add(textGraphic);
}


function drawCircleWithMeasurement(point: any) {
  console.log('drawCircleWithMeasurement -> point', point);
  app.activeView.graphics.remove(bufferGraphic);

  let buffer = geometryEngine.geodesicBuffer(point, app.maxAllowDistance, 'meters');

  bufferGraphic = new Graphic({
    geometry: buffer,
    symbol: polySym
  });

  app.activeView.graphics.add(bufferGraphic);
  return buffer;
}


//$('#exampleModal').modal('show');

/*

var bufferGraphic;

    function drawBuffer(bufferGeometry) {
      view.graphics.remove(bufferGraphic);
      bufferGraphic = new Graphic({
        geometry: bufferGeometry,
        symbol: {
          type: "simple-fill",
          color: "rgba(0,0,0,0)",
          outline: {
            color: "rgba(0,0,0,.5)",
            width: 1
          }
        }
      });
      view.graphics.add(bufferGraphic);
    }
 */


window.myapp = app;
