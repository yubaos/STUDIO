/**
 * =========================================================
 * 个人旅行足迹地图 - 核心逻辑
 * My Travel Footprint Map - Main Application Logic
 * =========================================================
 * 
 * 功能模块:
 * 1. 地图初始化
 * 2. GeoJSON 区域加载与高亮
 * 3. 蓝色打卡点标记渲染
 * 4. 弹窗交互（照片、景点信息）
 * 5. 点击平滑缩放定位
 * =========================================================
 */

(function() {
    'use strict';

    // ==================== 配置常量 ====================
    const CONFIG = {
        // 地图初始中心坐标 [纬度，经度]
        defaultCenter: [35.8617, 104.1954],
        // 地图初始缩放级别
        defaultZoom: 4,
        // 标记点飞行动画持续时间 (毫秒)
        flyDuration: 1.5,
        // 标记点飞行动画缩放级别
        flyZoom: 10,
        // 自定义蓝色标记点样式
        markerColor: '#2563eb',
        markerRadius: 8,
        markerBorderWidth: 2,
        markerBorderColor: '#ffffff'
    };

    // ==================== 全局变量 ====================
    let map = null;           // Leaflet 地图实例
    let markersLayer = null;  // 标记点图层组
    let regionsLayer = null;  // 区域高亮图层组
    let footprintData = null; // 足迹数据

    // ==================== 工具函数 ====================
    
    /**
     * 格式化日期显示
     * @param {string} dateStr - ISO 格式日期字符串
     * @returns {string} 格式化后的日期
     */
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }

    /**
     * 创建自定义蓝色圆形标记图标
     * @returns {L.DivIcon} Leaflet DivIcon 实例
     */
    function createBlueDotIcon() {
        const svgIcon = `
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="${CONFIG.markerRadius}" 
                        fill="${CONFIG.markerColor}" 
                        stroke="${CONFIG.markerBorderColor}" 
                        stroke-width="${CONFIG.markerBorderWidth}"/>
                <circle cx="12" cy="12" r="4" fill="#ffffff" opacity="0.6"/>
            </svg>
        `;
        
        return L.divIcon({
            html: svgIcon,
            className: 'blue-dot-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -15]
        });
    }

    /**
     * 构建弹窗内容 HTML
     * @param {Object} marker - 标记点数据
     * @returns {string} HTML 字符串
     */
    function buildPopupContent(marker) {
        const { name, location, date, photo, description } = marker;
        
        return `
            <div class="popup-content">
                <div class="popup-image-wrapper">
                    <img src="${photo}" alt="${name}" class="popup-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22300%22 height=%22200%22/%3E%3Ctext fill=%22%239ca3af%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3E图片加载失败%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="popup-info">
                    <h3 class="popup-title">${name}</h3>
                    <p class="popup-location">📍 ${location || ''}</p>
                    <p class="popup-date">📅 ${formatDate(date)}</p>
                    <p class="popup-description">${description || ''}</p>
                </div>
            </div>
        `;
    }

    // ==================== 地图核心功能 ====================

    /**
     * 初始化地图
     */
    function initMap() {
        // 创建地图实例
        map = L.map('map', {
            center: CONFIG.defaultCenter,
            zoom: CONFIG.defaultZoom,
            zoomControl: true,
            attributionControl: true
        });

        // 添加底图图层 (使用 CartoDB Positron 浅色底图)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // 初始化图层组
        markersLayer = L.layerGroup().addTo(map);
        regionsLayer = L.layerGroup().addTo(map);
    }

    /**
     * 加载并渲染区域高亮 (GeoJSON)
     * @param {Array} regions - 区域数据数组
     */
    function renderRegions(regions) {
        if (!regions || regions.length === 0) return;

        regions.forEach(region => {
            if (!region.geojson) return;

            const geoJsonLayer = L.geoJSON(region.geojson, {
                style: {
                    color: '#2563eb',        // 边框颜色
                    weight: 2,               // 边框宽度
                    opacity: 0.8,            // 边框透明度
                    fillColor: '#3b82f6',    // 填充颜色
                    fillOpacity: 0.3         // 填充透明度
                },
                onEachFeature: (feature, layer) => {
                    // 添加点击事件
                    layer.on('click', () => {
                        // 获取区域边界并缩放到合适视图
                        const bounds = layer.getBounds();
                        map.flyToBounds(bounds, {
                            duration: CONFIG.flyDuration,
                            padding: [50, 50]
                        });
                        
                        // 可选：显示区域信息弹窗
                        if (region.name) {
                            layer.bindPopup(`
                                <div class="region-popup">
                                    <h4>${region.name}</h4>
                                    <p>${region.note || ''}</p>
                                    <p class="visit-date">访问时间：${formatDate(region.visitDate)}</p>
                                </div>
                            `).openPopup();
                        }
                    });

                    // 鼠标悬停效果
                    layer.on('mouseover', () => {
                        layer.setStyle({
                            fillOpacity: 0.5,
                            weight: 3
                        });
                    });

                    layer.on('mouseout', () => {
                        layer.setStyle({
                            fillOpacity: 0.3,
                            weight: 2
                        });
                    });
                }
            }).addTo(regionsLayer);
        });
    }

    /**
     * 加载并渲染打卡点标记
     * @param {Array} markers - 标记点数据数组
     */
    function renderMarkers(markers) {
        if (!markers || markers.length === 0) return;

        const blueDotIcon = createBlueDotIcon();

        markers.forEach(marker => {
            if (typeof marker.lat !== 'number' || typeof marker.lng !== 'number') {
                console.warn('无效的标记点坐标:', marker);
                return;
            }

            // 创建标记点
            const markerInstance = L.marker([marker.lat, marker.lng], {
                icon: blueDotIcon
            }).addTo(markersLayer);

            // 绑定弹窗
            const popupContent = buildPopupContent(marker);
            markerInstance.bindPopup(popupContent, {
                maxWidth: 320,
                minWidth: 280,
                className: 'footprint-popup'
            });

            // 点击标记点时平滑缩放
            markerInstance.on('click', () => {
                map.flyTo([marker.lat, marker.lng], CONFIG.flyZoom, {
                    duration: CONFIG.flyDuration,
                    animate: true
                });
            });
        });
    }

    /**
     * 加载足迹数据
     */
    async function loadFootprintData() {
        try {
            const response = await fetch('data/data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            footprintData = await response.json();
            
            // 渲染区域和标记点
            if (footprintData.regions) {
                renderRegions(footprintData.regions);
            }
            if (footprintData.markers) {
                renderMarkers(footprintData.markers);
            }
            
            console.log('足迹数据加载成功:', footprintData);
        } catch (error) {
            console.error('加载足迹数据失败:', error);
            // 显示错误提示
            showError('加载足迹数据失败，请检查 data.json 文件是否存在且格式正确。');
        }
    }

    /**
     * 显示错误提示
     * @param {string} message - 错误信息
     */
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-toast';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // ==================== 初始化入口 ====================

    /**
     * 应用初始化
     */
    function init() {
        // 等待 DOM 加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onDOMReady);
        } else {
            onDOMReady();
        }
    }

    /**
     * DOM 就绪回调
     */
    function onDOMReady() {
        console.log('DOM 已就绪，初始化足迹地图...');
        
        // 初始化地图
        initMap();
        
        // 加载足迹数据
        loadFootprintData();
        
        console.log('足迹地图初始化完成！');
    }

    // 启动应用
    init();

})();
