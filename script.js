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
   * Debounce function to limit execution rate
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Initialize grid perspective effect
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

    /**
     * Update grid transform based on mouse position
     * @param {MouseEvent} event - Mouse move event
     */
    const updateTransform = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;

      gridElement.style.transform = `
        perspective(${CONFIG.perspective}px) 
        rotateY(${x * CONFIG.rotationMultiplier}deg) 
        rotateX(${-y * CONFIG.rotationMultiplier}deg)
      `;
    };

    // Use debounced version for better performance
    const debouncedUpdate = debounce(updateTransform, 16); // ~60fps

    // Add event listener
    document.addEventListener('mousemove', debouncedUpdate, { passive: true });

    // Cleanup function (for potential SPA usage)
    return () => {
      document.removeEventListener('mousemove', debouncedUpdate);
    };
  }

  /**
   * Initialize all interactions when DOM is ready
   */
  function init() {
    const gridElement = document.getElementById('grid');
    initGridEffect(gridElement);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
