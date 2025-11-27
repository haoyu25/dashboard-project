import { initializeMap, initialMatrix } from './map.js';
import { initSelect } from './select.js';
import { initSearch } from './search.js';
import { initPieChart } from './pie.js';

const hz_matrix = await fetch('data/data.geojson');
const matrix = await hz_matrix.json();

const pieChart = initPieChart(matrix);

const hz_metro = await fetch("data/metrostation.geojson");
const metro = await hz_metro.json();

const hz_amenity = await fetch("data/amenity.geojson");
const amenity = await hz_amenity.json();

window.matrixMap = initializeMap(matrix);
window.initialMatrix = initialMatrix;

window.matrixMap.createPane('metroPane');
window.matrixMap.getPane('metroPane').style.zIndex = 650; 
window.matrixMap.getPane('metroPane').style.pointerEvents = 'auto';

window.metroIcon = L.icon({
    iconUrl: 'png/metrostationicon.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

window.metroIconHighlight = L.icon({
    iconUrl: 'png/metrostationicon_highlight.png', 
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

window.metroLayer = L.geoJSON(metro, {
    pane: 'metroPane',
    pointToLayer: (feature, latlng) =>
        L.marker(latlng, { icon: window.metroIcon })
});

const METRO_MIN_ZOOM = 12;

window.matrixMap.on('zoomend', () => {
    const z = window.matrixMap.getZoom();

    if (z >= METRO_MIN_ZOOM) {
        if (!window.matrixMap.hasLayer(window.metroLayer)) {
            window.matrixMap.addLayer(window.metroLayer);

            window.metroLayer.eachLayer(layer => {
                if (!layer._label) {
                    layer._label = L.tooltip({
                        permanent: false,
                        direction: 'top',
                        offset: [0, -10],
                        className: 'point-label'
                    })
                    .setContent(`
                        <div>
                            <strong>${layer.feature.properties.name}</strong><br>
                            ${layer.feature.properties.address || ''}
                        </div>
                    `)
                    .setLatLng(layer.getLatLng());

                    window.matrixMap.addLayer(layer._label);
                }
            });
        }
    } else {
        if (window.matrixMap.hasLayer(window.metroLayer)) {
            window.metroLayer.eachLayer(layer => {
                if (layer._label) {
                    window.matrixMap.removeLayer(layer._label);
                    layer._label = null;
                }
            });
            window.matrixMap.removeLayer(window.metroLayer);
        }
    }
});

window.amenityLayer = L.geoJSON(amenity, {
  pane: 'amenityPane',
  pointToLayer: (feature, latlng) => L.circleMarker(latlng, { 
      radius: 0, fillColor: "#ffffff", color: "#ffffff", weight: 0, fillOpacity: 0.9 
  })
});

initSearch();
initSelect();
