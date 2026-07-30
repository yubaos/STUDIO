/**
 * =========================================================
 * TIME MACHINE - 时光机交互脚本
 * 宫格翻转放大 | 图片查看器 | 无限滚动加载
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
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentIndex = 0;
  let activeGridItem = null;
  let isLoading = false;
  let loadedCount = 0;
  const INITIAL_COUNT = 12; // 初始加载数量
  const LOAD_MORE_COUNT = 6; // 每次加载更多数量

  /* =====================================================================
     创建单个宫格元素
     ===================================================================== */
  function createGridItem(item, index) {
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
    
    return gridItem;
  }

  /* =====================================================================
     构建宫格网格 - 初始加载
     ===================================================================== */
  function buildGrid() {
    gridContainer.innerHTML = '';
    loadedCount = 0;
    
    // 初始加载指定数量的宫格
    for (let i = 0; i < Math.min(INITIAL_COUNT, IMAGES.length); i++) {
      const item = IMAGES[i % IMAGES.length];
      const gridItem = createGridItem(item, i);
      gridContainer.appendChild(gridItem);
      loadedCount++;
    }
  }

  /* =====================================================================
     加载更多宫格 - 无限滚动
     ===================================================================== */
  function loadMoreGrids() {
    if (isLoading) return;
    
    isLoading = true;
    
    // 模拟加载延迟，提升用户体验
    setTimeout(() => {
      for (let i = 0; i < LOAD_MORE_COUNT; i++) {
        const index = loadedCount + i;
        const item = IMAGES[index % IMAGES.length]; // 循环使用图片
        const gridItem = createGridItem(item, index);
        gridContainer.appendChild(gridItem);
      }
      
      loadedCount += LOAD_MORE_COUNT;
      isLoading = false;
    }, 300);
  }

  /* =====================================================================
     滚动监听 - 无限滚动加载
     ===================================================================== */
  function handleScroll() {
    const scrollTop = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // 当滚动到距离底部 500px 时加载更多
    if (scrollTop + windowHeight >= documentHeight - 500) {
      loadMoreGrids();
    }
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
      setTimeout(() => openLightbox(index), 400);
    } else {
      // 激活当前宫格（翻转）
      gridItem.classList.add('active');
      activeGridItem = gridItem;
      
      // 延迟打开查看器，等待翻转动画完成
      setTimeout(() => openLightbox(index), 600);
    }
  }

  /* =====================================================================
     打开全屏查看器
     ===================================================================== */
  function openLightbox(index) {
    currentIndex = index;
    updateLightboxImage();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /* =====================================================================
     更新全屏查看器图片
     ===================================================================== */
  function updateLightboxImage() {
    const item = IMAGES[currentIndex % IMAGES.length];
    lightboxImg.src = item.image;
    lightboxImg.alt = item.title;
  }

  /* =====================================================================
     关闭全屏查看器
     ===================================================================== */
  function closeLightbox() {
    lightbox.classList.remove('open');
    
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
    currentIndex = (currentIndex + dir);
    if (dir > 0 && currentIndex >= loadedCount) {
      // 如果是下一张且已到最后，加载更多
      loadMoreGrids();
    }
    updateLightboxImage();
    
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
  // 全屏查看器控制按钮
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    step(-1);
  });
  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    step(1);
  });
  
  // 点击遮罩层关闭
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // 滚动监听 - 无限加载
  window.addEventListener('scroll', handleScroll);

  /* =====================================================================
     菜单导航相关
     ===================================================================== */
  const menuBtn = document.getElementById('menuBtn');
  const fullscreenMenu = document.getElementById('fullscreenMenu');

  function toggleMenu() {
    fullscreenMenu.classList.toggle('open');
    menuBtn.classList.toggle('open');
    document.body.style.overflow = fullscreenMenu.classList.contains('open') ? 'hidden' : '';
  }

  menuBtn.addEventListener('click', toggleMenu);
  
  // 点击菜单项关闭菜单
  fullscreenMenu.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      fullscreenMenu.classList.remove('open');
      menuBtn.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* =====================================================================
     键盘快捷键支持
     ===================================================================== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox.classList.contains('open')) {
        closeLightbox();
      } else if (fullscreenMenu.classList.contains('open')) {
        toggleMenu();
      }
      return;
    }
    
    // 查看器开启时才响应方向键
    if (!lightbox.classList.contains('open')) return;
    
    if (e.key === 'ArrowLeft') {
      step(-1);
    } else if (e.key === 'ArrowRight') {
      step(1);
    }
  });

  /* =====================================================================
     初始化
     ===================================================================== */
  buildGrid();
})();
