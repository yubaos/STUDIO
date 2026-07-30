/**
 * =========================================================
 * TIME MACHINE - 时光机交互脚本
 * 宫格翻转放大 | 图片查看器 | 响应式布局
 * =========================================================
 */

(function() {
  'use strict';

  /* =====================================================================
     【配置区】图片资源与数据配置 - 汉字标题（毛笔字风格）
     ===================================================================== */
  const IMAGES = [
    { id: 1, title: '忆往昔', date: '2024.01.15', image: 'https://img.yubaos.com/Gallery/20161004kl.webp', note: '第一段珍贵回忆，定格在那个冬天。' },
    { id: 2, title: '春日暖', date: '2024.02.20', image: 'https://img.yubaos.com/Gallery/20140410xm.webp', note: '春日暖阳下的美好时光。' },
    { id: 3, title: '珠江风', date: '2024.03.10', image: 'https://img.yubaos.com/Gallery/zhujiang.webp', note: '珠江边的晚风，吹散了所有烦恼。' },
    { id: 4, title: '普吉岛', date: '2024.04.05', image: 'https://img.yubaos.com/Gallery/Phuket.webp', note: '普吉岛的碧海蓝天，令人心旷神怡。' },
    { id: 5, title: '维港夜', date: '2024.05.18', image: 'https://img.yubaos.com/Gallery/hongkong.webp', note: '维多利亚港的夜景，璀璨夺目。' },
    { id: 6, title: '曼谷街', date: '2024.06.22', image: 'https://img.yubaos.com/Gallery/Bangkok.webp', note: '曼谷的街头，充满了异国情调。' },
    { id: 7, title: '北京夏', date: '2024.07.30', image: 'https://img.yubaos.com/Gallery/beijing.webp', note: '北京的夏天，热烈而充满活力。' },
    { id: 8, title: '古城堡', date: '2024.08.14', image: 'https://image.qwenlm.ai/public_source/ad1849f7-810e-4742-98d1-aa785709bea4/1bb3debd7-77a6-47e6-98e8-c9fb004c708c.png', note: '古城堡的黄昏，神秘而浪漫。' },
    { id: 9, title: '秋日语', date: '2024.09.08', image: 'https://img.yubaos.com/Gallery/20161004kl.webp', note: '秋日私语，落叶纷飞的季节。' },
    { id: 10, title: '国庆忆', date: '2024.10.01', image: 'https://img.yubaos.com/Gallery/20140410xm.webp', note: '国庆假期的美好记忆。' },
    { id: 11, title: '双十一', date: '2024.11.11', image: 'https://img.yubaos.com/Gallery/zhujiang.webp', note: '双十一，不只是购物节。' },
    { id: 12, title: '圣诞情', date: '2024.12.25', image: 'https://img.yubaos.com/Gallery/Phuket.webp', note: '圣诞节的特别回忆。' }
  ];

  /* =====================================================================
     获取 DOM 元素
     ===================================================================== */
  const gridContainer = document.getElementById('gridContainer');
  const overlay = document.getElementById('overlay');
  const vPhoto = document.getElementById('vPhoto');
  const vTitle = document.getElementById('vTitle');
  const vDate = document.getElementById('vDate');
  const vNote = document.getElementById('vNote');
  const vIdx = document.getElementById('vIdx');

  let currentIndex = 0;
  let activeGridItem = null;

  /* =====================================================================
     构建宫格网格
     ===================================================================== */
  function buildGrid() {
    gridContainer.innerHTML = '';
    
    IMAGES.forEach((item, index) => {
      const gridItem = document.createElement('div');
      gridItem.className = 'grid-item';
      gridItem.dataset.index = index;
      
      gridItem.innerHTML = `
        <div class="grid-inner">
          <div class="grid-front">
            <h3>${item.title}</h3>
          </div>
          <div class="grid-back">
            <img src="${item.image}" alt="${item.title}">
          </div>
        </div>
      `;
      
      // 点击事件 - 翻转并放大
      gridItem.addEventListener('click', () => handleGridClick(gridItem, index));
      
      gridContainer.appendChild(gridItem);
    });
  }

  /* =====================================================================
     处理宫格点击 - 翻转放大效果
     ===================================================================== */
  function handleGridClick(gridItem, index) {
    // 如果已经有激活的宫格，先恢复它
    if (activeGridItem && activeGridItem !== gridItem) {
      activeGridItem.classList.remove('active');
    }
    
    // 切换当前宫格的激活状态
    if (gridItem.classList.contains('active')) {
      // 已经是激活状态，点击则恢复并打开查看器
      gridItem.classList.remove('active');
      setTimeout(() => openViewer(index), 400);
    } else {
      // 激活当前宫格（翻转）
      gridItem.classList.add('active');
      activeGridItem = gridItem;
      
      // 延迟打开查看器，等待翻转动画完成
      setTimeout(() => openViewer(index), 600);
    }
  }

  /* =====================================================================
     打开查看器
     ===================================================================== */
  function openViewer(index) {
    currentIndex = index;
    fillViewer(index);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /* =====================================================================
     填充查看器内容
     ===================================================================== */
  function fillViewer(index) {
    const item = IMAGES[index];
    
    // 淡出切换效果
    vPhoto.classList.add('swap');
    setTimeout(() => {
      vPhoto.innerHTML = `<img src="${item.image}" alt="${item.title}">`;
      vPhoto.classList.remove('swap');
    }, 180);
    
    // 更新文本信息
    vTitle.textContent = item.title;
    vDate.textContent = item.date;
    vNote.textContent = item.note;
    vIdx.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(IMAGES.length).padStart(2, '0');
  }

  /* =====================================================================
     关闭查看器
     ===================================================================== */
  function closeViewer() {
    overlay.classList.remove('open');
    
    // 恢复所有宫格
    if (activeGridItem) {
      activeGridItem.classList.remove('active');
      activeGridItem = null;
    }
    
    document.body.style.overflow = '';
  }

  /* =====================================================================
     切换查看器内容（上一张/下一张）
     ===================================================================== */
  function step(dir) {
    currentIndex = (currentIndex + dir + IMAGES.length) % IMAGES.length;
    fillViewer(currentIndex);
    
    // 同时更新宫格的激活状态
    if (activeGridItem) {
      activeGridItem.classList.remove('active');
    }
    const newActiveItem = gridContainer.children[currentIndex];
    if (newActiveItem) {
      newActiveItem.classList.add('active');
      activeGridItem = newActiveItem;
    }
  }

  /* =====================================================================
     绑定事件
     ===================================================================== */
  // 查看器控制按钮
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
  const menuBtn = document.getElementById('menuBtn');
  const drawer = document.getElementById('navDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');

  /* =====================================================================
     抽屉导航控制函数
     ===================================================================== */
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
    if (!overlay.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  function toggleDrawer() {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  }

  // 绑定抽屉控制事件
  menuBtn.addEventListener('click', toggleDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);
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
     ===================================================================== */
  buildGrid();
})();
