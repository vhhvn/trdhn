/**
 * ============================================================
 * DATALOADER.JS - Data Fetching & Parsing (Multi-Season Support)
 * Bản đồ số Hành trình Lễ rước Điện Huệ Nam
 * ============================================================
 */

(function () {
  'use strict';

  const { Config } = window.HueNamApp;

  /** Dữ liệu đã tải */
  let _allData = null;
  let _currentSeasonId = 'march'; // Default 'march' hoặc 'july'
  let _locations = [];
  let _routeSegments = [];
  let _config = null;

  /**
   * Fetch JSON với error handling
   * @param {string} url - URL tương đối
   * @returns {Promise<Object>}
   */
  async function fetchJSON(url) {
    try {
      const cacheBustUrl = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
      const response = await fetch(cacheBustUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Lỗi tải dữ liệu từ ${url}:`, error);
      throw error;
    }
  }

  /**
   * Tải cấu hình runtime từ config.json
   * @returns {Promise<Object>}
   */
  async function loadConfig() {
    try {
      const data = await fetchJSON('data/config.json');
      _config = deepMerge(Config.DEFAULT_CONFIG, data);
      Config.runtimeConfig = _config;
      return _config;
    } catch (error) {
      console.warn('Sử dụng cấu hình mặc định do không tải được config.json');
      _config = { ...Config.DEFAULT_CONFIG };
      Config.runtimeConfig = _config;
      return _config;
    }
  }

  /**
   * Tải toàn bộ dữ liệu địa điểm các mùa
   */
  async function loadLocationsData() {
    const config = getConfig();
    _allData = await fetchJSON(config.data.locationsPath);
    return _allData;
  }

  /**
   * Tải tuyến rước GeoJSON của một mùa cụ thể
   * @param {string} seasonId - 'march' hoặc 'july'
   */
  async function loadSeason(seasonId) {
    if (!_allData || !_allData.seasons) {
      await loadLocationsData();
    }

    const seasonData = _allData.seasons[seasonId];
    if (!seasonData) {
      throw new Error(`Không tìm thấy dữ liệu cho mùa lễ hội: ${seasonId}`);
    }

    _currentSeasonId = seasonId;
    _locations = seasonData.locations.sort((a, b) => a.order - b.order);

    // Tải GeoJSON tương ứng
    const routesData = await fetchJSON(seasonData.routesFile);
    if (routesData && routesData.type === 'FeatureCollection' && Array.isArray(routesData.features)) {
      _routeSegments = routesData.features
        .filter(f => f.geometry && f.geometry.type === 'LineString')
        .sort((a, b) => (a.properties.order || 0) - (b.properties.order || 0));
    } else {
      throw new Error('Định dạng GeoJSON không hợp lệ');
    }

    return {
      season: seasonData,
      locations: _locations,
      routeSegments: _routeSegments
    };
  }

  /**
   * Tải tất cả dữ liệu ban đầu
   * @param {Function} [onProgress] - Callback tiến trình
   * @returns {Promise<Object>}
   */
  async function loadAll(onProgress) {
    const steps = [
      { label: 'Tải cấu hình hệ thống...', fn: loadConfig },
      { label: 'Tải danh mục địa điểm...', fn: loadLocationsData },
      { label: 'Khởi tạo dữ liệu Lễ hội...', fn: () => loadSeason(_currentSeasonId) }
    ];

    for (let i = 0; i < steps.length; i++) {
      if (onProgress) {
        onProgress({
          current: i,
          total: steps.length,
          label: steps[i].label,
          percent: Math.round((i / steps.length) * 100)
        });
      }
      await steps[i].fn();
    }

    if (onProgress) {
      onProgress({
        current: steps.length,
        total: steps.length,
        label: 'Hoàn tất!',
        percent: 100
      });
    }

    return {
      config: _config,
      seasonId: _currentSeasonId,
      locations: _locations,
      routeSegments: _routeSegments
    };
  }

  function getLocations() { return _locations; }
  function getRouteSegments() { return _routeSegments; }
  function getConfig() { return _config || Config.DEFAULT_CONFIG; }
  function getCurrentSeasonId() { return _currentSeasonId; }
  function getSeasonInfo(seasonId) {
    return _allData && _allData.seasons ? _allData.seasons[seasonId || _currentSeasonId] : null;
  }

  function getLocationById(id) {
    return _locations.find(loc => loc.id === id) || null;
  }

  function getLocationByOrder(order) {
    return _locations.find(loc => loc.order === order) || null;
  }

  function getSegmentByIndex(index) {
    return _routeSegments[index] || null;
  }

  function getTotalSegments() {
    return _routeSegments.length;
  }

  function getTotalLocations() {
    return _locations.length;
  }

  function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    return result;
  }

  // Export
  HueNamApp.DataLoader = {
    loadAll,
    loadConfig,
    loadSeason,
    getLocations,
    getRouteSegments,
    getConfig,
    getCurrentSeasonId,
    getSeasonInfo,
    getLocationById,
    getLocationByOrder,
    getSegmentByIndex,
    getTotalSegments,
    getTotalLocations
  };

})();
