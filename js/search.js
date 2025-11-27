export function initSearch() {
    const input = document.getElementById('entry');
    const clearBtn = document.getElementById('clear-entry');
    const suggestionsDiv = document.getElementById('search-suggestions');

    if (!window.metroLayer) {
        console.error("metroLayer not initialized yet!");
        return;
    }

    // 收集所有有 name 属性的点
    const features = [];
    [window.metroLayer].forEach(layerGroup => {
        layerGroup.eachLayer(layer => {
            if (layer.feature && layer.feature.properties && layer.feature.properties.name) {
                features.push({ name: layer.feature.properties.name, layer });
            }
        });
    });

    // 按名字排序
    features.sort((a, b) => a.name.localeCompare(b.name));

    // 输入框监听
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

                // 1. zoom 到 marker
                window.matrixMap.setView(layer.getLatLng(), 14);

                // 2. 高亮 marker（换成高亮 PNG）
                layer.setIcon(window.metroIconHighlight);

                // 3. 显示名称 tooltip
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
                .setLatLng(layer.getLatLng());
                window.matrixMap.addLayer(layer._label);

                // 4. 更新输入框 & 清空建议
                input.value = f.name;
                suggestionsDiv.innerHTML = '';

                // 5. 其他 marker 恢复默认 icon 并移除 label
                [window.metroLayer].forEach(lg => {
                    lg.eachLayer(l => {
                        if (l !== layer) {
                            l.setIcon(window.metroIcon); // 普通 icon
                            if (l._label) {
                                window.matrixMap.removeLayer(l._label);
                                l._label = null;
                            }
                        }
                    });
                });
            });

            suggestionsDiv.appendChild(div);
        });
    });

    // 清空按钮
    clearBtn.addEventListener('click', () => {
        input.value = '';
        suggestionsDiv.innerHTML = '';
        [window.metroLayer].forEach(lg => {
            lg.eachLayer(l => {
                l.setIcon(window.metroIcon); // 恢复普通 icon
                if (l._label) {
                    window.matrixMap.removeLayer(l._label);
                    l._label = null;
                }
            });
        });
    });

    // 点击页面空白处关闭建议列表
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.innerHTML = '';
        }
    });
}
