/**
 * ============================================================
 * MARKERMANAGER.JS - Marker Creation & State Management
 * Bản đồ số Hành trình Lễ rước Điện Huệ Nam
 * ============================================================
 */

(function () {
  'use strict';

  const { Config, Utils, DataLoader, Map: MapModule } = window.HueNamApp;

  /** Lưu trữ tất cả markers theo ID */
  let _markers = {};
  /** ID marker đang active */
  let _activeMarkerId = null;
  /** Set IDs marker đã visited */
  let _visitedMarkerIds = new Set();

  /**
   * Xóa tất cả markers hiện tại
   */
  function clearAllMarkers() {
    const markerGroup = MapModule.getMarkerGroup();
    if (markerGroup) {
      markerGroup.clearLayers();
    }
    _markers = {};
    _activeMarkerId = null;
    _visitedMarkerIds.clear();
  }

  /**
   * Tạo tất cả markers từ dữ liệu địa điểm
   */
  function createAllMarkers() {
    clearAllMarkers();
    const locations = DataLoader.getLocations();
    const markerGroup = MapModule.getMarkerGroup();

    locations.forEach((location, index) => {
      const marker = _createMarker(location, index);
      _markers[location.id] = marker;
      marker.addTo(markerGroup);
    });
  }

  /**
   * Tạo một marker cho một địa điểm
   * @param {Object} location - Dữ liệu địa điểm
   * @param {number} index - Index cho animation delay
   * @returns {L.Marker}
   */
  function _createMarker(location, index) {
    const markerClass = _getMarkerClass(location.type);

    // Tạo DivIcon tùy chỉnh
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-icon ${markerClass} marker-scale-in" 
             style="animation-delay: ${index * 100}ms"
             role="button"
             aria-label="${location.name} - ${location.typeLabel}"
             tabindex="0">
          ${location.order}
        </div>
        <div class="marker-label">${Utils.escapeHtml(location.name)}</div>
      `,
      iconSize: [Config.MARKER_CLASSES.CURRENT === markerClass ? 44 : 36, Config.MARKER_CLASSES.CURRENT === markerClass ? 44 : 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -22]
    });

    // Tạo marker
    const marker = L.marker([location.latitude, location.longitude], {
      icon: icon,
      title: location.name,
      alt: `Điểm ${location.order}: ${location.name}`,
      riseOnHover: true,
      riseOffset: 250
    });

    // Bind popup
    marker.bindPopup(_createPopupContent(location), {
      maxWidth: 280,
      minWidth: 200,
      className: 'custom-popup',
      closeButton: true,
      autoClose: true
    });

    // Lưu reference đến location data
    marker._locationData = location;

    return marker;
  }

  /**
   * Tạo nội dung popup
   * @param {Object} location - Dữ liệu địa điểm
   * @returns {string} HTML
   */
  function _createPopupContent(location) {
    const typeClass = `popup-content__type--${location.type}`;

    return `
      <div class="popup-content">
        <h3 class="popup-content__title">${Utils.escapeHtml(location.name)}</h3>
        <span class="popup-content__type ${typeClass}">
          ${Utils.getLocationIcon(location.type)} ${Utils.escapeHtml(location.typeLabel)}
        </span>
        <p class="popup-content__desc">${Utils.escapeHtml(location.shortDescription)}</p>
        <div class="popup-content__action" data-location-id="${location.id}">
          ${Utils.icon('info', 14)} Xem chi tiết
        </div>
      </div>
    `;
  }

  /**
   * Lấy CSS class cho marker theo loại địa điểm
   * @param {string} type - Loại địa điểm
   * @returns {string}
   */
  function _getMarkerClass(type) {
    switch (type) {
      case Config.LOCATION_TYPES.START:
        return Config.MARKER_CLASSES.START;
      case Config.LOCATION_TYPES.END:
        return Config.MARKER_CLASSES.END;
      case Config.LOCATION_TYPES.STOP:
      default:
        return Config.MARKER_CLASSES.STOP;
    }
  }

  /**
   * Highlight marker (đánh dấu là current)
   * @param {string} locationId - ID địa điểm
   */
  function highlightMarker(locationId) {
    // Bỏ highlight marker cũ
    if (_activeMarkerId && _markers[_activeMarkerId]) {
      _updateMarkerState(_activeMarkerId, 'visited');
      _visitedMarkerIds.add(_activeMarkerId);
    }

    // Highlight marker mới
    if (_markers[locationId]) {
      _updateMarkerState(locationId, 'current');
      _activeMarkerId = locationId;

      // Bounce animation
      _bounceMarker(locationId);
    }
  }

  /**
   * Highlight cả marker xuất phát và đến của một chặng
   * @param {string} fromId - ID điểm xuất phát
   * @param {string} toId - ID điểm đến
   */
  function highlightSegmentMarkers(fromId, toId) {
    // Reset tất cả marker về trạng thái phù hợp
    Object.keys(_markers).forEach(id => {
      if (_visitedMarkerIds.has(id)) {
        _updateMarkerState(id, 'visited');
      } else if (id !== fromId && id !== toId) {
        _updateMarkerState(id, 'default');
      }
    });

    // Highlight from marker (đánh dấu visited vì đã đi qua)
    if (_markers[fromId]) {
      _visitedMarkerIds.add(fromId);
      _updateMarkerState(fromId, 'visited');
    }

    // Highlight to marker (đánh dấu current)
    if (_markers[toId]) {
      _updateMarkerState(toId, 'current');
      _activeMarkerId = toId;
      _bounceMarker(toId);
    }
  }

  /**
   * Cập nhật trạng thái visual của marker
   * @param {string} locationId - ID địa điểm
   * @param {string} state - 'current', 'visited', hoặc 'default'
   */
  function _updateMarkerState(locationId, state) {
    const marker = _markers[locationId];
    if (!marker) return;

    const location = marker._locationData;
    let markerClass = '';
    let extraClass = '';
    let size = 36;

    switch (state) {
      case 'current':
        markerClass = Config.MARKER_CLASSES.CURRENT;
        extraClass = 'marker-pulse';
        size = 44;
        break;
      case 'visited':
        markerClass = Config.MARKER_CLASSES.VISITED;
        size = 36;
        break;
      case 'default':
      default:
        markerClass = _getMarkerClass(location.type);
        size = 36;
        break;
    }

    const newIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-icon ${markerClass} ${extraClass}"
             role="button"
             aria-label="${location.name} - ${location.typeLabel}"
             tabindex="0">
          ${location.order}
        </div>
        <div class="marker-label">${Utils.escapeHtml(location.name)}</div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -(size / 2 + 4)]
    });

    marker.setIcon(newIcon);
  }

  /**
   * Bounce animation cho marker
   * @param {string} locationId - ID địa điểm
   */
  function _bounceMarker(locationId) {
    const marker = _markers[locationId];
    if (!marker) return;

    const el = marker.getElement();
    if (el) {
      const iconEl = el.querySelector('.marker-icon');
      if (iconEl) {
        iconEl.classList.remove('marker-bounce');
        // Force reflow
        void iconEl.offsetWidth;
        iconEl.classList.add('marker-bounce');
      }
    }
  }

  /**
   * Reset tất cả markers về trạng thái ban đầu
   */
  function resetAllMarkers() {
    _activeMarkerId = null;
    _visitedMarkerIds.clear();

    const locations = DataLoader.getLocations();
    locations.forEach(location => {
      _updateMarkerState(location.id, 'default');
    });
  }

  /**
   * Highlight marker đầu tiên (điểm xuất phát)
   */
  function highlightStartMarker() {
    const locations = DataLoader.getLocations();
    if (locations.length > 0) {
      const firstLocation = locations[0];
      _updateMarkerState(firstLocation.id, 'current');
      _activeMarkerId = firstLocation.id;
      _bounceMarker(firstLocation.id);
    }
  }

  /**
   * Lấy marker theo ID
   * @param {string} locationId
   * @returns {L.Marker|null}
   */
  function getMarker(locationId) {
    return _markers[locationId] || null;
  }

  /**
   * Lấy tất cả markers
   * @returns {Object}
   */
  function getAllMarkers() {
    return _markers;
  }

  /**
   * Lấy active marker ID
   * @returns {string|null}
   */
  function getActiveMarkerId() {
    return _activeMarkerId;
  }

  /**
   * Đóng tất cả popups
   */
  function closeAllPopups() {
    Object.values(_markers).forEach(marker => {
      marker.closePopup();
    });
  }

  // Export
  HueNamApp.MarkerManager = {
    createAllMarkers,
    highlightMarker,
    highlightSegmentMarkers,
    resetAllMarkers,
    highlightStartMarker,
    getMarker,
    getAllMarkers,
    getActiveMarkerId,
    closeAllPopups
  };

})();
