/**
 * ============================================================
 * MAP.JS - Leaflet Map Initialization & Controls
 * Bản đồ số Hành trình Lễ rước Điện Huệ Nam
 * ============================================================
 */

(function () {
  'use strict';

  const { Utils, DataLoader } = window.HueNamApp;

  /** Leaflet map instance */
  let _map = null;
  /** Tile layers */
  let _tileLayers = {};
  /** Current tile layer */
  let _currentTileLayer = null;
  /** Feature groups */
  let _markerGroup = null;
  let _routeGroup = null;
  /** Scale control */
  let _scaleControl = null;
  /** Minimap control */
  let _minimapControl = null;
  /** Fullscreen state */
  let _isFullscreen = false;

  /**
   * Khởi tạo bản đồ Leaflet
   * @returns {L.Map}
   */
  function init() {
    const config = DataLoader.getConfig();
    const mapConfig = config.map;
    const theme = Utils.getCurrentTheme();

    // Tạo map instance
    _map = L.map('map', {
      center: mapConfig.center,
      zoom: mapConfig.zoom,
      minZoom: mapConfig.minZoom,
      maxZoom: mapConfig.maxZoom,
      maxBounds: mapConfig.maxBounds ? L.latLngBounds(mapConfig.maxBounds) : undefined,
      maxBoundsViscosity: 1.0,
      zoomControl: false,
      attributionControl: true,
      zoomAnimation: true,
      markerZoomAnimation: true,
      fadeAnimation: true
    });

    // Tạo tile layers
    _createTileLayers(config.tileLayers);

    // Set tile layer theo theme
    _setTileLayer(theme);

    // Thêm zoom control ở vị trí topleft
    L.control.zoom({
      position: 'topleft',
      zoomInTitle: 'Phóng to',
      zoomOutTitle: 'Thu nhỏ'
    }).addTo(_map);

    // Thêm scale control
    _scaleControl = L.control.scale({
      position: 'bottomleft',
      metric: true,
      imperial: false,
      maxWidth: 150
    }).addTo(_map);

    // Tạo feature groups cho markers và routes
    _routeGroup = L.featureGroup().addTo(_map);
    _markerGroup = L.featureGroup().addTo(_map);

    // Thêm MiniMap nếu không phải mobile
    if (!Utils.isMobile()) {
      _initMiniMap(config);
    }

    return _map;
  }

  /**
   * Tạo tile layers
   * @param {Object} tileConfig - Cấu hình tile layers
   */
  function _createTileLayers(tileConfig) {
    // Light tile layer
    _tileLayers.light = L.tileLayer(tileConfig.light.url, {
      attribution: tileConfig.light.attribution,
      maxZoom: tileConfig.light.maxZoom || 19
    });

    // Dark tile layer
    _tileLayers.dark = L.tileLayer(tileConfig.dark.url, {
      attribution: tileConfig.dark.attribution,
      maxZoom: tileConfig.dark.maxZoom || 20,
      subdomains: tileConfig.dark.subdomains || 'abcd'
    });
  }

  /**
   * Set tile layer theo theme
   * @param {string} theme - 'dark' hoặc 'light'
   */
  function _setTileLayer(theme) {
    if (_currentTileLayer) {
      _map.removeLayer(_currentTileLayer);
    }

    _currentTileLayer = _tileLayers[theme] || _tileLayers.dark;
    _currentTileLayer.addTo(_map);
  }

  /**
   * Khởi tạo MiniMap
   * @param {Object} config
   */
  function _initMiniMap(config) {
    try {
      const minimapConfig = config.minimap || {};
      const theme = Utils.getCurrentTheme();
      const tileConfig = config.tileLayers[theme] || config.tileLayers.light;

      const minimapLayer = L.tileLayer(tileConfig.url, {
        attribution: '',
        maxZoom: tileConfig.maxZoom || 19,
        subdomains: tileConfig.subdomains || 'abc'
      });

      // Sử dụng plugin MiniMap nếu có
      if (L.Control.MiniMap) {
        _minimapControl = new L.Control.MiniMap(minimapLayer, {
          toggleDisplay: true,
          minimized: Utils.isTablet(),
          position: minimapConfig.position || 'bottomright',
          width: minimapConfig.width || 150,
          height: minimapConfig.height || 150,
          zoomLevelOffset: minimapConfig.zoomLevelOffset || -5,
          strings: {
            hideText: 'Ẩn bản đồ thu nhỏ',
            showText: 'Hiện bản đồ thu nhỏ'
          }
        }).addTo(_map);
      }
    } catch (e) {
      console.warn('Không thể khởi tạo MiniMap:', e);
    }
  }

  /**
   * Chuyển đổi tile layer khi đổi theme
   * @param {string} theme
   */
  function switchTheme(theme) {
    _setTileLayer(theme);

    // Cập nhật MiniMap tile layer
    if (_minimapControl) {
      try {
        _map.removeControl(_minimapControl);
        _initMiniMap(DataLoader.getConfig());
      } catch (e) {
        console.warn('Không thể cập nhật MiniMap:', e);
      }
    }
  }

  /**
   * Fly to vị trí cụ thể
   * @param {L.LatLng|Array} latlng - Tọa độ
   * @param {number} [zoom] - Mức zoom
   * @param {Object} [options] - Tùy chọn flyTo
   */
  function flyTo(latlng, zoom, options = {}) {
    const config = DataLoader.getConfig();
    const defaultOptions = {
      duration: config.journey.flyToDuration || 1.5,
      easeLinearity: 0.25
    };

    _map.flyTo(latlng, zoom || _map.getZoom(), { ...defaultOptions, ...options });
  }

  /**
   * Fly to bounds
   * @param {L.LatLngBounds} bounds - Phạm vi
   * @param {Object} [options] - Tùy chọn
   */
  function flyToBounds(bounds, options = {}) {
    const config = DataLoader.getConfig();
    const padding = config.journey.zoomPadding || [50, 50];

    const defaultOptions = {
      padding: padding,
      duration: config.journey.flyToDuration || 1.5,
      maxZoom: 16
    };

    // Trên mobile, thêm padding dưới cho bottom sheet
    if (Utils.isMobile()) {
      defaultOptions.paddingBottomRight = [20, 80];
    }

    _map.flyToBounds(bounds, { ...defaultOptions, ...options });
  }

  /**
   * Fit bản đồ vào toàn bộ markers
   * @param {Object} [options]
   */
  function fitAllMarkers(options = {}) {
    if (_markerGroup && _markerGroup.getLayers().length > 0) {
      const bounds = _markerGroup.getBounds();
      flyToBounds(bounds, options);
    }
  }

  /**
   * Fit bản đồ vào toàn bộ tuyến
   * @param {Object} [options]
   */
  function fitAllRoutes(options = {}) {
    const allBounds = L.featureGroup([_markerGroup, _routeGroup]).getBounds();
    if (allBounds.isValid()) {
      flyToBounds(allBounds, options);
    }
  }

  /**
   * Lấy map instance
   * @returns {L.Map}
   */
  function getMap() {
    return _map;
  }

  /**
   * Lấy marker group
   * @returns {L.FeatureGroup}
   */
  function getMarkerGroup() {
    return _markerGroup;
  }

  /**
   * Lấy route group
   * @returns {L.FeatureGroup}
   */
  function getRouteGroup() {
    return _routeGroup;
  }

  /**
   * Toggle fullscreen
   */
  function toggleFullscreen() {
    const mapContainer = Utils.qs('.map-container');
    if (!mapContainer) return;

    if (!_isFullscreen) {
      if (mapContainer.requestFullscreen) {
        mapContainer.requestFullscreen();
      } else if (mapContainer.webkitRequestFullscreen) {
        mapContainer.webkitRequestFullscreen();
      }
      _isFullscreen = true;
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      _isFullscreen = false;
    }

    // Invalidate map size after fullscreen change
    setTimeout(() => {
      _map.invalidateSize();
    }, 300);
  }

  /**
   * Locate user
   */
  function locateUser() {
    _map.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true
    });

    _map.once('locationfound', function (e) {
      const radius = e.accuracy;
      L.marker(e.latlng)
        .addTo(_map)
        .bindPopup(`Bạn đang ở đây<br>Độ chính xác: ${Math.round(radius)}m`)
        .openPopup();

      L.circle(e.latlng, {
        radius: radius,
        color: '#58A6FF',
        fillColor: '#58A6FF',
        fillOpacity: 0.15
      }).addTo(_map);
    });

    _map.once('locationerror', function () {
      console.warn('Không thể xác định vị trí của bạn');
    });
  }

  /**
   * Invalidate map size (khi layout thay đổi)
   */
  function invalidateSize() {
    if (_map) {
      setTimeout(() => _map.invalidateSize(), 100);
    }
  }

  /**
   * Kiểm tra fullscreen
   * @returns {boolean}
   */
  function isFullscreen() {
    return _isFullscreen;
  }

  // Export
  HueNamApp.Map = {
    init,
    switchTheme,
    flyTo,
    flyToBounds,
    fitAllMarkers,
    fitAllRoutes,
    getMap,
    getMarkerGroup,
    getRouteGroup,
    toggleFullscreen,
    locateUser,
    invalidateSize,
    isFullscreen
  };

})();
