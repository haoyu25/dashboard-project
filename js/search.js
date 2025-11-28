export function initSearch() {
    const input = document.getElementById('entry');
    const clearBtn = document.getElementById('clear-entry');
    const suggestionsDiv = document.getElementById('search-suggestions');

    if (!window.metroLayer || !window.amenityLayer) {
        console.error("Layers not initialized yet!");
        return;
    }

    // --------------------------------
    // 1. 生成搜索数据
    // --------------------------------
    const features = [];

    function collectFeatures(layerGroup, type) {
        layerGroup.eachLayer(layer => {
            const props = layer.feature?.properties;
            if (props?.name) {
                features.push({
                    name: props.name,
                    category: props.category || null,
                    type,
                    layer
                });
            }
        });
    }

    collectFeatures(window.metroLayer, "metro");
    collectFeatures(window.amenityLayer, "amenity");

    features.sort((a, b) => a.name.localeCompare(b.name));

    // --------------------------------
    // 2. 输入监听
    // --------------------------------
    input.addEventListener('input', () => {
        const text = input.value.trim().toLowerCase();
        suggestionsDiv.innerHTML = '';
        suggestionsDiv.style.display = text ? 'block' : 'none';
        if (!text) return;

        const matches = features.filter(f =>
            f.name.toLowerCase().includes(text)
        );

        matches.forEach(f => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = f.name;
            div.addEventListener('click', () => handleSelect(f));
            suggestionsDiv.appendChild(div);
        });
    });

    // --------------------------------
    // 3. 选择搜索结果
    // --------------------------------
    function handleSelect(f) {
        const layer = f.layer;
        const latlng = layer.getLatLng();

        // 移动地图
        window.matrixMap.setView(latlng, 13);

        // 重置所有 icon & 隐藏所有 amenity
        resetAllIcons();

        if (f.type === "metro") {
            layer.setIcon(window.metroIconHighlight);
        } else if (f.type === "amenity") {
            const cat = f.category;
            const highlightIcon =
                window.amenityIconsHighlight?.[cat] || window.defaultAmenityIconHighlight;
            layer.setIcon(highlightIcon);

            // 只显示选中的 amenity
            if (!window.matrixMap.hasLayer(layer)) {
                window.matrixMap.addLayer(layer);
            }
        }

        // tooltip label
        if (layer._label) {
            window.matrixMap.removeLayer(layer._label);
        }
        layer._label = L.tooltip({
            permanent: true,
            direction: 'top',
            offset: [0, -10],
            className: 'point-label'
        })
        .setContent(f.name)
        .setLatLng(latlng);
        window.matrixMap.addLayer(layer._label);

        // 输入框填入内容 & 清空建议
        input.value = f.name;
        suggestionsDiv.innerHTML = '';
        suggestionsDiv.style.display = 'none';
    }

    // --------------------------------
    // 4. reset all icons & 隐藏所有 amenity
    // --------------------------------
    function resetAllIcons() {
        // metro
        window.metroLayer.eachLayer(l => {
            if (l.setIcon) l.setIcon(window.metroIcon);
            if (l._label) {
                window.matrixMap.removeLayer(l._label);
                l._label = null;
            }
        });

        // amenity 默认隐藏
        window.amenityLayer.eachLayer(l => {
            if (window.matrixMap.hasLayer(l)) {
                window.matrixMap.removeLayer(l);
            }
            const cat = l.feature?.properties?.category;
            const icon = window.amenityIcons?.[cat] || window.defaultAmenityIcon;
            if (l.setIcon) l.setIcon(icon);
            if (l._label) {
                window.matrixMap.removeLayer(l._label);
                l._label = null;
            }
        });
    }

    // --------------------------------
    // 5. 清空按钮
    // --------------------------------
    clearBtn.addEventListener('click', () => {
        input.value = '';
        suggestionsDiv.innerHTML = '';
        suggestionsDiv.style.display = 'none';
        resetAllIcons();
    });

    // --------------------------------
    // 6. 点击空白隐藏建议
    // --------------------------------
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.innerHTML = '';
            suggestionsDiv.style.display = 'none';
        }
    });
}
