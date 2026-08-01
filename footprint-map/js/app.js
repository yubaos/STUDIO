/**
 * =========================================================
 * FOOTPRINT MAP - 足迹地图核心逻辑
 * Leaflet 地图初始化 | GeoJSON 加载 | Marker 渲染 | 弹窗交互
 * =========================================================
 */

(function() {
  'use strict';

  // =========================================================
  // 配置与全局变量
  // =========================================================
  let map = null;
  let markers = [];
  let geoJsonLayer = null;
  let modalOverlay = null;
  let instaxCard = null;

  // 默认地图中心（中国）
  const DEFAULT_CENTER = [35.8617, 104.1954];
  const DEFAULT_ZOOM = 4;

  // =========================================================
  // 工具函数：格式化经纬度坐标
  // =========================================================
  function fmtCoord(lat, lng) {
    const ns = lat >= 0 ? 'N' : 'S';
    const ew = lng >= 0 ? 'E' : 'W';
    return Math.abs(lat).toFixed(4) + '°' + ns + ' / ' + Math.abs(lng).toFixed(4) + '°' + ew;
  }

  // =========================================================
  // 创建自定义蓝色标记点图标
  // =========================================================
  function createBlueDotIcon() {
    return L.divIcon({
      className: 'blue-dot-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -12]
    });
  }

  // =========================================================
  // 打开照片弹窗 Modal
  // =========================================================
  function openModal(data) {
    if (!modalOverlay) return;

    // 填充数据
    document.getElementById('modalImage').src = data.image || '';
    document.getElementById('modalImage').alt = data.display || '';
    document.getElementById('modalTitle').textContent = data.display || '';
    document.getElementById('modalDate').textContent = data.date || '';
    document.getElementById('modalNote').textContent = data.note || '';

    // 显示弹窗
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // =========================================================
  // 关闭照片弹窗 Modal
  // =========================================================
  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // =========================================================
  // 初始化地图
  // =========================================================
  function initMap() {
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) return;

    // 创建地图实例
    map = L.map('mapContainer', {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true
    });

    // 添加底图图层（使用 CartoDB Positron 轻量风格）
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      minZoom: 2
    }).addTo(map);

    // 加载足迹数据
    loadFootprintData();
  }

  // =========================================================
  // 加载足迹数据（从 data.json）
  // =========================================================
  function loadFootprintData() {
    fetch('data/data.json')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load data.json');
        return response.json();
      })
      .then(data => {
        renderFootprints(data);
      })
      .catch(error => {
        console.error('Error loading footprint data:', error);
        // 如果加载失败，使用示例数据
        renderFootprints(getSampleData());
      });
  }

  // =========================================================
  // 渲染足迹数据（标记点 + GeoJSON 区域）
  // =========================================================
  function renderFootprints(data) {
    const locations = data.locations || [];
    const regions = data.regions || [];

    // 1. 渲染蓝色标记点
    locations.forEach((loc, index) => {
      if (!loc.lat || !loc.lng) return;

      // 创建自定义蓝色标记点
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createBlueDotIcon()
      });

      // 绑定点击事件 - 打开照片弹窗并缩放地图
      marker.on('click', () => {
        // 平滑缩放到标记点位置
        map.flyTo([loc.lat, loc.lng], 10, {
          duration: 1.5,
          easeLinearity: 0.25
        });

        // 打开照片弹窗
        openModal(loc);
      });

      marker.addTo(map);
      markers.push(marker);
    });

    // 2. 渲染 GeoJSON 区域高亮
    if (regions.length > 0) {
      geoJsonLayer = L.geoJSON(
        { type: 'FeatureCollection', features: regions },
        {
          style: function(feature) {
            return {
              fillColor: feature.properties?.fillColor || '#3b82f6',
              weight: 2,
              opacity: 0.8,
              color: feature.properties?.strokeColor || '#3b82f6',
              fillOpacity: 0.3
            };
          },
          onEachFeature: function(feature, layer) {
            // 鼠标悬停效果
            layer.on({
              mouseover: function(e) {
                const l = e.target;
                l.setStyle({
                  weight: 3,
                  fillOpacity: 0.5
                });
              },
              mouseout: function(e) {
                geoJsonLayer.resetStyle(e.target);
              }
            });

            // 点击区域时弹出信息
            if (feature.properties && feature.properties.name) {
              layer.bindPopup('<strong>' + feature.properties.name + '</strong>');
            }
          }
        }
      ).addTo(map);
    }

    // 3. 如果有标记点，自动缩放到适合的范围
    if (markers.length > 0) {
      const group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds(), {
        padding: [50, 50],
        maxZoom: 10
      });
    }
  }

  // =========================================================
  // 示例数据（当 data.json 加载失败时使用）
  // =========================================================
  function getSampleData() {
    return {
      "title": "我的旅行足迹",
      "description": "记录每一次旅行的美好瞬间",
      "locations": [
        {
          "id": 1,
          "display": "鼓浪屿，厦门",
          "date": "2014.04.10",
          "image": "https://img.yubaos.com/xiamen.webp",
          "lat": 24.4450,
          "lng": 118.0743,
          "note": "鼓浪屿碧海青松，英雄永驻。"
        },
        {
          "id": 2,
          "display": "吉隆坡，马来西亚",
          "date": "2016.10.03",
          "image": "https://img.yubaos.com/kualalumpur.webp",
          "lat": 3.1589,
          "lng": 101.7108,
          "note": "拥抱双子塔的宏伟，定格异国旅途的偏爱。"
        },
        {
          "id": 3,
          "display": "兰卡威，马来西亚",
          "date": "2016.10.05",
          "image": "https://img.yubaos.com/langkawi.webp",
          "lat": 6.2620,
          "lng": 99.7362,
          "note": "碧海远山，云卷云舒，藏在兰卡威的夏天。"
        },
        {
          "id": 4,
          "display": "普吉岛，泰国",
          "date": "2016.10.08",
          "image": "https://img.yubaos.com/phuket.webp",
          "lat": 7.8632,
          "lng": 98.3995,
          "note": "普吉岛九皇斋节，信徒穿刺显虔诚。"
        },
        {
          "id": 5,
          "display": "曼谷，泰国",
          "date": "2016.10.11",
          "image": "https://img.yubaos.com/bangkok.webp",
          "lat": 13.7501,
          "lng": 100.4920,
          "note": "金顶巍峨，皇家风范，游客如织。"
        },
        {
          "id": 6,
          "display": "广州，中国",
          "date": "2017.10.19",
          "image": "https://img.yubaos.com/zhujiang.webp",
          "lat": 23.1291,
          "lng": 113.2644,
          "note": "碧水蓝天映衬，珠江两岸摩天大楼林立，繁华都市气象万千。"
        },
        {
          "id": 7,
          "display": "香港，中国",
          "date": "2018.09.05",
          "image": "https://img.yubaos.com/hongkong.webp",
          "lat": 22.2930,
          "lng": 114.1706,
          "note": "维港波光粼粼，摩天大楼依山而建，尽显东方之珠的繁华。"
        },
        {
          "id": 8,
          "display": "北京，中国",
          "date": "2019.07.03",
          "image": "https://img.yubaos.com/beijing.webp",
          "lat": 39.9063,
          "lng": 116.3912,
          "note": "雄伟天安门前留影，定格首都日光下的庄严与青春。"
        },
        {
          "id": 9,
          "display": "姬路，日本",
          "date": "2023.10.17",
          "image": "https://img.yubaos.com/castle.webp",
          "lat": 34.8394,
          "lng": 134.6939,
          "note": "白鹭城，樱花把整座天守阁框成一幅画。"
        },
        {
          "id": 10,
          "display": "上海，中国",
          "date": "2023.10.18",
          "image": "https://img.yubaos.com/shanghai.webp",
          "lat": 31.2397,
          "lng": 121.4995,
          "note": "江风带着潮气，对岸的灯一盏接一盏点亮。"
        }
      ],
      "regions": []
    };
  }

  // =========================================================
  // 初始化移动端抽屉导航（与 ticket-stub 页面一致）
  // =========================================================
  function initDrawer() {
    const menuBtn = document.getElementById('menuBtn');
    const drawer = document.getElementById('navDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');

    if (!menuBtn || !drawer || !drawerBackdrop) return;

    function openDrawer() {
      drawer.classList.add('open');
      drawerBackdrop.classList.add('open');
      menuBtn.classList.add('open');
      menuBtn.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      drawerBackdrop.classList.remove('open');
      menuBtn.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      if (!modalOverlay || !modalOverlay.classList.contains('open')) {
        document.body.style.overflow = '';
      }
    }

    function toggleDrawer() {
      drawer.classList.contains('open') ? closeDrawer() : openDrawer();
    }

    menuBtn.addEventListener('click', toggleDrawer);
    drawerBackdrop.addEventListener('click', closeDrawer);

    // 点击菜单项自动关闭
    drawer.querySelectorAll('.drawer-list a').forEach(a => {
      a.addEventListener('click', closeDrawer);
    });

    // 监听屏幕尺寸变化，宽屏时自动关闭抽屉
    const MQ_WIDE = window.matchMedia('(min-width: 1100px)');
    if (MQ_WIDE.addEventListener) {
      MQ_WIDE.addEventListener('change', (e) => {
        if (e.matches) closeDrawer();
      });
    } else {
      MQ_WIDE.addListener((e) => {
        if (e.matches) closeDrawer();
      });
    }
  }

  // =========================================================
  // 主页链接保护（本地 file 协议下阻止跳转）
  // =========================================================
  function guardHomeLinks() {
    const logo = document.getElementById('logo');
    const drawerHome = document.getElementById('drawerHome');

    function guardHome(e) {
      if (location.protocol === 'file:') {
        e.preventDefault();
      }
    }

    if (logo) logo.addEventListener('click', guardHome);
    if (drawerHome) drawerHome.addEventListener('click', (e) => {
      guardHome(e);
      // 关闭抽屉
      const drawer = document.getElementById('navDrawer');
      if (drawer) drawer.classList.remove('open');
    });
  }

  // =========================================================
  // 初始化
  // =========================================================
  function init() {
    // 获取 DOM 元素
    modalOverlay = document.getElementById('modalOverlay');
    instaxCard = document.getElementById('instaxCard');

    // 绑定弹窗关闭事件
    if (modalOverlay) {
      // 点击关闭按钮
      document.getElementById('modalClose')?.addEventListener('click', closeModal);

      // 点击遮罩层关闭
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });

      // ESC 键关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
          closeModal();
        }
      });
    }

    // 初始化抽屉导航
    initDrawer();

    // 保护主页链接
    guardHomeLinks();

    // 初始化地图
    initMap();
  }

  // 页面加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
