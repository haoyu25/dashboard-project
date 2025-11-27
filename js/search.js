export function initSearch() {
    const input = document.getElementById('entry');
    const clearBtn = document.getElementById('clear-entry');
    const suggestionsDiv = document.getElementById('search-suggestions');

    if (!window.metroLayer) {
        console.error("metroLayer not initialized yet!");
        return;
    }

    const features = [];
    [window.metroLayer].forEach(layerGroup => {
        layerGroup.eachLayer(layer => {
            if (layer.feature && layer.feature.properties && layer.feature.properties.name) {
                features.push({ name: layer.feature.properties.name, layer });
            }
        });
    });

    features.sort((a,b) => a.name.localeCompare(b.name));

    input.addEventListener('input', () => {
        const text = input.value.trim().toLowerCase();
        suggestionsDiv.innerHTML = '';

        if (!text) return;

        const matches = features.filter(f => f.name.toLowerCase().includes(text));
        matches.forEach(f => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = f.name;

            div.addEventListener('click', () => {
                const layer = f.layer;

                if (layer.getBounds) { 
                    window.matrixMap.fitBounds(layer.getBounds());
                    layer.setStyle({ fillOpacity: 0.9 });
                } else if (layer.getLatLng) {
                    window.matrixMap.setView(layer.getLatLng(), 16);
                    layer.setStyle({ fillOpacity: 1 });
                }

                input.value = f.name;
                suggestionsDiv.innerHTML = '';

                [window.metroLayer].forEach(lg => {
                    lg.eachLayer(l => {
                        if (l !== layer) l.setStyle({ fillOpacity: 0.8 });
                    });
                });
            });

            suggestionsDiv.appendChild(div);
        });
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        suggestionsDiv.innerHTML = '';
        [window.metroLayer].forEach(lg => {
            lg.eachLayer(l => l.setStyle({ fillOpacity: 0.8 }));
        });
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.innerHTML = '';
        }
    });
}
