const coordinates = listing.geometry.coordinates;

// Convert longitude-latitude to map projection
const center = ol.proj.fromLonLat(coordinates);

const map = new ol.Map({
  target: "map",
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(), // Simple OpenStreetMap
    }),
  ],
  view: new ol.View({
    center: center,
    zoom: 10,
  }),
});

// Marker
const marker = new ol.Feature({
  geometry: new ol.geom.Point(center),
});

const vectorSource = new ol.source.Vector({
  features: [marker],
});

const markerLayer = new ol.layer.Vector({
  source: vectorSource,
});

map.addLayer(markerLayer);