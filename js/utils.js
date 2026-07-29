/**
 * ============================================================
 * UTILS.JS - Utility Functions
 * Bản đồ số Hành trình Lễ rước Điện Huệ Nam
 * ============================================================
 */

(function () {
  'use strict';

  const { Config } = window.HueNamApp;

  /**
   * Lấy giá trị CSS custom property
   * @param {string} varName - Tên biến CSS (bao gồm --)
   * @returns {string} Giá trị
   */
  function getCSSVar(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }

  /**
   * Set giá trị CSS custom property
   * @param {string} varName - Tên biến CSS
   * @param {string} value - Giá trị
   */
  function setCSSVar(varName, value) {
    document.documentElement.style.setProperty(varName, value);
  }

  /**
   * Tạo element từ template string
   * @param {string} html - HTML string
   * @returns {HTMLElement}
   */
  function createElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  }

  /**
   * Query selector an toàn
   * @param {string} selector - CSS selector
   * @param {HTMLElement} [parent=document] - Parent element
   * @returns {HTMLElement|null}
   */
  function qs(selector, parent = document) {
    return parent.querySelector(selector);
  }

  /**
   * Query selector all an toàn
   * @param {string} selector - CSS selector
   * @param {HTMLElement} [parent=document] - Parent element
   * @returns {NodeList}
   */
  function qsa(selector, parent = document) {
    return parent.querySelectorAll(selector);
  }

  /**
   * Debounce function
   * @param {Function} func - Hàm cần debounce
   * @param {number} wait - Thời gian chờ (ms)
   * @returns {Function}
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function
   * @param {Function} func - Hàm cần throttle
   * @param {number} limit - Giới hạn thời gian (ms)
   * @returns {Function}
   */
  function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => { inThrottle = false; }, limit);
      }
    };
  }

  /**
   * Kiểm tra thiết bị mobile
   * @returns {boolean}
   */
  function isMobile() {
    return window.innerWidth < Config.BREAKPOINTS.MOBILE;
  }

  /**
   * Kiểm tra thiết bị tablet
   * @returns {boolean}
   */
  function isTablet() {
    return window.innerWidth >= Config.BREAKPOINTS.MOBILE &&
      window.innerWidth < Config.BREAKPOINTS.TABLET;
  }

  /**
   * Kiểm tra hỗ trợ touch
   * @returns {boolean}
   */
  function isTouchDevice() {
    return ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0);
  }

  /**
   * Format khoảng cách
   * @param {string|number} distance - Khoảng cách
   * @returns {string}
   */
  function formatDistance(distance) {
    if (typeof distance === 'string') return distance;
    if (distance >= 1000) {
      return (distance / 1000).toFixed(1) + ' km';
    }
    return Math.round(distance) + ' m';
  }

  /**
   * Escape HTML để tránh XSS
   * @param {string} str - Chuỗi cần escape
   * @returns {string}
   */
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Delay execution (Promise-based)
   * @param {number} ms - Milliseconds
   * @returns {Promise<void>}
   */
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Lấy cấu hình runtime (đã merge với default)
   * @returns {Object}
   */
  function getConfig() {
    return Config.runtimeConfig || Config.DEFAULT_CONFIG;
  }

  /**
   * Lấy theme hiện tại
   * @returns {string} 'dark' hoặc 'light'
   */
  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  /**
   * Lưu dữ liệu vào localStorage an toàn
   * @param {string} key
   * @param {*} value
   */
  function saveToStorage(key, value) {
    try {
      localStorage.setItem(`huenam_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('Không thể lưu vào localStorage:', e);
    }
  }

  /**
   * Đọc dữ liệu từ localStorage an toàn
   * @param {string} key
   * @param {*} defaultValue
   * @returns {*}
   */
  function loadFromStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`huenam_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('Không thể đọc localStorage:', e);
      return defaultValue;
    }
  }

  /**
   * Tính bounds cho một tập hợp tọa độ
   * @param {Array} coordinates - Mảng [lat, lng] hoặc [lng, lat]
   * @param {boolean} isGeoJSON - true nếu format [lng, lat]
   * @returns {L.LatLngBounds}
   */
  function calculateBounds(coordinates, isGeoJSON = false) {
    const latlngs = coordinates.map(coord => {
      return isGeoJSON ? [coord[1], coord[0]] : coord;
    });
    return L.latLngBounds(latlngs);
  }

  /**
   * Tạo SVG icon inline
   * @param {string} name - Tên icon
   * @param {number} [size=20] - Kích thước
   * @returns {string} SVG HTML string
   */
  function icon(name, size = 20) {
    const icons = {
      'chevron-left': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
      'chevron-right': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
      'play': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
      'pause': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
      'map': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
      'refresh': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
      'sun': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
      'moon': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
      'locate': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>`,
      'maximize': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
      'minimize': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
      'x': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
      'info': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
      'book': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
      'star': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      'flag': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
      'navigation': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`,
      'clock': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      'map-pin': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
      'volume': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
      'image': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
      'anchor': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`,
      'share': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
    };

    return icons[name] || '';
  }

  /**
   * Lấy biểu tượng phương tiện
   * @param {string} type - Loại phương tiện
   * @returns {string} Emoji
   */
  function getTransportIcon(type) {
    return Config.TRANSPORT_ICONS[type] || '🚶';
  }

  /**
   * Lấy biểu tượng loại điểm
   * @param {string} type - Loại điểm
   * @returns {string} Emoji
   */
  function getLocationIcon(type) {
    return Config.LOCATION_ICONS[type] || '📍';
  }

  // Export
  HueNamApp.Utils = {
    getCSSVar,
    setCSSVar,
    createElement,
    qs,
    qsa,
    debounce,
    throttle,
    isMobile,
    isTablet,
    isTouchDevice,
    formatDistance,
    escapeHtml,
    delay,
    getConfig,
    getCurrentTheme,
    saveToStorage,
    loadFromStorage,
    calculateBounds,
    icon,
    getTransportIcon,
    getLocationIcon
  };

})();
