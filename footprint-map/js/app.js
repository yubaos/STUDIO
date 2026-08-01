/**
 * =========================================================
 * 个人旅行足迹地图 - 核心逻辑
 * My Travel Footprint Map - App Logic
 * =========================================================
 * 
 * 功能:
 * 1. 初始化 Leaflet 地图
 * 2. 加载 GeoJSON 区域数据并高亮显示
 * 3. 渲染蓝色打卡标记点
 * 4. 处理点击交互（平滑缩放、弹窗预览）
 * 5. 响应式设计适配
 * 
 * =========================================================
 */

(function() {
    'use strict';

    // ==================== 配置常量 ====================
    const CONFIG = {
        // 地图初始中心点 [纬度，经度] 和缩放级别
        initialView: [35.8617, 104.1954], // 中国中心
        initialZoom: 4,
        
        // 地图最小/最大缩放级别
        minZoom: 2,
        maxZoom: 18,
        
        // 标记点点击后的目标缩放级别
        markerZoomLevel: 12,
        
        // 动画持续时间 (毫秒)
        flyToDuration: 1.5,
        
        // 数据文件路径
        dataPath: 'data/data.json'
    };

    // ==================== 全局变量 ====================
    let map = null;
    let markersLayer = null;
    let regionsLayer = null;
    let footprintData = null;

    // ==================== DOM 元素 ====================
    const modal = {
        overlay: document.getElementById('photoModal'),
        image: document.getElementById('modalImage'),
        title: document.getElementById('modalTitle'),
        date: document.getElementById('modalDate'),
        desc: document.getElementById('modalDesc'),
        closeBtn: document.getElementById('modalClose')
    };

    // ==================== 工具函数 ====================
    
    /**
     * 创建自定义蓝色标记点图标
     * @returns {L.DivIcon} Leaflet 自定义图标
     */
    function createBlueMarkerIcon() {
        return L.divIcon({
            className: 'blue-marker',
            html: `
                <div class="marker-dot">
                    <span class="marker-pulse"></span>
                </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
        });
    }

    /**
     * 平滑飞行到指定坐标
     * @param {number} lat - 纬度
     * @param {number} lng - 经度
     * @param {number} zoom - 缩放级别
     */
    function flyToLocation(lat, lng, zoom) {
        map.flyTo([lat, lng], zoom, {
            duration: CONFIG.flyToDuration,
            easeLinearity: 0.25
        });
    }

    /**
     * 打开照片弹窗
     * @param {Object} data - 标记点数据
     */
    function openModal(data) {
        modal.image.src = data.photo;
        modal.image.alt = data.name;
        modal.title.textContent = data.name;
        modal.date.textContent = data.date;
        modal.desc.textContent = data.description;
        
        modal.overlay.setAttribute('aria-hidden', 'false');
        modal.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * 关闭照片弹窗
     */
    function closeModal() {
        modal.overlay.setAttribute('aria-hidden', 'true');
        modal.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ==================== 地图初始化 ====================
    
    /**
     * 初始化 Leaflet 地图
     */
    function initMap() {
        // 创建地图实例
        map = L.map('map', {
            center: CONFIG.initialView,
            zoom: CONFIG.initialZoom,
            minZoom: CONFIG.minZoom,
            maxZoom: CONFIG.maxZoom,
            zoomControl: false, // 稍后添加到右下角
            attributionControl: true
        });

        // 添加缩放控制到右下角
        L.control.zoom({
            position: 'bottomright'
        }).addTo(map);

        // 添加底图图层 (使用 CartoDB Positron 浅色主题)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // 创建标记点图层组
        markersLayer = L.layerGroup().addTo(map);
        
        // 创建区域图层组
        regionsLayer = L.layerGroup().addTo(map);

        return map;
    }

    // ==================== 数据加载与渲染 ====================
    
    /**
     * 加载足迹数据
     * @returns {Promise<Object>} 足迹数据对象
     */
    async function loadFootprintData() {
        try {
            const response = await fetch(CONFIG.dataPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('加载足迹数据失败:', error);
            // 返回默认数据作为降级方案
            return {
                regions: [],
                markers: []
            };
        }
    }

    /**
     * 渲染高亮区域 (GeoJSON)
     * @param {Array} regions - 区域数据数组
     */
    async function renderRegions(regions) {
        if (!regions || regions.length === 0) return;

        for (const region of regions) {
            try {
                // 加载 GeoJSON 数据
                const response = await fetch(region.geoJsonUrl);
                if (!response.ok) {
                    console.warn(`无法加载区域 ${region.name} 的 GeoJSON 数据`);
                    continue;
                }
                
                const geoJsonData = await response.json();
                
                // 创建 GeoJSON 图层，使用更醒目的样式
                const layer = L.geoJSON(geoJsonData, {
                    style: {
                        color: region.style.color || '#3b82f6',
                        weight: region.style.weight || 2,
                        opacity: 1,
                        fillColor: region.style.fillColor || '#3b82f6',
                        fillOpacity: region.style.fillOpacity || 0.4
                    },
                    onEachFeature: function(feature, layer) {
                        // 添加鼠标悬停效果
                        layer.on({
                            mouseover: function(e) {
                                const targetLayer = e.target;
                                targetLayer.setStyle({
                                    fillOpacity: 0.7,
                                    weight: 3,
                                    color: '#2563eb'
                                });
                            },
                            mouseout: function(e) {
                                const targetLayer = e.target;
                                targetLayer.setStyle({
                                    fillOpacity: region.style.fillOpacity || 0.4,
                                    weight: region.style.weight || 2,
                                    color: region.style.color || '#3b82f6'
                                });
                            }
                        });
                        
                        // 添加点击事件
                        layer.on('click', function(e) {
                            // 获取区域中心点并飞过去
                            const center = e.target.getBounds().getCenter();
                            flyToLocation(center.lat, center.lng, 8);
                        });
                    }
                }).addTo(regionsLayer);
                
            } catch (error) {
                console.error(`加载区域 ${region.name} 失败:`, error);
            }
        }
    }

    /**
     * 渲染打卡标记点
     * @param {Array} markers - 标记点数据数组
     */
    function renderMarkers(markers) {
        if (!markers || markers.length === 0) return;

        markers.forEach(markerData => {
            // 创建自定义蓝色标记点
            const marker = L.marker([markerData.lat, markerData.lng], {
                icon: createBlueMarkerIcon()
            }).addTo(markersLayer);

            // 添加点击事件
            marker.on('click', function() {
                // 平滑缩放到标记点位置
                flyToLocation(markerData.lat, markerData.lng, CONFIG.markerZoomLevel);
                
                // 延迟打开弹窗（等待缩放动画完成一部分）
                setTimeout(() => {
                    openModal(markerData);
                }, 500);
            });

            // 添加简单的 tooltip
            marker.bindTooltip(markerData.name, {
                permanent: false,
                direction: 'top',
                offset: [0, -10],
                className: 'marker-tooltip'
            });
        });
    }

    // ==================== 事件绑定 ====================
    
    /**
     * 绑定弹窗相关事件
     */
    function bindModalEvents() {
        // 关闭按钮点击
        modal.closeBtn.addEventListener('click', closeModal);
        
        // 点击遮罩层关闭
        modal.overlay.addEventListener('click', function(e) {
            if (e.target === modal.overlay) {
                closeModal();
            }
        });
        
        // ESC 键关闭
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.overlay.classList.contains('active')) {
                closeModal();
            }
        });
    }

    /**
     * 处理窗口大小变化（响应式）
     */
    function handleResize() {
        if (map) {
            map.invalidateSize();
        }
    }

    // ==================== 初始化执行 ====================
    
    /**
     * 主初始化函数
     */
    async function init() {
        console.log('正在初始化足迹地图...');
        
        // 1. 初始化地图
        initMap();
        
        // 2. 绑定弹窗事件
        bindModalEvents();
        
        // 3. 监听窗口大小变化
        window.addEventListener('resize', handleResize);
        
        // 4. 加载并渲染数据
        try {
            footprintData = await loadFootprintData();
            
            // 渲染区域
            await renderRegions(footprintData.regions);
            
            // 渲染标记点
            renderMarkers(footprintData.markers);
            
            console.log('足迹地图初始化完成！');
            console.log(`已加载 ${footprintData.regions.length} 个区域，${footprintData.markers.length} 个标记点`);
            
        } catch (error) {
            console.error('初始化过程中出错:', error);
        }
    }

    // DOM 加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
