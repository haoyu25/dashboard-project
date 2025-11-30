import { calMatrix, calImpervious, calInundation } from './map_style.js';
import { onSliderChange } from './slider.js';
import { matrixLegend, imperviousLegend, inundationLegend } from './legend_style.js';

let initialMatrix, impervious, inundation;
let legend;
let currentLayer;

const sliderContainer = document.getElementById("slider-container");

// 统一使用全局 selectedLayers
const selectedLayers = window.mapLayers?.selectedLayers || new Set();

function initializeMap(matrix) {
  const map = L.map('map', {zoomSnap: 0}).setView([30.25, 120.15], 11);
  const baseTileLayer = L.tileLayer(
    'https://api.mapbox.com/styles/v1/junyiy/clng7r3oq083901qx0eu9gaor/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoianVueWl5IiwiYSI6ImNsdWVxcHowcDBxbWUyam92MWx5aW40MnkifQ.QR9kni83fZBO-EFBXAaX7g',
    {
      maxZoom: 19,
      zoomOffset: -1,
      tileSize: 512,
      attribution: `© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`,
    }
  );
  baseTileLayer.addTo(map);

  function hexTooltipContent(layer) {
    const imp = (layer.feature.properties.pct_2025 * 100).toFixed(2);
    const inu = layer.feature.properties.inund_mean.toFixed(2);
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
      if (!selectedLayers.has(layer)) L.DomUtil.addClass(layer._path, "hex-hover");
    });

    layer.on("mouseout", () => {
      if (!selectedLayers.has(layer)) L.DomUtil.removeClass(layer._path, "hex-hover");
    });

    layer.on("click", () => {
      if (selectedLayers.has(layer)) {
        selectedLayers.delete(layer);
        L.DomUtil.removeClass(layer._path, "hex-selected");
        layer.unbindTooltip();
      } else {
        selectedLayers.add(layer);
        L.DomUtil.addClass(layer._path, "hex-selected");
        layer.bindTooltip(hexTooltipContent(layer), { ...tooltipOptions, permanent: true }).openTooltip();
      }

      if (window.updateSelectionCount) window.updateSelectionCount();
    });
  }

  // 初始化各个图层
  initialMatrix = L.geoJSON(matrix, { style: calMatrix, onEachFeature: attachHexEvents }).addTo(map);
  impervious = L.geoJSON(matrix, { style: calImpervious, onEachFeature: attachHexEvents });
  inundation = L.geoJSON(matrix, { style: calInundation, onEachFeature: attachHexEvents });

  map.fitBounds(initialMatrix.getBounds());
  currentLayer = initialMatrix;

  // 保存全局对象
  window.mapLayers = {
    selectedLayers,
    currentLayer,
    map,
    hexTooltipContent,
    tooltipOptions
  };

  // 创建 legend
  legend = L.control({ position: 'bottomright' });
  legend.onAdd = () => (legend.div = L.DomUtil.create('div', 'legend-box'));
  legend.addTo(map);
  setLegend(matrixLegend);

  // slider change
  onSliderChange(() => {
    initialMatrix.eachLayer(layer => layer.setStyle(calMatrix(layer.feature)));
  });

  return map;
}

// 改变 legend
function setLegend(html) {
  if (legend?.div) legend.div.innerHTML = html;
}

// 图层切换或 reset 时清空选中
function clearSelection() {
  selectedLayers.forEach(layer => {
    L.DomUtil.removeClass(layer._path, "hex-selected");
    layer.unbindTooltip();
  });
  selectedLayers.clear();
  if (window.updateSelectionCount) window.updateSelectionCount();
}

// 图层切换事件
document.getElementById("matrix").addEventListener("click", () => {
  clearSelection();
  if (window.mapLayers?.currentLayer) window.mapLayers.currentLayer.remove();
  initialMatrix.addTo(window.mapLayers.map);
  sliderContainer.style.display = "block";
  setLegend(matrixLegend);
  currentLayer = initialMatrix;
  window.mapLayers.currentLayer = initialMatrix;
});

document.getElementById("impervious").addEventListener("click", () => {
  clearSelection();
  if (window.mapLayers?.currentLayer) window.mapLayers.currentLayer.remove();
  impervious.addTo(window.mapLayers.map);
  sliderContainer.style.display = "none";
  setLegend(imperviousLegend);
  currentLayer = impervious;
  window.mapLayers.currentLayer = impervious;
});

document.getElementById("inundation").addEventListener("click", () => {
  clearSelection();
  if (window.mapLayers?.currentLayer) window.mapLayers.currentLayer.remove();
  inundation.addTo(window.mapLayers.map);
  sliderContainer.style.display = "none";
  setLegend(inundationLegend);
  currentLayer = inundation;
  window.mapLayers.currentLayer = inundation;
});

export { initializeMap, initialMatrix, impervious, inundation };
