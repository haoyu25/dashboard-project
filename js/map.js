import { calMatrix, calImpervious, calInundation } from './map_style.js';
import { onSliderChange } from './slider.js';
import { matrixLegend, imperviousLegend, inundationLegend } from './legend_style.js';

let initialMatrix, map, impervious, inundation;
let legend;
let selectedLayers = new Set();
let currentLayer;

const sliderContainer = document.getElementById("slider-container");

function initializeMap(matrix) {
  map = L.map('map', {zoomSnap: 0}).setView([30.25, 120.15], 11);
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
    className: "hex-tooltip",
    permanent: false
  };

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
      
      // 更新选中计数
      if (window.updateSelectionCount) {
        window.updateSelectionCount();
      }
    });
  }

  initialMatrix = L.geoJSON(matrix, {
    style: calMatrix,
    onEachFeature: (feature, layer) => attachHexEvents(layer)
  }).addTo(map);

  impervious = L.geoJSON(matrix, {
    style: calImpervious,
    onEachFeature: (feature, layer) => attachHexEvents(layer)
  });

  inundation = L.geoJSON(matrix, {
    style: calInundation,
    onEachFeature: (feature, layer) => attachHexEvents(layer)
  });

  map.fitBounds(initialMatrix.getBounds());

  // 设置当前图层
  currentLayer = initialMatrix;

  // 创建全局访问对象，供 pie chart 使用
  window.mapLayers = {
    selectedLayers: selectedLayers,
    currentLayer: currentLayer,
    map: map,
    hexTooltipContent: hexTooltipContent,
    tooltipOptions: tooltipOptions
  };

  // 创建 legend
  legend = L.control({ position: 'bottomright' });
  legend.onAdd = function() {
    this.div = L.DomUtil.create('div', 'legend-box');
    return this.div;
  };
  legend.addTo(map);

  // 初始 legend
  setLegend(matrixLegend);

  // slider change
  onSliderChange(() => {
    initialMatrix.eachLayer((layer) => {
      layer.setStyle(calMatrix(layer.feature));
    });
  });

  return map;
}

// 改变 legend
function setLegend(html) {
  if (legend && legend.div) {
    legend.div.innerHTML = html;
  }
}

function resetLayers() {
  // 清除所有选中状态
  selectedLayers.forEach(layer => {
    L.DomUtil.removeClass(layer._path, "hex-selected");
    layer.unbindTooltip();
  });
  selectedLayers.clear();

  // 更新选中计数
  if (window.updateSelectionCount) {
    window.updateSelectionCount();
  }

  // 移除图层
  if (map.hasLayer(initialMatrix)) map.removeLayer(initialMatrix);
  if (map.hasLayer(impervious)) map.removeLayer(impervious);
  if (map.hasLayer(inundation)) map.removeLayer(inundation);
}

document.getElementById("matrix").addEventListener("click", () => {
  resetLayers();
  initialMatrix.addTo(map);
  sliderContainer.style.display = "block";
  setLegend(matrixLegend);
  currentLayer = initialMatrix;
  window.mapLayers.currentLayer = initialMatrix;
});

document.getElementById("impervious").addEventListener("click", () => {
  resetLayers();
  impervious.addTo(map);
  sliderContainer.style.display = "none";
  setLegend(imperviousLegend);
  currentLayer = impervious;
  window.mapLayers.currentLayer = impervious;
});

document.getElementById("inundation").addEventListener("click", () => {
  resetLayers();
  inundation.addTo(map);
  sliderContainer.style.display = "none";
  setLegend(inundationLegend);
  currentLayer = inundation;
  window.mapLayers.currentLayer = inundation;
});

export {
  initializeMap,
  initialMatrix,
  impervious,
  inundation
};