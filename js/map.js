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

function hexTooltipContent(l) {
  const imp = (l.feature.properties.pct_2025 * 100).toFixed(2);
  const inu = l.feature.properties.inund_mean.toFixed(2);

  return `
    <div class="hex-tooltip">
      <strong>Imp </strong> ${imp}%<br>
      <strong>Inu </strong> ${inu}
    </div>
  `;
}

const tooltipOptions = {
  direction: "center", 
  offset: [0, 0],      
  opacity: 1,
  className: "my-tooltip",
  permanent: false
};

let selectedLayers = new Set();

function attachHexEvents(layer) {

  layer.unbindTooltip();
  
  layer.on("mouseover", () => {
    if (!selectedLayers.has(layer)) {
      L.DomUtil.addClass(layer._path, "hex-hover");
    }
  });
  
  layer.on("mouseout", () => {
    if (!selectedLayers.has(layer)) {
      L.DomUtil.removeClass(layer._path, "hex-hover");
    }
  });

  layer.on("click", () => {
    if (selectedLayers.has(layer)) {
      selectedLayers.delete(layer);
      L.DomUtil.removeClass(layer._path, "hex-selected");
      layer.unbindTooltip();
    } else {
      selectedLayers.add(layer);
      L.DomUtil.addClass(layer._path, "hex-selected");
      
      layer.bindTooltip(hexTooltipContent(layer), {
        ...tooltipOptions,
        permanent: true 
      }).openTooltip();
    }
  });
}

initialMatrix = L.geoJSON(matrix, {
  style: calMatrix,
  onEachFeature: (feature, layer) => attachHexEvents(layer)
})
.addTo(map);

impervious = L.geoJSON(matrix, {
  style: calImpervious,
  onEachFeature: (feature, layer) => attachHexEvents(layer)
})

inundation = L.geoJSON(matrix, {
  style: calInundation,
  onEachFeature: (feature, layer) => attachHexEvents(layer)
})

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

document.getElementById("matrix").addEventListener("click", () => {
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