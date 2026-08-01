/**
 * YUBAO.STUDIO - Main Interaction Script
 * Handles 3D grid perspective effects and user interactions
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    perspective: 900,
    rotationMultiplier: 4,
    transitionDuration: 0.15,
  };

  /**
   * Initialize grid perspective effect with requestAnimationFrame
   * @param {HTMLElement} gridElement - The grid element to apply effects to
   */
  function initGridEffect(gridElement) {
    if (!gridElement) {
      console.warn('Grid element not found');
      return;
    }

    // Apply initial styles
    gridElement.style.transformStyle = 'preserve-3d';
    gridElement.style.transition = `transform ${CONFIG.transitionDuration}s ease-out`;

    let rafId = null;
    let latestX = 0;
    let latestY = 0;

    /**
     * Update grid transform based on mouse position
     */
    const updateTransform = () => {
      rafId = null;
      gridElement.style.transform = `
        perspective(${CONFIG.perspective}px) 
        rotateY(${latestX * CONFIG.rotationMultiplier}deg) 
        rotateX(${-latestY * CONFIG.rotationMultiplier}deg)
      `;
    };

    /**
     * Handle mouse move event
     * @param {MouseEvent} event - Mouse move event
     */
    const handleMouseMove = (event) => {
      latestX = (event.clientX / window.innerWidth - 0.5) * 2;
      latestY = (event.clientY / window.innerHeight - 0.5) * 2;

      if (!rafId) {
        rafId = requestAnimationFrame(updateTransform);
      }
    };

    // Add event listener with passive option for better scroll performance
    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Cleanup function (for potential SPA usage)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }

  /**
   * Initialize mobile drawer navigation (matching ticket-stub page)
   */
  function initMobileNav() {
    const menuBtn = document.getElementById('menuBtn');
    const drawer = document.getElementById('navDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const drawerHome = document.getElementById('drawerHome');

    if (!menuBtn || !drawer || !drawerBackdrop) {
      return;
    }

    /**
     * Open drawer navigation
     */
    function openDrawer() {
      drawer.classList.add('open');
      drawerBackdrop.classList.add('open');
      menuBtn.classList.add('open');
      menuBtn.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    /**
     * Close drawer navigation
     */
    function closeDrawer() {
      drawer.classList.remove('open');
      drawerBackdrop.classList.remove('open');
      menuBtn.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Toggle drawer on menu button click
    menuBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    // Close drawer when clicking backdrop
    drawerBackdrop.addEventListener('click', closeDrawer);

    // Close drawer when clicking HOME link
    if (drawerHome) {
      drawerHome.addEventListener('click', closeDrawer);
    }

    // Close drawer when clicking any nav link
    const navLinks = drawer.querySelectorAll('.drawer-list a');
    navLinks.forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }

  /**
   * Initialize all interactions when DOM is ready
   */
  function init() {
    const gridElement = document.getElementById('grid');
    initGridEffect(gridElement);
    initMobileNav();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
