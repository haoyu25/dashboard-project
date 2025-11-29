// lang.js
export const translations = {
    en: {
        title: "Inundation Risk Index in Hangzhou Center Districts",
        zoomCategory: "Zoom into one category",
        matrix: "Matrix",
        impervious: "Impervious",
        inundation: "Inundation",
        reset: "Reset",
        imperviousThreshold: "Impervious Thresholds:",
        inundationThreshold: "Inundation Thresholds:",
        riskDistribution: "Risk Units Distribution",
        searchFilter: "Search & Filter",
        searchPlaceholder: "Search a station/school/hospital/market",
        selectStation: "--Select a station--",
        selectAmenity: "--Select an amenity--"
    },
    zh: {
        title: "杭州中心城区洪涝风险指数",
        zoomCategory: "聚焦某一类别",
        matrix: "矩阵",
        impervious: "不透水面",
        inundation: "淹没",
        reset: "重置",
        imperviousThreshold: "不透水面阈值：",
        inundationThreshold: "淹没阈值：",
        riskDistribution: "风险单元分布",
        searchFilter: "搜索与筛选",
        searchPlaceholder: "搜索地铁站/学校/医院/市场",
        selectStation: "--选择地铁站--",
        selectAmenity: "--选择设施--"
    }
};

let currentLang = 'en';

export function initLanguageToggle() {
    const toggleBtn = document.getElementById('lang-toggle');
    
    toggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'zh' : 'en';
        toggleBtn.textContent = currentLang === 'en' ? '中文' : 'English';
        updateLanguage();
    });
}

function updateLanguage() {
    const t = translations[currentLang];
    
    // 更新标题
    document.querySelector('h1').textContent = t.title;
    
    // 更新 labels
    const labels = document.querySelectorAll('label');
    labels[0].textContent = t.zoomCategory;
    labels[1].textContent = t.imperviousThreshold;
    labels[2].textContent = t.inundationThreshold;
    labels[3].textContent = t.riskDistribution;
    labels[4].textContent = t.searchFilter;
    
    // 更新按钮
    document.getElementById('setmatrix').textContent = t.matrix;
    document.getElementById('impervious').textContent = t.impervious;
    document.getElementById('inundation').textContent = t.inundation;
    document.getElementById('reset').textContent = t.reset;
    
    // 更新搜索框
    document.getElementById('entry').placeholder = t.searchPlaceholder;
    
    // 更新 select 默认选项
    document.querySelector('#select-station option[value=""]').textContent = t.selectStation;
    document.querySelector('#select-amenity option[value=""]').textContent = t.selectAmenity;
}

export function getCurrentLang() {
    return currentLang;
}