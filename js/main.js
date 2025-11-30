import { initializeMap } from './map.js';
import { stationSelect, amenitySelect } from './select.js';
import { initSearch } from './search.js';
import { initPieChart } from './pie.js';
import { impSlider, inuSlider } from './slider.js';
import { resetManager } from './reset.js';
import { initLanguageToggle } from './lang.js';
import { initSelectionTools } from './selection_tools.js';

export async function initApp(resetLeftSide = false) {
    // ----------- 全局变量初始化 -----------
    window.mapLayers = window.mapLayers || {};
    window.mapLayers.selectedLayers = window.mapLayers.selectedLayers || new Set();

    // 全局计数更新函数
    window.updateSelectionCount = () => {
        const countEl = document.getElementById('selected-count');
        if (!countEl) return;
        const size = window.mapLayers.selectedLayers.size || 0;
        countEl.textContent = size;
    };

    // ----------- 读取数据 -----------
    const hz_matrix = await fetch('data/data.geojson');
    const matrix = await hz_matrix.json();

    const hz_metro = await fetch("data/metrostation.geojson");
    const metro = await hz_metro.json();

    const hz_amenity = await fetch("data/amenity.geojson");
    const amenity = await hz_amenity.json();

    // ----------- 初始化地图 -----------
    if (window.matrixMap) window.matrixMap.remove();
    window.matrixMap = initializeMap(matrix);
    window.initialMatrix = window.initialMatrix || matrix;

    const createPane = (name, zIndex) => {
        window.matrixMap.createPane(name);
        const pane = window.matrixMap.getPane(name);
        pane.style.zIndex = zIndex;
        pane.style.pointerEvents = 'auto';
    };
    createPane('metroPane', 650);
    createPane('amenityPane', 640);

    // ----------- 地铁图标 -----------
    window.metroIcon = L.icon({ iconUrl: 'png/metrostationicon.png', iconSize: [10,10], iconAnchor: [5,5] });
    window.metroIconHighlight = L.icon({ iconUrl: 'png/metrostationicon_highlight.png', iconSize: [30,30], iconAnchor: [15,15] });

    // ----------- 公共设施图标 -----------
    window.amenityIcons = {
        school: L.icon({ iconUrl: "png/school.png", iconSize: [10,10], iconAnchor: [5,5] }),
        hospital: L.icon({ iconUrl: "png/hospital.png", iconSize: [10,10], iconAnchor: [5,5] }),
        market: L.icon({ iconUrl: "png/market.png", iconSize: [10,10], iconAnchor: [5,5] }),
    };
    window.amenityIconsHighlight = {
        school: L.icon({ iconUrl: "png/school_hl.png", iconSize: [30,30], iconAnchor: [15,15] }),
        hospital: L.icon({ iconUrl: "png/hospital_hl.png", iconSize: [30,30], iconAnchor: [15,15] }),
        market: L.icon({ iconUrl: "png/market_hl.png", iconSize: [30,30], iconAnchor: [15,15] }),
    };
    window.defaultAmenityIcon = L.icon({ iconUrl: "png/market.png", iconSize: [10,10], iconAnchor: [5,5] });
    window.defaultAmenityIconHighlight = L.icon({ iconUrl: "png/market_hl.png", iconSize: [30,30], iconAnchor: [15,15] });

    // ----------- 地铁图层 -----------
    window.metroLayer = L.geoJSON(metro, {
        pane: 'metroPane',
        pointToLayer: (feature, latlng) => {
            const marker = L.marker(latlng, { icon: window.metroIcon });
            const name = feature.properties.name || '';
            const address = feature.properties.address || '';
            const labelHtml = `<div style="text-align:center;"><strong>${name}</strong><br>${address}</div>`;

            marker.tooltipShown = false;
            marker.isClicking = false;

            marker.on('mouseover', () => {
                if (marker.isClicking) return;
                if (!marker.tooltipShown) {
                    marker.bindTooltip(labelHtml, {
                        permanent: true,
                        direction: 'top',
                        className: 'metro-label',
                        opacity: 0.9
                    }).openTooltip();
                    marker.tooltipShown = true;
                }
            });
            marker.on('click', () => {
                marker.isClicking = true;
                if (marker.getTooltip()) {
                    marker.unbindTooltip();
                    marker.tooltipShown = false;
                }
                setTimeout(() => marker.isClicking = false, 100);
            });
            return marker;
        }
    });

    // ----------- 公共设施图层 -----------
    window.amenityLayer = L.geoJSON(amenity, {
        pane: 'amenityPane',
        pointToLayer: (feature, latlng) => {
            const cat = feature.properties.category;
            const icon = window.amenityIcons[cat] || window.defaultAmenityIcon;
            return L.marker(latlng, { icon });
        }
    });

    // ----------- 地铁图层按缩放显示 -----------
    window.matrixMap.on('zoomend', () => {
        const z = window.matrixMap.getZoom();
        if (z >= 12) {
            if (!window.matrixMap.hasLayer(window.metroLayer)) window.matrixMap.addLayer(window.metroLayer);
        } else {
            if (window.matrixMap.hasLayer(window.metroLayer)) window.matrixMap.removeLayer(window.metroLayer);
        }
    });

    // ----------- 初始化 Pie Chart -----------
    if (window.pieChart) window.pieChart.destroy();
    window.pieChart = initPieChart(matrix);
    window.updateSelectionCount(); // 初始化选中计数

    // ----------- 初始化搜索和选择控件 -----------
    initSearch();
    stationSelect();
    amenitySelect();

    // ----------- 重置左侧面板 -----------
    if (resetLeftSide) {
        resetManager.resetLeftSide();
    }
}

// ----------- 初始化语言切换和应用 -----------
initLanguageToggle();
await initApp(true);

// ----------- Reset 按钮 -----------
document.getElementById("reset").addEventListener("click", async () => {
    await initApp(true);
});

// ----------- 初始化 selection tools -----------
initSelectionTools();
