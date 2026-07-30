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
  const overlay = document.getElementById('overlay');
  const vPhoto = document.getElementById('vPhoto');
  const vClose = document.getElementById('vClose');
  const vPrev = document.getElementById('vPrev');
  const vNext = document.getElementById('vNext');
  const vTitle = document.getElementById('vTitle');
  const vDate = document.getElementById('vDate');
  const vNote = document.getElementById('vNote');
  const vIdx = document.getElementById('vIdx');
  
  // 移动端菜单元素
  const menuBtn = document.getElementById('menuBtn');
  const navDrawer = document.getElementById('navDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerHome = document.getElementById('drawerHome');

  let currentIndex = 0;
  let activeGridItem = null;
  let isLoading = false;
  let loadedCount = 0;
  const INITIAL_COUNT = 12;
  const LOAD_MORE_COUNT = 6;

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

    gridItem.addEventListener('click', () => handleGridClick(gridItem, index));
    return gridItem;
  }

  /* =====================================================================
     构建宫格网格 - 初始加载
     ===================================================================== */
  function buildGrid() {
    gridContainer.innerHTML = '';
    loadedCount = 0;

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

    setTimeout(() => {
      for (let i = 0; i < LOAD_MORE_COUNT; i++) {
        const index = loadedCount + i;
        const item = IMAGES[index % IMAGES.length];
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

    if (scrollTop + windowHeight >= documentHeight - 500) {
      loadMoreGrids();
    }
  }

  /* =====================================================================
     处理宫格点击 - 仅翻转，不放大，再次点击恢复
     ===================================================================== */
  function handleGridClick(gridItem, index) {
    // 如果点击的是已经激活的宫格，则关闭它（翻转回去）
    if (gridItem.classList.contains('active')) {
      gridItem.classList.remove('active');
      activeGridItem = null;
    } else {
      // 如果已有其他宫格激活，先关闭它
      if (activeGridItem && activeGridItem !== gridItem) {
        activeGridItem.classList.remove('active');
      }
      // 激活当前宫格
      gridItem.classList.add('active');
      activeGridItem = gridItem;
    }
  }

  /* =====================================================================
     打开全屏查看器
     ===================================================================== */
  function openOverlay(index) {
    currentIndex = index;
    updateOverlayContent();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /* =====================================================================
     更新全屏查看器内容
     ===================================================================== */
  function updateOverlayContent() {
    const item = IMAGES[currentIndex % IMAGES.length];
    
    vPhoto.innerHTML = `<img src="${item.image}" alt="${item.title}" style="width:100%;height:100%;object-fit:contain;">`;
    
    if (vTitle) vTitle.textContent = item.title;
    if (vDate) vDate.textContent = item.date || '';
    if (vNote) vNote.textContent = item.note || '';
    if (vIdx) vIdx.textContent = `${currentIndex + 1} / ${loadedCount}`;
  }

  /* =====================================================================
     关闭全屏查看器
     ===================================================================== */
  function closeOverlay() {
    overlay.classList.remove('open');

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
    const newIndex = currentIndex + dir;
    
    if (dir > 0 && newIndex >= loadedCount) {
      loadMoreGrids();
    }
    
    if (newIndex >= 0 && newIndex < loadedCount) {
      currentIndex = newIndex;
      updateOverlayContent();

      if (activeGridItem) {
        activeGridItem.classList.remove('active');
      }
      const newActiveItem = gridContainer.children[currentIndex];
      if (newActiveItem) {
        newActiveItem.classList.add('active');
        activeGridItem = newActiveItem;
      }
    }
  }

  /* =====================================================================
     绑定事件
     ===================================================================== */
  if (vClose) vClose.addEventListener('click', closeOverlay);
  
  if (vPrev) vPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    step(-1);
  });
  
  if (vNext) vNext.addEventListener('click', (e) => {
    e.stopPropagation();
    step(1);
  });

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('viewer-wrap')) {
        closeOverlay();
      }
    });
  }

  if (vPhoto) {
    vPhoto.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  /* =====================================================================
     键盘快捷键支持
     ===================================================================== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (overlay && overlay.classList.contains('open')) {
        closeOverlay();
      }
      return;
    }

    if (!overlay || !overlay.classList.contains('open')) return;

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
  
  /* =====================================================================
     移动端菜单交互
     ===================================================================== */
  function openDrawer() {
    if (menuBtn) menuBtn.classList.add('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    if (navDrawer) navDrawer.classList.add('open');
    if (navDrawer) navDrawer.setAttribute('aria-hidden', 'false');
    if (drawerBackdrop) drawerBackdrop.classList.add('open');
  }
  
  function closeDrawer() {
    if (menuBtn) menuBtn.classList.remove('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    if (navDrawer) navDrawer.classList.remove('open');
    if (navDrawer) navDrawer.setAttribute('aria-hidden', 'true');
    if (drawerBackdrop) drawerBackdrop.classList.remove('open');
  }
  
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const isOpen = menuBtn.classList.contains('open');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }
  
  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', closeDrawer);
  }
  
  if (drawerHome) {
    drawerHome.addEventListener('click', closeDrawer);
  }
  
  // 点击抽屉内的链接也关闭抽屉
  const drawerLinks = document.querySelectorAll('.drawer-list a');
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
})();
