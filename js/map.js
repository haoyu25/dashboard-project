import { calMatrix, calImpervious, calInundation } from './map_style.js';
import { onSliderChange } from './slider.js';
import { matrixLegend, imperviousLegend, inundationLegend } from './legend_style.js';

let initialMatrix,map,impervious,inundation;
let legend;

const sliderContainer = document.getElementById("slider-container");

function initializeMap(matrix) { // remember to input all the layers specify below
  map = L.map('map', {zoomSnap: 0}).setView([30.25, 120.15], 11); // zoomSnap 0 make the zoom level to real number
  const baseTileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/junyiy/clng7r3oq083901qx0eu9gaor/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoianVueWl5IiwiYSI6ImNsdWVxcHowcDBxbWUyam92MWx5aW40MnkifQ.QR9kni83fZBO-EFBXAaX7g', {
    maxZoom: 19,
    zoomOffset: -1,
    tileSize: 512,
    attribution: `© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>`,
  });
  baseTileLayer.addTo(map);

  // initial matrix layer
  initialMatrix = L.geoJSON(matrix,
    {style: calMatrix,
    }).bindTooltip((l) => {
    return `
    <p class="popbind">
      <strong>Impervious Percentage:</strong> ${(l.feature.properties.pct_2025 * 100).toFixed(2)}%<br>
  <strong>Inundation:</strong> ${l.feature.properties.inund_mean.toFixed(2)}
    </p>`;
  }).addTo(map);

  //change to impervious layer;
  impervious = L.geoJSON(matrix, 
    {style: calImpervious,
    }).bindTooltip((l) => {
    return `
    <p class="popbind">
      <strong>Impervious Percentage:</strong> ${(l.feature.properties.pct_2025 * 100).toFixed(2)}%<br>
  <strong>Inundation:</strong> ${l.feature.properties.inund_mean.toFixed(2)}
    </p>`;
  });
  //change to inundation layer;
  inundation = L.geoJSON(matrix, 
    {style: calInundation,
    }).bindTooltip((l) => {
    return `
    <p class="popbind">
      <strong>Impervious Percentage:</strong> ${(l.feature.properties.pct_2025 * 100).toFixed(2)}%<br>
  <strong>Inundation:</strong> ${l.feature.properties.inund_mean.toFixed(2)}
    </p>`;
  });

  map.fitBounds(initialMatrix.getBounds());

  //create legend
  legend = L.control({ position: 'bottomright' });
  //create legend context  
  legend.onAdd = function() {
        this.div = L.DomUtil.create('div', 'legend-box');
        return this.div;
    };
  legend.addTo(map);

    // initail legend
  setLegend(matrixLegend);

  // slider change
  onSliderChange(() => {
        initialMatrix.eachLayer((layer) => {
            layer.setStyle(calMatrix(layer.feature));
        });
    });

  return map;
}
//change legend
function setLegend(html) {
  if (legend && legend.div) {
    legend.div.innerHTML = html;
  }
}

function resetLayers() {
  map.removeLayer(initialMatrix);
  map.removeLayer(impervious);
  map.removeLayer(inundation);
}

document.getElementById("setmatrix").addEventListener("click", () => {
  resetLayers();
  initialMatrix.addTo(map);
  sliderContainer.style.display = "block";
  setLegend(matrixLegend);
});
document.getElementById("impervious").addEventListener("click", () => {
  resetLayers();
  impervious.addTo(map);
  sliderContainer.style.display = "none";
  setLegend(imperviousLegend);
});
document.getElementById("inundation").addEventListener("click", () => {
  resetLayers();
  inundation.addTo(map);
  sliderContainer.style.display = "none";
  setLegend(inundationLegend);
});

export {
  initializeMap,
  initialMatrix,
  impervious,
  inundation
};