const impSlider = document.getElementById('imp-slider');
const inuSlider = document.getElementById('inu-slider');

noUiSlider.create(impSlider, {
    start: [0.4, 0.8],  
    connect: true,     
    range: {min: 0,max: 1},
    tooltips: [true, true], 
    format: {
        to: v => v.toFixed(2),
        from: v => parseFloat(v)
    }
});

noUiSlider.create(inuSlider, {
    start: [0.5, 3],    
    connect: true,
    step: 0.5,
    range: {min: 0,max: 5},
    tooltips: [true, true],
    format: {
        to: v => v.toFixed(1),
        from: v => parseFloat(v)
    }
});

export function getImpThresholds() {
    const values = impSlider.noUiSlider.get();
    return {
        impMid: Number(values[0]),
        impHigh: Number(values[1])
    };
}

export function getInuThresholds() {
    const values = inuSlider.noUiSlider.get();
    return {
        inuMid: Number(values[0]),
        inuHigh: Number(values[1])
    };
}

export function onSliderChange(callback) {
    impSlider.noUiSlider.on('update', callback);
    inuSlider.noUiSlider.on('update', callback);
}
