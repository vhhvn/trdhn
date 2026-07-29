/**
 * ============================================================
 * CONFIG.JS - Application Constants & Configuration
 * Bản đồ số Hành trình Lễ rước Điện Huệ Nam
 * ============================================================
 */

(function () {
  'use strict';

  /**
   * Global namespace cho ứng dụng
   */
  window.HueNamApp = window.HueNamApp || {};

  /**
   * Cấu hình mặc định (fallback nếu config.json không tải được)
   */
  const DEFAULT_CONFIG = {
    app: {
      title: 'Bản đồ số Hành trình Lễ rước Điện Huệ Nam',
      subtitle: 'Khám phá không gian và các điểm diễn ra lễ rước',
      version: '1.0.0',
      language: 'vi'
    },
    map: {
      center: [16.4500, 107.6050],
      zoom: 13,
      minZoom: 10,
      maxZoom: 18,
      maxBounds: [
        [16.35, 107.50],
        [16.55, 107.70]
      ]
    },
    tileLayers: {
      light: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      },
      dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 20,
        subdomains: 'abcd'
      }
    },
    journey: {
      autoPlayInterval: 5000,
      animationDuration: 1500,
      polylineDrawDuration: 2000,
      zoomPadding: [50, 50],
      flyToDuration: 1.5
    },
    theme: {
      default: 'dark'
    },
    data: {
      locationsPath: 'data/locations.json',
      routesPath: 'data/routes.geojson'
    }
  };

  /**
   * Trạng thái hành trình
   */
  const JOURNEY_STATES = {
    IDLE: 'idle',           // Chưa bắt đầu
    ACTIVE: 'active',       // Đang khám phá
    PAUSED: 'paused',       // Tạm dừng auto play
    COMPLETED: 'completed'  // Hoàn thành
  };

  /**
   * Loại địa điểm
   */
  const LOCATION_TYPES = {
    START: 'start',
    STOP: 'stop',
    END: 'end'
  };

  /**
   * Loại phương tiện di chuyển
   */
  const TRANSPORT_TYPES = {
    BOAT: 'boat',
    WALKING: 'walking',
    VEHICLE: 'vehicle'
  };

  /**
   * Trạng thái của chặng
   */
  const SEGMENT_STATES = {
    UNVISITED: 'unvisited',
    ACTIVE: 'active',
    VISITED: 'visited'
  };

  /**
   * CSS class names cho markers
   */
  const MARKER_CLASSES = {
    START: 'marker-icon--start',
    STOP: 'marker-icon--stop',
    END: 'marker-icon--end',
    CURRENT: 'marker-icon--current',
    VISITED: 'marker-icon--visited',
    DEFAULT: 'marker-icon--default'
  };

  /**
   * Label cho các nút điều khiển
   */
  const BUTTON_LABELS = {
    START: 'Bắt đầu hành trình',
    NEXT_PREFIX: 'Tiếp tục đến ',
    PREVIOUS: 'Quay lại',
    VIEW_ALL: 'Toàn tuyến',
    AUTO_PLAY: 'Tự động',
    PAUSE: 'Tạm dừng',
    REPLAY: 'Xem lại',
    RESTART: 'Bắt đầu lại',
    COMPLETED_TITLE: 'Hoàn thành hành trình!',
    COMPLETED_MESSAGE: 'Bạn đã hoàn thành hành trình khám phá Lễ rước Điện Huệ Nam. Cảm ơn bạn đã đồng hành cùng chúng tôi trên hành trình văn hóa tâm linh này.'
  };

  /**
   * Style cho polyline
   */
  const ROUTE_STYLES = {
    active: {
      color: null,  // Sẽ lấy từ CSS variable
      weight: 5,
      opacity: 1,
      dashArray: null,
      className: 'route-segment-active'
    },
    visited: {
      color: null,
      weight: 3,
      opacity: 0.7,
      dashArray: null,
      className: 'route-segment-visited'
    },
    unvisited: {
      color: null,
      weight: 2,
      opacity: 0.4,
      dashArray: '8 6',
      className: 'route-segment-unvisited'
    },
    preview: {
      color: null,
      weight: 2,
      opacity: 0.25,
      dashArray: '4 8',
      className: 'route-segment-preview'
    }
  };

  /**
   * Biểu tượng cho các loại phương tiện
   */
  const TRANSPORT_ICONS = {
    boat: '⛵',
    walking: '🚶',
    vehicle: '🚗'
  };

  /**
   * Biểu tượng cho các loại điểm
   */
  const LOCATION_ICONS = {
    start: '🟢',
    stop: '🟡',
    end: '🔴'
  };

  /**
   * Thời gian (ms) cho các animation/transition
   */
  const TIMING = {
    LOADING_SCREEN_DELAY: 500,
    TOAST_DURATION: 3000,
    TOAST_FADE_DURATION: 300,
    MARKER_BOUNCE_DELAY: 100,
    PANEL_TRANSITION: 400,
    COMPLETION_DELAY: 800
  };

  /**
   * Breakpoints cho responsive
   */
  const BREAKPOINTS = {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1400
  };

  // Export to global namespace
  HueNamApp.Config = {
    DEFAULT_CONFIG,
    JOURNEY_STATES,
    LOCATION_TYPES,
    TRANSPORT_TYPES,
    SEGMENT_STATES,
    MARKER_CLASSES,
    BUTTON_LABELS,
    ROUTE_STYLES,
    TRANSPORT_ICONS,
    LOCATION_ICONS,
    TIMING,
    BREAKPOINTS,
    runtimeConfig: null // Sẽ được set bởi dataLoader
  };

})();
