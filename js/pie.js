import { getImpThresholds, getInuThresholds, onSliderChange } from './slider.js';

let pieChart;

export function initPieChart(matrix) {
    const Chart = window.Chart;
    
    if (!Chart) {
        console.error('Chart.js is not loaded');
        return null;
    }

    const ctx = document.getElementById('riskPieChart')?.getContext('2d');
    if (!ctx) {
        console.error('Canvas element not found');
        return null;
    }

    const data = computeDistribution(matrix);

    const colorMap = {
        'Low Impervious - Low Inundation': '#4575b4',
        'Low Impervious - Medium Inundation': '#91bfdb',
        'Low Impervious - High Inundation': '#e0f3f8',
        'Medium Impervious - Low Inundation': '#fee090',
        'Medium Impervious - Medium Inundation': '#fc8d59',
        'Medium Impervious - High Inundation': '#d73027',
        'High Impervious - Low Inundation': '#fdae61',
        'High Impervious - Medium Inundation': '#f46d43',
        'High Impervious - High Inundation': '#a50026',
    };

    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = labels.map(label => colorMap[label] || '#cccccc');

    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Risk Units',
                data: values,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { 
                    display: false 
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a,b)=>a+b,0);
                            const value = context.raw;
                            const percentage = ((value/total)*100).toFixed(1);
                            return `${value} (${percentage}%)`;
                        }
                    }
                },
                datalabels: {
                    color: '#ffffffff',
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    anchor: 'end',    
                    align: 'end',   
                    offset: 0,      
                    formatter: (value, context) => {
                        return value;   
                    }
                }
            }, 
            radius: '80%' 
        },
        plugins: [ChartDataLabels]  
    });

    onSliderChange(() => updatePieChart(matrix));

    return pieChart;
}

function computeDistribution(matrix) {
    const { impMid, impHigh } = getImpThresholds();
    const { inuMid, inuHigh } = getInuThresholds();

    const counts = {};

    matrix.features.forEach(f => {
        const pct = f.properties.pct_2025;
        const inund = f.properties.inund_mean;

        let imperv = 'Low';
        if (pct > impHigh) {
            imperv = 'High';
        } else if (pct > impMid) {
            imperv = 'Medium';
        }

        let inun = 'Low';
        if (inund > inuHigh) {
            inun = 'High';
        } else if (inund > inuMid) {
            inun = 'Medium';
        }

        const riskMatrix = `${imperv} Impervious - ${inun} Inundation`;
        counts[riskMatrix] = (counts[riskMatrix] || 0) + 1;
    });

    return counts;
}

function updatePieChart(matrix) {
    if (!pieChart) return;

    const data = computeDistribution(matrix);
    
    const colorMap = {
        'Low Impervious - Low Inundation': '#4575b4',
        'Low Impervious - Medium Inundation': '#91bfdb',
        'Low Impervious - High Inundation': '#e0f3f8',
        'Medium Impervious - Low Inundation': '#fee090',
        'Medium Impervious - Medium Inundation': '#fc8d59',
        'Medium Impervious - High Inundation': '#d73027',
        'High Impervious - Low Inundation': '#fdae61',
        'High Impervious - Medium Inundation': '#f46d43',
        'High Impervious - High Inundation': '#a50026',
    };

    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = labels.map(label => colorMap[label] || '#cccccc');

    pieChart.data.labels = labels;
    pieChart.data.datasets[0].data = values;
    pieChart.data.datasets[0].backgroundColor = colors;
    pieChart.update();
}