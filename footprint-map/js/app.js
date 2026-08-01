/**
 * =========================================================
 * Footprint Map - 个人旅行足迹地图
 * 核心逻辑：地图初始化、GeoJSON 加载、Marker 渲染及弹窗交互
 * =========================================================
 */

(function() {
    'use strict';

    // ==================== 配置常量 ====================
    const CONFIG = {
        // 默认地图中心（可调整）
        defaultCenter: [37.8651, -119.5383],
        defaultZoom: 6,
        minZoom: 3,
        maxZoom: 18,
        // 数据文件路径
        dataPath: 'data/data.json',
        // 动画持续时间 (ms)
        flyDuration: 1.5
    };

    // ==================== 全局变量 ====================
    let map = null;
    let markersLayer = null;
    let geoJsonLayer = null;
    let footprintData = null;

    // ==================== 工具函数 ====================
    
    /**
     * 创建自定义蓝色圆点标记图标
     * @returns {L.DivIcon} Leaflet DivIcon 实例
     */
    function createBlueDotIcon() {
        return L.divIcon({
            className: 'blue-dot-marker',
            html: '<div class="blue-dot"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
        });
    }

    /**
     * 平滑飞行动画到指定坐标
     * @param {number} lat - 纬度
     * @param {number} lng - 经度
     * @param {number} zoom - 缩放级别
     */
    function flyToLocation(lat, lng, zoom = 12) {
        if (map) {
            map.flyTo([lat, lng], zoom, {
                duration: CONFIG.flyDuration,
                easeLinearity: 0.25
            });
        }
    }

    /**
     * 打开照片弹窗 Modal
     * @param {Object} markerData - 标记点数据
     */
    function openModal(markerData) {
        const modal = document.getElementById('photoModal');
        const img = document.getElementById('modalImage');
        const name = document.getElementById('modalName');
        const location = document.getElementById('modalLocation');
        const date = document.getElementById('modalDate');
        const description = document.getElementById('modalDescription');

        // 填充数据
        img.src = markerData.photo;
        img.alt = markerData.name;
        name.textContent = markerData.name;
        location.textContent = markerData.location;
        date.textContent = formatDate(markerData.date);
        description.textContent = markerData.description;

        // 显示弹窗
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * 关闭照片弹窗 Modal
     */
    function closeModal() {
        const modal = document.getElementById('photoModal');
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // 清空图片防止闪烁
        setTimeout(() => {
            document.getElementById('modalImage').src = '';
        }, 300);
    }

    /**
     * 格式化日期显示
     * @param {string} dateStr - 日期字符串 (YYYY-MM-DD)
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

    // ==================== 地图初始化 ====================
    
    /**
     * 初始化 Leaflet 地图
     */
    function initMap() {
        // 创建地图实例
        map = L.map('map', {
            center: CONFIG.defaultCenter,
            zoom: CONFIG.defaultZoom,
            minZoom: CONFIG.minZoom,
            maxZoom: CONFIG.maxZoom,
            zoomControl: true,
            attributionControl: true
        });

        // 添加底图图层 (使用 CartoDB Positron 轻量风格)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20,
            maxNativeZoom: 18
        }).addTo(map);

        // 创建标记图层组
        markersLayer = L.layerGroup().addTo(map);
        
        // 创建 GeoJSON 图层组
        geoJsonLayer = L.layerGroup().addTo(map);

        console.log('Map initialized successfully');
    }

    // ==================== 数据加载与渲染 ====================
    
    /**
     * 加载足迹数据
     */
    async function loadFootprintData() {
        try {
            const response = await fetch(CONFIG.dataPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            footprintData = await response.json();
            console.log('Footprint data loaded:', footprintData);
            
            // 渲染数据
            renderRegions(footprintData.regions || []);
            renderMarkers(footprintData.markers || []);
            
        } catch (error) {
            console.error('Error loading footprint data:', error);
            // 显示错误提示
            showError('无法加载足迹数据，请检查 data.json 文件是否存在且格式正确。');
        }
    }

    /**
     * 渲染高亮区域 (GeoJSON)
     * @param {Array} regions - 区域数据数组
     */
    function renderRegions(regions) {
        if (!regions.length) return;

        regions.forEach(region => {
            const style = region.style || {
                color: '#3498db',
                fillColor: '#3498db',
                fillOpacity: 0.4,
                weight: 2
            };

            const geoJsonLayer = L.geoJSON(region.geometry, {
                style: style,
                onEachFeature: function(feature, layer) {
                    // 添加区域点击事件
                    layer.on('click', function(e) {
                        L.DomEvent.stopPropagation(e);
                        // 飞到区域中心
                        const bounds = layer.getBounds();
                        map.fitBounds(bounds, {
                            padding: [50, 50],
                            maxZoom: 10
                        });
                    });

                    // 添加悬停效果
                    layer.on('mouseover', function() {
                        this.setStyle({
                            fillOpacity: 0.6,
                            weight: 3
                        });
                    });

                    layer.on('mouseout', function() {
                        this.setStyle(style);
                    });

                    // 绑定提示
                    if (region.name) {
                        layer.bindTooltip(region.name, {
                            sticky: true,
                            direction: 'center'
                        });
                    }
                }
            }).addTo(geoJsonLayer);
        });

        console.log(`Rendered ${regions.length} regions`);
    }

    /**
     * 渲染打卡标记点
     * @param {Array} markers - 标记点数据数组
     */
    function renderMarkers(markers) {
        if (!markers.length) return;

        markers.forEach(marker => {
            // 创建自定义蓝色圆点标记
            const blueDotIcon = createBlueDotIcon();
            
            const markerInstance = L.marker([marker.lat, marker.lng], {
                icon: blueDotIcon
            }).addTo(markersLayer);

            // 添加点击事件
            markerInstance.on('click', function(e) {
                L.DomEvent.stopPropagation(e);
                
                // 平滑飞到标记位置并放大
                flyToLocation(marker.lat, marker.lng, 13);
                
                // 延迟打开弹窗（等待动画完成一部分）
                setTimeout(() => {
                    openModal(marker);
                }, 800);
            });

            // 添加悬停提示
            markerInstance.bindTooltip(marker.name, {
                direction: 'top',
                offset: [0, -10]
            });
        });

        console.log(`Rendered ${markers.length} markers`);
    }

    /**
     * 显示错误信息
     * @param {string} message - 错误消息
     */
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #e74c3c;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(errorDiv);
        
        // 5 秒后自动移除
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // ==================== 事件绑定 ====================
    
    /**
     * 绑定弹窗相关事件
     */
    function bindModalEvents() {
        const modal = document.getElementById('photoModal');
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay') || modal;

        // 关闭按钮点击
        closeBtn.addEventListener('click', closeModal);

        // 点击遮罩层关闭
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // ESC 键关闭
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    /**
     * 绑定地图点击事件（关闭可能打开的 popup）
     */
    function bindMapEvents() {
        map.on('click', function() {
            // 可以在这里添加地图点击的通用处理
        });
    }

    // ==================== 初始化入口 ====================
    
    /**
     * 应用初始化
     */
    function init() {
        console.log('Footprint Map initializing...');
        
        // 等待 DOM 加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start);
        } else {
            start();
        }

        function start() {
            // 1. 初始化地图
            initMap();
            
            // 2. 绑定弹窗事件
            bindModalEvents();
            
            // 3. 绑定地图事件
            bindMapEvents();
            
            // 4. 加载足迹数据
            loadFootprintData();
            
            console.log('Footprint Map initialized successfully');
        }
    }

    // 启动应用
    init();

})();
