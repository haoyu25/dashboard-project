import { initializeMap, initialMatrix } from './map.js';
import { initSelect } from './select.js';
import { initSearch } from './search.js';
import { initPieChart } from './pie.js';

const hz_matrix = await fetch('data/data.geojson');
const matrix = await hz_matrix.json();

const pieChart = initPieChart(matrix);

const hz_metro = await fetch("data/metrostation.geojson");
const metro = await hz_metro.json();

window.matrixMap = initializeMap(matrix);
window.initialMatrix = initialMatrix;

window.matrixMap.createPane('metroPane');
window.matrixMap.getPane('metroPane').style.zIndex = 650; 
window.matrixMap.getPane('metroPane').style.pointerEvents = 'auto';

window.metroLayer = L.geoJSON(metro, {
  pane: 'metroPane',
  pointToLayer: (feature, latlng) => L.circleMarker(latlng, { 
      radius: 3, fillColor: "blue", color: "#000", weight: 1, fillOpacity: 0.9 
  })
}).addTo(window.matrixMap);

initSearch();
initSelect();
