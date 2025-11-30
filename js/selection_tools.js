export function initSelectionTools() {
    const countElement = document.getElementById('selected-count');
    const clearBtn = document.getElementById('clear-selection');
    const exportBtn = document.getElementById('export-selection');

    // 更新选中数量
    function updateCount() {
        if (!window.mapLayers) return;
        const count = window.mapLayers.selectedLayers.size;
        countElement.textContent = count;
        
        // 如果没有选中，禁用导出按钮
        exportBtn.disabled = count === 0;
    }

    // 清除所有选中
    clearBtn.addEventListener('click', () => {
        if (!window.mapLayers) return;
        
        window.mapLayers.selectedLayers.forEach(layer => {
            L.DomUtil.removeClass(layer._path, "hex-selected");
            layer.unbindTooltip();
        });
        window.mapLayers.selectedLayers.clear();
        
        // 同时清除 pie chart 的选中状态
        if (window.pieChartControls) {
            window.pieChartControls.clearSelection();
        }
        
        updateCount();
    });

    // 导出选中的 hexagons
    exportBtn.addEventListener('click', () => {
        if (!window.mapLayers || window.mapLayers.selectedLayers.size === 0) {
            alert('No hexagons selected!');
            return;
        }

        const features = [];
        
        window.mapLayers.selectedLayers.forEach(layer => {
            features.push(layer.feature);
        });

        const geojson = {
            type: "FeatureCollection",
            features: features
        };

        // 创建下载
        const dataStr = JSON.stringify(geojson, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `selected_hexagons_${new Date().toISOString().slice(0, 10)}.geojson`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    // 初始更新
    updateCount();

    // 暴露更新函数
    window.updateSelectionCount = updateCount;

    return { updateCount };
}