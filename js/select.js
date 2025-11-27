// select.js
export function initSelect() {
    const searchSelect = document.getElementById('select');

    const features = [];
    window.metroLayer.eachLayer(layer => {
        if (layer.feature.properties.name) {
            features.push({ name: layer.feature.properties.name, layer: layer });
        }
    });

    features.sort((a,b) => a.name.localeCompare(b.name));

    searchSelect.innerHTML = '<option value="">--Select a feature--</option>';

    features.forEach(f => {
        const option = document.createElement('option');
        option.value = f.name;
        option.textContent = f.name;
        searchSelect.appendChild(option);
    });

    searchSelect.featureMap = {};
    features.forEach(f => searchSelect.featureMap[f.name] = f.layer);

    searchSelect.addEventListener('change', () => {
        const selected = searchSelect.value;
        if (!selected) return;

        const layer = searchSelect.featureMap[selected];
        window.matrixMap.setView(layer.getLatLng(), 16);
        layer.setStyle({ fillOpacity: 1 });

        window.metroLayer.eachLayer(l => { if(l !== layer) l.setStyle({ fillOpacity: 0.8 }); });
    });
}
