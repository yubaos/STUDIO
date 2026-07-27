/**
 * FOOTPRINTS - Travel Archive Script
 * Handles ticket grid rendering, viewer, and mobile navigation
 */

(function() {
  'use strict';

  /* =====================================================================
     Image Resources (IMG) - Travel photos for tickets/video posters
     ===================================================================== */
  const IMG = {
    kyoto:    'https://image.qwenlm.ai/public_source/ad1849f7-810e-4742-98d1-aa785709bea4/147bff259-2579-4288-b4a7-d7f19e60012a.png',
    fuji:     'https://image.qwenlm.ai/public_source/ad1849f7-810e-4742-98d1-aa785709bea4/14dc9e83f-de7f-4aec-9997-d29e554a3cde.png',
    shanghai: 'https://image.qwenlm.ai/public_source/ad1849f7-810e-4742-98d1-aa785709bea4/1ac501088-11d3-40be-8bc0-873924b0f1ba.png',
    bangkok:  'https://image.qwenlm.ai/public_source/ad1849f7-810e-4742-98d1-aa785709bea4/1ca9d2404-da75-4a51-9b7a-49446ac90d2e.png',
    hanoi:    'https://image.qwenlm.ai/public_source/ad1849f7-810e-4742-98d1-aa785709bea4/16cfa3b16-9280-4488-956e-5089d57c87f2.png',
    castle:   'https://image.qwenlm.ai/public_source/ad1849f7-810e-4742-98d1-aa785709bea4/1bb3debd7-77a6-47e6-98e8-c9fb004c708c.png'
  };

  /* =====================================================================
     Video Resources (VID) - Sample videos for demo
     ===================================================================== */
  const VID = {
    clipA: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    clipB: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    clipC: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  };

  /* =====================================================================
     Ticket Data
     ===================================================================== */
  const TICKETS = [
    { id:1,  display:'KYOTO, JAPAN',     real:'京都，日本',   date:'2023.10.15', type:'image', image:IMG.kyoto,                                       lat:35.0036, lng:135.7748, note:'祇园花见小路，雨后石板路泛着微光，纸灯笼一盏盏亮起。' },
    { id:2,  display:'NEPAL, NENA',      real:'富士山，日本', date:'2023.10.15', type:'image', image:IMG.fuji,                                        lat:35.3606, lng:138.7274, note:'晴日里的富士，雪线干净得像被尺子量过。' },
    { id:3,  display:'SHANGHAI',         real:'上海，中国',   date:'2023.10.15', type:'image', image:IMG.shanghai,                                    lat:31.2304, lng:121.4737, note:'外滩对岸的陆家嘴，暮色把江水染成暖橘。' },
    { id:4,  display:'JABB, JAPAN',      real:'京都，日本',   date:'2023.10.15', type:'image', image:IMG.kyoto,                                       lat:35.0142, lng:135.7795, note:'清晨无人的巷弄，木格窗后传出煮茶的声音。' },
    { id:5,  display:'BANGKOK, THAILAND',real:'曼谷，泰国',   date:'2023.10.15', type:'video', video:VID.clipA, poster:IMG.bangkok,                   lat:13.7563, lng:100.5018, note:'大皇宫的金顶在夕阳下近乎燃烧 —— 这段影像记录了铃铛与僧诵。' },
    { id:6,  display:'BARRKOK, JAPAN',   real:'曼谷，泰国',   date:'2023.10.15', type:'image', image:IMG.bangkok,                                     lat:13.7501, lng:100.4932, note:'寺庙回廊的浮雕，每一寸都贴了金箔。' },
    { id:7,  display:'HANOI, VIETNAM',   real:'河内，越南',   date:'2023.10.15', type:'image', image:IMG.hanoi,                                       lat:21.0341, lng:105.8522, note:'三十六行街的清晨，摩托车流与叫卖声一同醒来。' },
    { id:8,  display:'KYOTO, JAPAN',     real:'京都，日本',   date:'2023.10.15', type:'image', image:IMG.kyoto,                                       lat:35.0012, lng:135.7621, note:'穿和服的旅人走过町屋，像从浮世绘里走出来。' },
    { id:9,  display:'SHANGOK, JAPAN',   real:'姬路，日本',   date:'2023.10.15', type:'image', image:IMG.castle,                                      lat:34.8394, lng:134.6939, note:'白鹭城，樱花把整座天守阁框成一幅画。' },
    { id:10, display:'NERPL, JAPAN',     real:'上海，中国',   date:'2023.10.15', type:'image', image:IMG.shanghai,                                    lat:31.2397, lng:121.4995, note:'江风带着潮气，对岸的灯一盏接一盏点亮。' },
    { id:11, display:'BANKON, JAPAN',    real:'曼谷，泰国',   date:'2023.10.15', type:'image', image:IMG.bangkok,                                     lat:13.7468, lng:100.4927, note:'黄昏的寺庙广场，僧袍的橙与金顶相映。' },
    { id:12, display:'BANKOD, JAPAN',    real:'曼谷，泰国',   date:'2023.10.15', type:'image', image:IMG.bangkok,                                     lat:13.7522, lng:100.4901, note:'佛塔尖的铃铛，风一过就细碎地响。' },
    { id:13, display:'HANOI, VIETNAM',   real:'河内，越南',   date:'2023.10.15', type:'image', image:IMG.hanoi,                                       lat:21.0285, lng:105.8542, note:'老城门口，卖花的老妇人把茉莉串成手环。' },
    { id:14, display:'HANOI, HANOI',     real:'河内，越南',   date:'2023.10.15', type:'video', video:VID.clipB, poster:IMG.hanoi,                     lat:21.0278, lng:105.8342, note:'街角咖啡摊，滴漏咖啡一滴一滴落进炼乳里 —— 影像里能听见街声。' },
    { id:15, display:'BANKKX, JAPAN',    real:'京都，日本',   date:'2023.10.15', type:'image', image:IMG.kyoto,                                       lat:34.9981, lng:135.7803, note:'二年坂的坡道，尽头是八坂之塔的剪影。' },
    { id:16, display:'NEPAL, JAPAN',     real:'富士山，日本', date:'2023.10.15', type:'image', image:IMG.fuji,                                        lat:35.5116, lng:138.7631, note:'河口湖畔回望，山影完整地落在水面。' },
    { id:17, display:'SHECAG, JAPAN',    real:'曼谷，泰国',   date:'2023.10.15', type:'image', image:IMG.bangkok,                                     lat:13.7439, lng:100.4898, note:'日落把整座寺庙镀成蜜色，云慢慢散开。' },
    { id:18, display:'SHANGHLI, JAPAN',  real:'上海，中国',   date:'2023.10.15', type:'video', video:VID.clipC, poster:IMG.shanghai,                  lat:31.2411, lng:121.4962, note:'夜航船划过，霓虹在浪里碎成一片 —— 一段江岸的延时影像。' },
    { id:19, display:'HANOI, VIETNAM',   real:'河内，越南',   date:'2023.10.15', type:'image', image:IMG.hanoi,                                       lat:21.0312, lng:105.8491, note:'菜市的辣椒红得发亮，竹筐堆到屋檐下。' },
    { id:20, display:'HANOI, VIETNAM',   real:'河内，越南',   date:'2023.10.15', type:'image', image:IMG.hanoi,                                       lat:21.0255, lng:105.8388, note:'黄昏收摊前，整条街被暖光泡软了。' },
    { id:21, display:'HIMEJI, JAPAN',    real:'姬路，日本',   date:'2023.10.15', type:'image', image:IMG.castle,                                      lat:34.8411, lng:134.6982, note:'樱吹雪里，白墙黑瓦的天守阁静静站着。' }
  ];

  /* =====================================================================
     Utility: Format coordinates
     ===================================================================== */
  function fmtCoord(lat, lng, wall) {
    const d = wall ? 2 : 4;
    const ns = lat >= 0 ? 'N' : 'S';
    const ew = lng >= 0 ? 'E' : 'W';
    const sep = wall ? ' ' : ' / ';
    return Math.abs(lat).toFixed(d) + '°' + ns + sep + Math.abs(lng).toFixed(d) + '°' + ew;
  }

  const PLAY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

  function mediaThumbHTML(t) {
    if (t.type === 'video') {
      return `<div class="t-photo"><img src="${t.poster}" alt="${t.display}" loading="lazy">` +
             `<span class="play-badge" aria-hidden="true">${PLAY_SVG}</span></div>`;
    }
    return `<div class="t-photo"><img src="${t.image}" alt="${t.display}" loading="lazy"></div>`;
  }

  /* =====================================================================
     Render Ticket Grid
     ===================================================================== */
  const grid = document.getElementById('ticketGrid');

  function tinyRotation(i) {
    const seq = [-1.1, 0.7, -0.5, 1.0, -0.8, 0.6, -1.0, 0.9, -0.6, 1.1, -0.9, 0.5, -0.7, 0.8, -1.0, 0.6, -0.5, 0.9, -0.8, 0.7, -0.6];
    return seq[i % seq.length] + 'deg';
  }

  function buildTickets() {
    grid.innerHTML = '';
    TICKETS.forEach((t, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'ticket-wrap';
      wrap.style.setProperty('--rot', tinyRotation(i));
      wrap.dataset.index = i;
      wrap.setAttribute('tabindex', '0');
      wrap.setAttribute('role', 'button');
      wrap.setAttribute('aria-label', '查看 ' + t.display + (t.type === 'video' ? '（视频）' : ''));
      wrap.innerHTML = `
        <article class="ticket">
          ${mediaThumbHTML(t)}
          <div class="t-info">
            <div class="t-loc">${t.display}</div>
            <div class="t-date">${t.date}</div>
          </div>
          <div class="t-perf"></div>
          <div class="t-code">${fmtCoord(t.lat, t.lng, true)}</div>
        </article>
      `;
      wrap.addEventListener('click', () => openViewer(i));
      wrap.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openViewer(i); }
      });
      grid.appendChild(wrap);
    });
  }

  function revealOnScroll() {
    const items = Array.from(document.querySelectorAll('.ticket-wrap'));
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = (Array.from(grid.children).indexOf(el) % 7) * 70;
          setTimeout(() => el.classList.add('in'), delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(el => io.observe(el));
  }

  /* =====================================================================
     Viewer (Image + Video)
     ===================================================================== */
  const overlay = document.getElementById('overlay');
  const vPhoto  = document.getElementById('vPhoto');
  const vLoc    = document.getElementById('vLoc');
  const vDate   = document.getElementById('vDate');
  const vNote   = document.getElementById('vNote');
  const vIdx    = document.getElementById('vIdx');
  const vCode   = document.getElementById('vCode');
  const vMedia  = document.getElementById('vMedia');
  let current = 0;

  function cleanupVideo() {
    const v = vPhoto.querySelector('video');
    if (v) { try { v.pause(); v.removeAttribute('src'); v.load(); } catch(_) {} }
  }

  function renderFullMedia(t) {
    cleanupVideo();
    if (t.type === 'video') {
      vPhoto.innerHTML = `<video src="${t.video}" poster="${t.poster}" controls playsinline webkit-playsinline preload="metadata"></video>` +
                        `<button class="v-play" aria-label="播放视频">${PLAY_SVG}</button>`;
      const vid = vPhoto.querySelector('video');
      const vb  = vPhoto.querySelector('.v-play');
      vb.addEventListener('click', () => { vid.play().catch(()=>{}); });
      vid.addEventListener('play',  () => vb.classList.add('hide'));
      vid.addEventListener('pause', () => { if (!vid.ended) vb.classList.remove('hide'); });
      vid.addEventListener('ended', () => vb.classList.remove('hide'));
    } else {
      vPhoto.innerHTML = `<img src="${t.image}" alt="${t.display}">`;
    }
  }

  function fillViewer(i) {
    const t = TICKETS[i];
    vPhoto.classList.add('swap');
    setTimeout(() => {
      renderFullMedia(t);
      vPhoto.classList.remove('swap');
    }, 180);
    vLoc.textContent  = t.display;
    vDate.textContent = t.date;
    vNote.textContent = t.note;
    vCode.textContent = fmtCoord(t.lat, t.lng, false);
    vIdx.textContent  = String(i + 1).padStart(2, '0') + ' / ' + String(TICKETS.length).padStart(2, '0');
    if (t.type === 'video') { vMedia.hidden = false; vMedia.textContent = '▶ VIDEO'; }
    else { vMedia.hidden = true; }
  }

  function openViewer(i) {
    current = i;
    fillViewer(i);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeViewer() {
    cleanupVideo();
    overlay.classList.remove('open');
    if (!drawer.classList.contains('open')) document.body.style.overflow = '';
  }

  function step(dir) {
    current = (current + dir + TICKETS.length) % TICKETS.length;
    fillViewer(current);
  }

  document.getElementById('vClose').addEventListener('click', closeViewer);
  document.getElementById('vPrev').addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
  document.getElementById('vNext').addEventListener('click', (e) => { e.stopPropagation(); step(1); });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeViewer(); });

  /* =====================================================================
     Mobile Drawer Navigation
     ===================================================================== */
  const menuBtn        = document.getElementById('menuBtn');
  const drawer         = document.getElementById('navDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');

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
    if (!overlay.classList.contains('open')) document.body.style.overflow = '';
  }

  function toggleDrawer() {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  }

  menuBtn.addEventListener('click', toggleDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);
  drawer.querySelectorAll('.drawer-list a').forEach(a => a.addEventListener('click', closeDrawer));

  const MQ_WIDE = window.matchMedia('(min-width: 1100px)');
  (MQ_WIDE.addEventListener ? MQ_WIDE.addEventListener.bind(MQ_WIDE, 'change') : MQ_WIDE.addListener.bind(MQ_WIDE))((e) => {
    if (e.matches) closeDrawer();
  });

  /* =====================================================================
     Keyboard Navigation
     ===================================================================== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (overlay.classList.contains('open')) closeViewer();
      else if (drawer.classList.contains('open')) closeDrawer();
      return;
    }
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });

  /* Home Link Guard */
  function guardHome(e) { if (location.protocol === 'file:') e.preventDefault(); }
  document.getElementById('logo').addEventListener('click', guardHome);
  document.getElementById('drawerHome').addEventListener('click', (e) => { guardHome(e); closeDrawer(); });

  /* Initialize */
  buildTickets();
  revealOnScroll();
})();
