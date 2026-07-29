/**
 * =========================================================
 * FOOTPRINTS - 旅行票根档案交互脚本
 * 支持图片/视频混合展示 | 响应式布局 | 键盘导航
 * =========================================================
 * 
 * 目录:
 * 1. 资源配置区（IMG/VID）- 在此添加新的图片/视频 URL
 * 2. 票根数据配置（TICKETS）- 在此添加/修改票根信息
 * 3. 工具函数 - 坐标格式化等
 * 4. 票根网格渲染 - 动态生成票根墙
 * 5. 滚动入场动画 - IntersectionObserver 实现
 * 6. 放大查看器 - 支持图片/视频播放
 * 7. 移动端导航 - 抽屉式菜单
 * 8. 键盘快捷键支持
 * 
 * =========================================================
 */

(function() {
  'use strict';

  /* =====================================================================
     【配置区 1】图片资源 (IMG)
     说明：在此处添加新的图片 URL，然后在 TICKETS 数组中引用
     格式：key: 'URL'
     提示：可以使用本地路径或外部 CDN 链接
     ===================================================================== */
  const IMG = {
    // 示例图片资源 - 可替换为自己的图片
    KualaLumpur:    'https://img.yubaos.com/Gallery/20161004kl.webp',
    xiamen:    'https://img.yubaos.com/Gallery/20140410xm.webp',
    kyoto:     'https://image.qwenlm.ai/public_source/ad1849f7-810e-4742-98d1-aa785709bea4/14dc9e83f-de7f-4aec-9997-d29e554a3cde.png',
    fuji:     'https://image.qwenlm.ai/public_source/ad1849f7-810e-4742-98d1-aa785709bea4/14dc9e83f-de7f-4aec-9997-d29e554a3cde.png',
    shanghai: 'https://image.qwenlm.ai/public_source/ad1849f7-810e-4742-98d1-aa785709bea4/1ac501088-11d3-40be-8bc0-873924b0f1ba.png',
    bangkok:  'https://image.qwenlm.ai/public_source/ad1849f7-810e-4742-98d1-aa785709bea4/1ca9d2404-da75-4a51-9b7a-49446ac90d2e.png',
    hanoi:    'https://image.qwenlm.ai/public_source/ad1849f7-810e-4742-98d1-aa785709bea4/16cfa3b16-9280-4488-956e-5089d57c87f2.png',
    castle:   'https://image.qwenlm.ai/public_source/ad1849f7-810e-4742-98d1-aa785709bea4/1bb3debd7-77a6-47e6-98e8-c9fb004c708c.png'
    // 添加新图片示例:
    // paris:  'path/to/paris.jpg',
    // london: 'https://example.com/london.png'
  };

  /* =====================================================================
     【配置区 2】视频资源 (VID)
     说明：在此处添加新的视频 URL，然后在 TICKETS 数组中引用
     格式：key: 'URL'
     提示：支持 MP4、WebM 等格式，建议使用 CDN 加速
     ===================================================================== */
  const VID = {
    // 示例视频资源 - 可替换为自己的视频
    clipA: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    clipB: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    clipC: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    Langkawi: 'https://img.yubaos.com/video/Langkawi.mp4',
    // 添加新视频示例:
    // travelVlog: 'path/to/travel.mp4',
    // sunset: 'https://example.com/sunset.mp4'
  };

  /* =====================================================================
     【配置区 3】票根数据配置 (TICKETS)
     说明：在此处添加/修改票根信息，系统会自动渲染到票根墙
     
     字段说明:
     - id: 唯一标识符（建议从 1 开始递增）
     - display: 显示名称（英文大写，用于票根正面）
     - real: 真实地名（中文，用于详细信息）
     - date: 日期（格式：YYYY.MM.DD）
     - type: 媒体类型 ('image' 或 'video')
     - image: 图片 URL（type 为 'image' 时必填）
     - video: 视频 URL（type 为 'video' 时必填）
     - poster: 视频封面图（type 为 'video' 时必填，可复用 IMG 中的图片）
     - lat: 纬度（用于显示坐标）
     - lng: 经度（用于显示坐标）
     - note: 文字描述（在放大查看器中显示）
     
     如何添加新票根:
     1. 在 IMG 或 VID 中添加资源 URL
     2. 复制下面的对象模板
     3. 修改字段值
     4. 添加到数组中（位置决定显示顺序）
     ===================================================================== */
  const TICKETS = [
    // ========== 图片票根示例 ==========
     {
      id: 1,
      display: 'XIAMEN, FUJIAN',
      real: '鼓浪屿，厦门',
      date: '2014.04.10',
      type: 'image',
      image: IMG.xiamen,
      lat: 24.4450,
      lng: 118.0743,
      note: '鼓浪屿碧海青松，英雄永驻。'
    },
    {
      id: 2,
      display: 'Kuala Lumpur, Malaysia',       // 票根显示名称
      real: '吉隆坡，马来西亚',             // 真实地名
      date: '2016.10.03',            // 日期
      type: 'image',                 // 类型：图片
      image: IMG.KualaLumpur,              // 图片 URL
      lat: 3.1589,                  // 纬度
      lng: 101.7108,                 // 经度
      note: '拥抱双子塔的宏伟，定格异国旅途的偏爱。'  // 描述文字
    },
    {
      id: 3,
      display: 'Langkawi, Malaysia',
      real: '兰卡威，马来西亚',
      date: '2016.10.05',
      type: 'video',
      video: VID.Langkawi,
      poster: IMG.KualaLumpur,
      lat: 6.2620,
      lng: 99.7362,
      note: '碧海远山，云卷云舒，藏在兰卡威的夏天。'
    },
    
    // ========== 视频票根示例 ==========
    {
      id: 4,
      display: 'BANGKOK, THAILAND',
      real: '曼谷，泰国',
      date: '2023.10.20',
      type: 'video',                 // 类型：视频
      video: VID.clipA,              // 视频 URL
      poster: IMG.bangkok,           // 视频封面图
      lat: 13.7563,
      lng: 100.5018,
      note: '大皇宫的金顶在夕阳下近乎燃烧 —— 这段影像记录了铃铛与僧诵。'
    },
    {
      id: 5,
      display: 'HANOI, VIETNAM',
      real: '河内，越南',
      date: '2023.10.22',
      type: 'video',
      video: VID.clipB,
      poster: IMG.hanoi,
      lat: 21.0278,
      lng: 105.8342,
      note: '街角咖啡摊，滴漏咖啡一滴一滴落进炼乳里 —— 影像里能听见街声。'
    },
    
    // ========== 更多票根（可按需复制添加） ==========
    { id: 6,  display: 'KYOTO STREETS', real: '京都，日本', date: '2023.10.15', type: 'image', image: IMG.kyoto, lat: 35.0142, lng: 135.7795, note: '清晨无人的巷弄，木格窗后传出煮茶的声音。' },
    { id: 7,  display: 'TEMPLE GOLD',   real: '曼谷，泰国', date: '2023.10.20', type: 'image', image: IMG.bangkok, lat: 13.7501, lng: 100.4932, note: '寺庙回廊的浮雕，每一寸都贴了金箔。' },
    { id: 8,  display: 'HANOI MORNING', real: '河内，越南', date: '2023.10.22', type: 'image', image: IMG.hanoi, lat: 21.0341, lng: 105.8522, note: '三十六行街的清晨，摩托车流与叫卖声一同醒来。' },
    { id: 9,  display: 'HIMEJI CASTLE', real: '姬路，日本', date: '2023.10.17', type: 'image', image: IMG.castle, lat: 34.8394, lng: 134.6939, note: '白鹭城，樱花把整座天守阁框成一幅画。' },
    { id: 10, display: 'THE BUND',      real: '上海，中国', date: '2023.10.18', type: 'image', image: IMG.shanghai, lat: 31.2397, lng: 121.4995, note: '江风带着潮气，对岸的灯一盏接一盏点亮。' }
    // 添加新票根示例:
    // {
    //   id: 11,
    //   display: 'PARIS, FRANCE',
    //   real: '巴黎，法国',
    //   date: '2023.11.01',
    //   type: 'image',          // 或 'video'
    //   image: IMG.paris,       // 如果是视频，改为 video: VID.xxx 和 poster: IMG.xxx
    //   lat: 48.8566,
    //   lng: 2.3522,
    //   note: '埃菲尔铁塔下的浪漫黄昏。'
    // }
  ];

  /* =====================================================================
     工具函数：格式化经纬度坐标
     参数:
     - lat: 纬度
     - lng: 经度
     - wall: 是否用于票根墙显示（true 时精度为 2 位，false 为 4 位）
     返回：格式化后的坐标字符串，如 "N 35.00° / E 135.77°"
     ===================================================================== */
  function fmtCoord(lat, lng, wall) {
    const d = wall ? 2 : 4;               // 小数位数
    const ns = lat >= 0 ? 'N' : 'S';      // 南北半球
    const ew = lng >= 0 ? 'E' : 'W';      // 东西半球
    const sep = wall ? ' ' : ' / ';       // 分隔符
    return Math.abs(lat).toFixed(d) + '°' + ns + sep + Math.abs(lng).toFixed(d) + '°' + ew;
  }

  // SVG 播放图标（用于视频票根标识）
  const PLAY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

  /* =====================================================================
     生成票根缩略图 HTML
     根据票根类型（图片/视频）生成不同的 HTML 结构
     参数：t - 票根数据对象
     返回：HTML 字符串
     ===================================================================== */
  function mediaThumbHTML(t) {
    if (t.type === 'video') {
      // 视频票根：显示封面图 + 播放徽章
      const posterUrl = t.poster || '';
      return `<div class="t-photo">` +
             (posterUrl ? `<img src="${posterUrl}" alt="${t.display}" loading="lazy">` : '') +
             `<span class="play-badge" aria-hidden="true">${PLAY_SVG}</span>` +
             `</div>`;
    }
    // 图片票根：仅显示图片
    return `<div class="t-photo">` +
           `<img src="${t.image}" alt="${t.display}" loading="lazy">` +
           `</div>`;
  }

  /* =====================================================================
     获取票根网格容器
     ===================================================================== */
  const grid = document.getElementById('ticketGrid');

  /* =====================================================================
     生成微小旋转角度（让票根看起来更自然）
     使用预设序列循环，避免随机数的不确定性
     参数：i - 票根索引
     返回：旋转角度字符串，如 "-1.1deg"
     ===================================================================== */
  function tinyRotation(i) {
    const seq = [-1.1, 0.7, -0.5, 1.0, -0.8, 0.6, -1.0, 0.9, -0.6, 1.1, -0.9, 0.5, -0.7, 0.8, -1.0, 0.6, -0.5, 0.9, -0.8, 0.7, -0.6];
    return seq[i % seq.length] + 'deg';
  }

  /* =====================================================================
     构建票根网格
     遍历 TICKETS 数组，为每个票根创建 DOM 元素并添加到网格中
     ===================================================================== */
  function buildTickets() {
    grid.innerHTML = '';  // 清空现有内容
    
    TICKETS.forEach((t, i) => {
      // 创建票根外层容器
      const wrap = document.createElement('div');
      wrap.className = 'ticket-wrap';
      wrap.style.setProperty('--rot', tinyRotation(i));  // 设置随机旋转角度
      wrap.dataset.index = i;                             // 存储索引用于点击事件
      wrap.setAttribute('tabindex', '0');                 // 支持键盘聚焦
      wrap.setAttribute('role', 'button');                // 无障碍角色
      wrap.setAttribute('aria-label', '查看 ' + t.display + (t.type === 'video' ? '（视频）' : ''));
      
      // 生成票根内部 HTML
      wrap.innerHTML = `
        <article class="ticket">
          ${mediaThumbHTML(t)}
          <div class="t-info">
            <div class="t-loc">${t.display}</div>
            <div class="t-date">${t.date}</div>
            <div class="t-perf"></div>
            <div class="t-code">${fmtCoord(t.lat, t.lng, true)}</div>
          </div>
        </article>
      `;
      
      // 绑定点击事件 - 打开查看器
      wrap.addEventListener('click', () => openViewer(i));
      
      // 绑定键盘事件 - 支持 Enter 和空格键
      wrap.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openViewer(i);
        }
      });
      
      grid.appendChild(wrap);
    });
  }

  /* =====================================================================
     滚动入场动画
     使用 IntersectionObserver API 实现票根进入视口时的渐显效果
     ===================================================================== */
  function revealOnScroll() {
    const items = Array.from(document.querySelectorAll('.ticket-wrap'));
    
    // 降级处理：不支持 IntersectionObserver 时直接显示
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('in'));
      return;
    }
    
    // 创建观察者
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // 根据位置计算延迟，创造阶梯式入场效果
          const delay = (Array.from(grid.children).indexOf(el) % 7) * 70;
          setTimeout(() => el.classList.add('in'), delay);
          io.unobserve(el);  // 入场后停止观察
        }
      });
    }, { threshold: 0.12 });  // 12% 可见时触发
    
    // 开始观察所有票根
    items.forEach(el => io.observe(el));
  }

  /* =====================================================================
     放大查看器相关变量
     ===================================================================== */
  const overlay = document.getElementById('overlay');
  const vPhoto  = document.getElementById('vPhoto');
  const vLoc    = document.getElementById('vLoc');
  const vDate   = document.getElementById('vDate');
  const vNote   = document.getElementById('vNote');
  const vIdx    = document.getElementById('vIdx');
  const vCode   = document.getElementById('vCode');
  const vMedia  = document.getElementById('vMedia');
  let current = 0;  // 当前查看的票根索引

  /* =====================================================================
     清理视频资源
     关闭查看器或切换票根时调用，防止内存泄漏和声音残留
     ===================================================================== */
  function cleanupVideo() {
    // 清理 Video.js 播放器实例
    if (vPhoto._player) {
      try {
        vPhoto._player.dispose();
      } catch(_) {}
      vPhoto._player = null;
    }
    
    // 清理普通 video 元素（降级方案）
    const v = vPhoto.querySelector('video');
    if (v) {
      try {
        v.pause();
        v.removeAttribute('src');
        v.load();
      } catch(_) {}
    }
  }

  /* =====================================================================
     渲染完整媒体（图片/视频）
     在查看器中显示高清图片或可播放的视频
     参数：t - 票根数据对象
     ===================================================================== */
  function renderFullMedia(t) {
    cleanupVideo();  // 先清理之前的媒体

    if (t.type === 'video') {
      // 视频模式：使用 Video.js 播放器 + Canvas 自动截取第一帧作为封面
      const videoId = 'vjs-video-' + Date.now();
      vPhoto.innerHTML = `
        <video id="${videoId}" class="video-js vjs-default-skin vjs-big-play-centered" controls playsinline preload="metadata" crossorigin="anonymous">
          <source src="${t.video}" type="video/mp4">
        </video>
      `;

      // 初始化 Video.js 播放器
      const player = videojs(videoId, {
        fluid: true,
        responsive: true,
        autoplay: false,
        preload: 'metadata',
        controls: true,
        controlBar: {
          children: ['playToggle', 'volumePanel', 'currentTimeDisplay', 'timeDivider', 'durationDisplay', 'progressControl', 'remainingTimeDisplay', 'fullscreenToggle']
        }
      });

      // 监听 loadedmetadata 事件，使用 Canvas 截取第一帧作为封面
      player.ready(() => {
        const tech = player.tech({ IWillNotUseThisInPlugins: true });
        const videoEl = tech.el();

        videoEl.addEventListener('loadedmetadata', function() {
          // 创建 Canvas 元素
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // 设置 Canvas 尺寸为视频尺寸
          canvas.width = videoEl.videoWidth;
          canvas.height = videoEl.videoHeight;

          // 绘制视频第一帧
          ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

          // 将 Canvas 内容转换为 Data URL 并设置为 Video.js 的 poster
          try {
            const posterDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            player.poster(posterDataUrl);
          } catch (e) {
            console.warn('Canvas 截取封面失败:', e);
            // 降级处理：如果有 poster 配置则使用配置的 poster
            if (t.poster) {
              player.poster(t.poster);
            }
          }
        }, { once: true });

        // 如果视频加载失败或超时，使用配置的 poster 作为降级方案
        setTimeout(() => {
          if (!player.poster() && t.poster) {
            player.poster(t.poster);
          }
        }, 5000);
      });

      // 存储 player 引用以便清理
      vPhoto._player = player;

    } else {
      // 图片模式：直接显示高清图片
      vPhoto.innerHTML = `<img src="${t.image}" alt="${t.display}">`;
    }
  }

  /* =====================================================================
     填充查看器内容
     根据当前索引加载对应的票根数据并更新界面
     参数：i - 票根索引
     ===================================================================== */
  function fillViewer(i) {
    const t = TICKETS[i];
    
    // 淡出切换效果
    vPhoto.classList.add('swap');
    setTimeout(() => {
      renderFullMedia(t);
      vPhoto.classList.remove('swap');
    }, 180);
    
    // 更新文本信息
    vLoc.textContent  = t.display;
    vDate.textContent = t.date;
    vNote.textContent = t.note;
    vCode.textContent = fmtCoord(t.lat, t.lng, false);
    vIdx.textContent  = String(i + 1).padStart(2, '0') + ' / ' + String(TICKETS.length).padStart(2, '0');
    
    // 更新媒体类型标签
    if (t.type === 'video') {
      vMedia.hidden = false;
      vMedia.textContent = '▶ VIDEO';
    } else {
      vMedia.hidden = true;
    }
  }

  /* =====================================================================
     打开查看器
     参数：i - 要查看的票根索引
     ===================================================================== */
  function openViewer(i) {
    current = i;
    fillViewer(i);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';  // 禁止背景滚动
  }

  /* =====================================================================
     关闭查看器
     ===================================================================== */
  function closeViewer() {
    cleanupVideo();
    overlay.classList.remove('open');
    // 如果抽屉也开着，保持禁止滚动
    if (!drawer.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  /* =====================================================================
     切换票根（上一张/下一张）
     参数：dir - 方向，-1 为上一张，1 为下一张
     ===================================================================== */
  function step(dir) {
    current = (current + dir + TICKETS.length) % TICKETS.length;  // 循环切换
    fillViewer(current);
  }

  // 绑定查看器控制按钮事件
  document.getElementById('vClose').addEventListener('click', closeViewer);
  document.getElementById('vPrev').addEventListener('click', (e) => {
    e.stopPropagation();
    step(-1);
  });
  document.getElementById('vNext').addEventListener('click', (e) => {
    e.stopPropagation();
    step(1);
  });
  
  // 点击遮罩层关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeViewer();
  });

  /* =====================================================================
     移动端抽屉导航相关变量
     ===================================================================== */
  const menuBtn        = document.getElementById('menuBtn');
  const drawer         = document.getElementById('navDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');

  /* =====================================================================
     打开抽屉导航
     ===================================================================== */
  function openDrawer() {
    drawer.classList.add('open');
    drawerBackdrop.classList.add('open');
    menuBtn.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  /* =====================================================================
     关闭抽屉导航
     ===================================================================== */
  function closeDrawer() {
    drawer.classList.remove('open');
    drawerBackdrop.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    // 如果查看器没开，恢复滚动
    if (!overlay.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  /* =====================================================================
     切换抽屉状态
     ===================================================================== */
  function toggleDrawer() {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  }

  // 绑定抽屉控制事件
  menuBtn.addEventListener('click', toggleDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);
  // 点击菜单项自动关闭
  drawer.querySelectorAll('.drawer-list a').forEach(a => {
    a.addEventListener('click', closeDrawer);
  });

  // 监听屏幕尺寸变化，宽屏时自动关闭抽屉
  const MQ_WIDE = window.matchMedia('(min-width: 1100px)');
  (MQ_WIDE.addEventListener ? MQ_WIDE.addEventListener.bind(MQ_WIDE, 'change') : MQ_WIDE.addListener.bind(MQ_WIDE))((e) => {
    if (e.matches) closeDrawer();
  });

  /* =====================================================================
     键盘快捷键支持
     ESC: 关闭查看器/抽屉
     ←/→: 切换票根（仅在查看器开启时）
     ===================================================================== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (overlay.classList.contains('open')) {
        closeViewer();
      } else if (drawer.classList.contains('open')) {
        closeDrawer();
      }
      return;
    }
    
    // 查看器开启时才响应方向键
    if (!overlay.classList.contains('open')) return;
    
    if (e.key === 'ArrowLeft') {
      step(-1);
    } else if (e.key === 'ArrowRight') {
      step(1);
    }
  });

  /* =====================================================================
     主页链接保护
     本地 file 协议下阻止跳转，避免 404
     ===================================================================== */
  function guardHome(e) {
    if (location.protocol === 'file:') {
      e.preventDefault();
    }
  }
  
  document.getElementById('logo').addEventListener('click', guardHome);
  document.getElementById('drawerHome').addEventListener('click', (e) => {
    guardHome(e);
    closeDrawer();
  });

  /* =====================================================================
     初始化
     页面加载完成后执行
     ===================================================================== */
  buildTickets();      // 构建票根网格
  revealOnScroll();    // 启动滚动动画
})();
