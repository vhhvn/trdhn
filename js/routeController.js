/**
 * ============================================================
 * ROUTECONTROLLER.JS - Journey Route Management
 * Bản đồ số Hành trình Lễ rước Điện Huệ Nam
 * ============================================================
 */

(function () {
  'use strict';

  const { Config, Utils, DataLoader, Map: MapModule, MarkerManager, Animation } = window.HueNamApp;

  /** Index chặng hiện tại (0-based), -1 = chưa bắt đầu */
  let _currentSegmentIndex = -1;
  /** Trạng thái hành trình */
  let _journeyState = Config.JOURNEY_STATES.IDLE;
  /** Lưu trữ polylines theo index */
  let _polylines = {};
  /** Auto play timer */
  let _autoPlayTimer = null;
  /** Auto play trạng thái */
  let _isAutoPlaying = false;
  /** Callbacks */
  let _onSegmentChange = null;
  let _onJourneyComplete = null;
  let _onStateChange = null;

  /**
   * Khởi tạo route controller
   * @param {Object} callbacks
   * @param {Function} callbacks.onSegmentChange - Khi chặng thay đổi
   * @param {Function} callbacks.onJourneyComplete - Khi hoàn thành
   * @param {Function} callbacks.onStateChange - Khi trạng thái thay đổi
   */
  function init(callbacks = {}) {
    _onSegmentChange = callbacks.onSegmentChange || _onSegmentChange;
    _onJourneyComplete = callbacks.onJourneyComplete || _onJourneyComplete;
    _onStateChange = callbacks.onStateChange || _onStateChange;

    reinitRoute();
  }

  /**
   * Re-initialize routes khi chuyển kỳ lễ hội
   */
  function reinitRoute() {
    _stopAutoPlay();
    _currentSegmentIndex = -1;
    _journeyState = Config.JOURNEY_STATES.IDLE;

    const routeGroup = MapModule.getRouteGroup();
    if (routeGroup) {
      routeGroup.clearLayers();
    }
    _polylines = {};

    // Vẽ toàn bộ tuyến dạng preview (nét đứt mờ)
    _drawPreviewRoutes();

    // Highlight điểm xuất phát
    MarkerManager.highlightStartMarker();
    _emitStateChange();
  }

  /**
   * Vẽ tất cả tuyến dạng preview
   */
  function _drawPreviewRoutes() {
    const segments = DataLoader.getRouteSegments();
    const routeGroup = MapModule.getRouteGroup();
    const theme = Utils.getCurrentTheme();

    segments.forEach((segment, index) => {
      const coords = segment.geometry.coordinates.map(c => [c[1], c[0]]);

      const polyline = L.polyline(coords, {
        color: Utils.getCSSVar('--color-route-unvisited') || '#30363D',
        weight: Config.ROUTE_STYLES.preview.weight,
        opacity: Config.ROUTE_STYLES.preview.opacity,
        dashArray: Config.ROUTE_STYLES.preview.dashArray,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false
      });

      polyline.addTo(routeGroup);
      _polylines[index] = polyline;
    });
  }

  /**
   * Bắt đầu hành trình (nhấn "Bắt đầu hành trình")
   */
  async function startJourney() {
    if (_journeyState === Config.JOURNEY_STATES.ACTIVE) return;

    _journeyState = Config.JOURNEY_STATES.ACTIVE;
    _currentSegmentIndex = -1;
    _emitStateChange();

    // Chuyển đến chặng đầu tiên
    await showNextSegment();
  }

  /**
   * Hiển thị chặng tiếp theo
   * @returns {Promise<boolean>} true nếu còn chặng, false nếu hết
   */
  async function showNextSegment() {
    const totalSegments = DataLoader.getTotalSegments();

    _currentSegmentIndex++;

    // Kiểm tra đã hết chặng chưa
    if (_currentSegmentIndex >= totalSegments) {
      _completeJourney();
      return false;
    }

    const segment = DataLoader.getSegmentByIndex(_currentSegmentIndex);
    if (!segment) return false;

    const props = segment.properties;

    // 1. Dim chặng cũ (nếu có)
    if (_currentSegmentIndex > 0) {
      _dimPreviousSegment(_currentSegmentIndex - 1);
    }

    // 2. Cập nhật polyline thành active style
    await _activateSegment(_currentSegmentIndex);

    // 3. Highlight markers (from → to)
    MarkerManager.highlightSegmentMarkers(props.fromPoint, props.toPoint);

    // 4. Zoom to segment bounds
    _zoomToSegment(_currentSegmentIndex);

    // 5. Emit callback
    if (_onSegmentChange) {
      _onSegmentChange({
        index: _currentSegmentIndex,
        segment: segment,
        fromLocation: DataLoader.getLocationById(props.fromPoint),
        toLocation: DataLoader.getLocationById(props.toPoint),
        isFirst: _currentSegmentIndex === 0,
        isLast: _currentSegmentIndex === totalSegments - 1,
        total: totalSegments
      });
    }

    // 6. Auto play scheduling
    if (_isAutoPlaying) {
      _scheduleAutoPlay();
    }

    return true;
  }

  /**
   * Quay lại chặng trước
   * @returns {Promise<boolean>}
   */
  async function showPreviousSegment() {
    if (_currentSegmentIndex <= 0) return false;

    // Reset chặng hiện tại về unvisited
    _resetSegment(_currentSegmentIndex);

    // Reset marker hiện tại
    _currentSegmentIndex--;

    const segment = DataLoader.getSegmentByIndex(_currentSegmentIndex);
    if (!segment) return false;

    const props = segment.properties;

    // Activate lại chặng trước
    await _activateSegment(_currentSegmentIndex);

    // Highlight markers
    MarkerManager.highlightSegmentMarkers(props.fromPoint, props.toPoint);

    // Zoom
    _zoomToSegment(_currentSegmentIndex);

    // Emit callback
    if (_onSegmentChange) {
      _onSegmentChange({
        index: _currentSegmentIndex,
        segment: segment,
        fromLocation: DataLoader.getLocationById(props.fromPoint),
        toLocation: DataLoader.getLocationById(props.toPoint),
        isFirst: _currentSegmentIndex === 0,
        isLast: _currentSegmentIndex === DataLoader.getTotalSegments() - 1,
        total: DataLoader.getTotalSegments()
      });
    }

    return true;
  }

  /**
   * Activate một segment (chuyển sang active style)
   * @param {number} index
   */
  async function _activateSegment(index) {
    const polyline = _polylines[index];
    if (!polyline) return;

    // Cập nhật style sang active
    polyline.setStyle({
      color: Utils.getCSSVar('--color-route-active') || '#F0A500',
      weight: Config.ROUTE_STYLES.active.weight,
      opacity: Config.ROUTE_STYLES.active.opacity,
      dashArray: null
    });

    // Đưa polyline lên trên
    polyline.bringToFront();

    // Animate vẽ đường
    try {
      await Animation.animatePolylineDraw(polyline);
      Animation.addGlowEffect(polyline);
    } catch (e) {
      // Fallback nếu animation lỗi
      console.warn('Polyline animation error:', e);
    }
  }

  /**
   * Dim chặng đã đi qua
   * @param {number} index
   */
  function _dimPreviousSegment(index) {
    const polyline = _polylines[index];
    if (!polyline) return;

    Animation.removeGlowEffect(polyline);

    polyline.setStyle({
      color: Utils.getCSSVar('--color-route-visited') || '#6B7280',
      weight: Config.ROUTE_STYLES.visited.weight,
      opacity: Config.ROUTE_STYLES.visited.opacity,
      dashArray: null
    });
  }

  /**
   * Reset một segment về preview state
   * @param {number} index
   */
  function _resetSegment(index) {
    const polyline = _polylines[index];
    if (!polyline) return;

    Animation.removeGlowEffect(polyline);
    Animation.removeFlowEffect(polyline);

    polyline.setStyle({
      color: Utils.getCSSVar('--color-route-unvisited') || '#30363D',
      weight: Config.ROUTE_STYLES.preview.weight,
      opacity: Config.ROUTE_STYLES.preview.opacity,
      dashArray: Config.ROUTE_STYLES.preview.dashArray
    });
  }

  /**
   * Zoom bản đồ đến phạm vi chặng
   * @param {number} index
   */
  function _zoomToSegment(index) {
    const segment = DataLoader.getSegmentByIndex(index);
    if (!segment) return;

    const props = segment.properties;
    const fromLoc = DataLoader.getLocationById(props.fromPoint);
    const toLoc = DataLoader.getLocationById(props.toPoint);

    if (fromLoc && toLoc) {
      const bounds = L.latLngBounds(
        [fromLoc.latitude, fromLoc.longitude],
        [toLoc.latitude, toLoc.longitude]
      );

      MapModule.flyToBounds(bounds);
    }
  }

  /**
   * Hoàn thành hành trình
   */
  function _completeJourney() {
    _currentSegmentIndex = DataLoader.getTotalSegments(); // Đặt quá cuối
    _journeyState = Config.JOURNEY_STATES.COMPLETED;
    _stopAutoPlay();
    _emitStateChange();

    if (_onJourneyComplete) {
      _onJourneyComplete();
    }
  }

  /**
   * Reset toàn bộ hành trình
   */
  function resetJourney() {
    _stopAutoPlay();
    _currentSegmentIndex = -1;
    _journeyState = Config.JOURNEY_STATES.IDLE;

    // Reset tất cả polylines
    const totalSegments = DataLoader.getTotalSegments();
    for (let i = 0; i < totalSegments; i++) {
      _resetSegment(i);
    }

    // Reset markers
    MarkerManager.resetAllMarkers();
    MarkerManager.highlightStartMarker();

    // Zoom về tổng quan
    MapModule.fitAllMarkers();

    _emitStateChange();
  }

  /**
   * Xem toàn tuyến (zoom ra để thấy tất cả)
   */
  function viewAllRoute() {
    MapModule.fitAllRoutes();
  }

  /**
   * Bắt đầu auto play
   */
  function startAutoPlay() {
    if (_journeyState === Config.JOURNEY_STATES.COMPLETED) return;

    _isAutoPlaying = true;

    // Nếu chưa bắt đầu, bắt đầu hành trình
    if (_journeyState === Config.JOURNEY_STATES.IDLE) {
      startJourney();
    } else {
      _scheduleAutoPlay();
    }

    _emitStateChange();
  }

  /**
   * Dừng auto play
   */
  function stopAutoPlay() {
    _stopAutoPlay();
    _emitStateChange();
  }

  /**
   * Toggle auto play
   * @returns {boolean} Trạng thái mới
   */
  function toggleAutoPlay() {
    if (_isAutoPlaying) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
    return _isAutoPlaying;
  }

  /**
   * Lên lịch auto play cho chặng tiếp theo
   */
  function _scheduleAutoPlay() {
    _clearAutoPlayTimer();

    const config = DataLoader.getConfig();
    const interval = config.journey.autoPlayInterval || 5000;

    _autoPlayTimer = setTimeout(async () => {
      if (_isAutoPlaying && _journeyState === Config.JOURNEY_STATES.ACTIVE) {
        const hasMore = await showNextSegment();
        if (!hasMore) {
          _stopAutoPlay();
        }
      }
    }, interval);
  }

  /**
   * Xóa timer auto play
   */
  function _clearAutoPlayTimer() {
    if (_autoPlayTimer) {
      clearTimeout(_autoPlayTimer);
      _autoPlayTimer = null;
    }
  }

  /**
   * Dừng hoàn toàn auto play
   */
  function _stopAutoPlay() {
    _isAutoPlaying = false;
    _clearAutoPlayTimer();
  }

  /**
   * Emit state change callback
   */
  function _emitStateChange() {
    if (_onStateChange) {
      _onStateChange({
        state: _journeyState,
        currentIndex: _currentSegmentIndex,
        isAutoPlaying: _isAutoPlaying,
        total: DataLoader.getTotalSegments()
      });
    }
  }

  /**
   * Lấy index chặng hiện tại
   * @returns {number}
   */
  function getCurrentSegmentIndex() {
    return _currentSegmentIndex;
  }

  /**
   * Lấy trạng thái hành trình
   * @returns {string}
   */
  function getJourneyState() {
    return _journeyState;
  }

  /**
   * Kiểm tra auto play
   * @returns {boolean}
   */
  function isAutoPlaying() {
    return _isAutoPlaying;
  }

  /**
   * Kiểm tra có thể đi tiếp không
   * @returns {boolean}
   */
  function canGoNext() {
    return _journeyState === Config.JOURNEY_STATES.ACTIVE &&
      _currentSegmentIndex < DataLoader.getTotalSegments() - 1;
  }

  /**
   * Kiểm tra có thể quay lại không
   * @returns {boolean}
   */
  function canGoPrevious() {
    return _journeyState === Config.JOURNEY_STATES.ACTIVE &&
      _currentSegmentIndex > 0;
  }

  /**
   * Cập nhật màu route khi đổi theme
   */
  function updateRouteColors() {
    const totalSegments = DataLoader.getTotalSegments();

    for (let i = 0; i < totalSegments; i++) {
      const polyline = _polylines[i];
      if (!polyline) continue;

      if (i < _currentSegmentIndex) {
        // Visited
        polyline.setStyle({
          color: Utils.getCSSVar('--color-route-visited') || '#6B7280'
        });
      } else if (i === _currentSegmentIndex) {
        // Active
        polyline.setStyle({
          color: Utils.getCSSVar('--color-route-active') || '#F0A500'
        });
      } else {
        // Unvisited
        polyline.setStyle({
          color: Utils.getCSSVar('--color-route-unvisited') || '#30363D'
        });
      }
    }
  }

  // Export
  HueNamApp.RouteController = {
    init,
    reinitRoute,
    startJourney,
    showNextSegment,
    showPreviousSegment,
    resetJourney,
    viewAllRoute,
    startAutoPlay,
    stopAutoPlay,
    toggleAutoPlay,
    getCurrentSegmentIndex,
    getJourneyState,
    isAutoPlaying,
    canGoNext,
    canGoPrevious,
    updateRouteColors
  };

})();
