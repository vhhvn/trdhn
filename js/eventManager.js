/**
 * ============================================================
 * EVENTMANAGER.JS - Event Handlers & Keyboard Navigation
 * Bản đồ số Hành trình Lễ rước Điện Huệ Nam
 * ============================================================
 */

(function () {
  'use strict';

  const { Config, Utils, Map: MapModule, RouteController, PanelManager } = window.HueNamApp;

  /**
   * Khởi tạo tất cả event handlers
   */
  function init() {
    _initJourneyControls();
    _initKeyboardNavigation();
    _initResizeHandler();
    _initPopupClickHandler();
    _initFullscreenHandler();
    _initProgressDotHandler();
  }

  /**
   * Khởi tạo nút điều khiển hành trình
   */
  function _initJourneyControls() {
    // Nút tiếp theo / bắt đầu / bắt đầu lại
    const nextBtn = Utils.qs('#btn-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', _handleNextClick);
    }

    // Nút quay lại
    const prevBtn = Utils.qs('#btn-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', _handlePrevClick);
    }

    // Nút xem toàn tuyến
    const viewAllBtn = Utils.qs('#btn-view-all');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', _handleViewAllClick);
    }

    // Nút auto play
    const autoBtn = Utils.qs('#btn-auto-play');
    if (autoBtn) {
      autoBtn.addEventListener('click', _handleAutoPlayClick);
    }

    // Nút trong completion overlay
    const restartBtn = Utils.qs('#btn-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', _handleRestartClick);
    }

    const viewAllCompleteBtn = Utils.qs('#btn-view-all-complete');
    if (viewAllCompleteBtn) {
      viewAllCompleteBtn.addEventListener('click', _handleViewAllCompleteClick);
    }
  }

  /**
   * Handler nút Next / Start / Restart
   */
  async function _handleNextClick() {
    const state = RouteController.getJourneyState();
    const { JOURNEY_STATES } = Config;

    switch (state) {
      case JOURNEY_STATES.IDLE:
        await RouteController.startJourney();
        break;

      case JOURNEY_STATES.ACTIVE:
        await RouteController.showNextSegment();
        break;

      case JOURNEY_STATES.COMPLETED:
        HueNamApp.UI.hideCompletion();
        RouteController.resetJourney();
        PanelManager.showWelcome();
        HueNamApp.ProgressManager.reset();
        break;
    }
  }

  /**
   * Handler nút Previous
   */
  async function _handlePrevClick() {
    await RouteController.showPreviousSegment();
  }

  /**
   * Handler nút View All
   */
  function _handleViewAllClick() {
    RouteController.viewAllRoute();
  }

  /**
   * Handler nút Auto Play
   */
  function _handleAutoPlayClick() {
    const isPlaying = RouteController.toggleAutoPlay();
    HueNamApp.UI.showToast(
      isPlaying ? '▶️ Tự động chuyển chặng' : '⏸️ Đã tắt tự động'
    );
  }

  /**
   * Handler nút Restart (trong completion overlay)
   */
  function _handleRestartClick() {
    HueNamApp.UI.hideCompletion();
    RouteController.resetJourney();
    PanelManager.showWelcome();
    HueNamApp.ProgressManager.reset();
  }

  /**
   * Handler nút View All (trong completion overlay)
   */
  function _handleViewAllCompleteClick() {
    HueNamApp.UI.hideCompletion();
    RouteController.viewAllRoute();
  }

  /**
   * Khởi tạo keyboard navigation
   */
  function _initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Bỏ qua nếu đang focus vào input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowRight':
        case 'n':
        case 'N':
          e.preventDefault();
          _handleNextClick();
          break;

        case 'ArrowLeft':
        case 'p':
        case 'P':
          e.preventDefault();
          _handlePrevClick();
          break;

        case 'a':
        case 'A':
          e.preventDefault();
          _handleAutoPlayClick();
          break;

        case 'v':
        case 'V':
          e.preventDefault();
          _handleViewAllClick();
          break;

        case 'r':
        case 'R':
          e.preventDefault();
          if (RouteController.getJourneyState() === Config.JOURNEY_STATES.COMPLETED) {
            _handleRestartClick();
          }
          break;

        case 't':
        case 'T':
          e.preventDefault();
          HueNamApp.UI.toggleTheme();
          break;

        case 'f':
        case 'F':
          e.preventDefault();
          MapModule.toggleFullscreen();
          break;

        case 'Escape':
          // Đóng completion overlay nếu đang mở
          HueNamApp.UI.hideCompletion();
          // Collapse bottom sheet trên mobile
          PanelManager.collapseSheet();
          break;
      }
    });
  }

  /**
   * Khởi tạo resize handler
   */
  function _initResizeHandler() {
    const handleResize = Utils.debounce(() => {
      MapModule.invalidateSize();

      // Toggle panel/bottom sheet visibility
      const isMob = Utils.isMobile();
      const panel = Utils.qs('.info-panel');
      const sheet = Utils.qs('.bottom-sheet');

      if (panel) {
        panel.style.display = isMob ? 'none' : '';
      }
      if (sheet) {
        sheet.style.display = isMob ? '' : 'none';
      }
    }, 250);

    window.addEventListener('resize', handleResize);
  }

  /**
   * Khởi tạo handler cho click vào popup "Xem chi tiết" và hình ảnh marker trên bản đồ
   */
  function _initPopupClickHandler() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.popup-content__action') || 
                     e.target.closest('.marker-thumb-container') ||
                     e.target.closest('.marker-icon');
      if (target) {
        const locationId = target.getAttribute('data-location-id');
        if (locationId) {
          const location = HueNamApp.DataLoader.getLocationById(locationId);
          if (location) {
            HueNamApp.MarkerManager.highlightMarker(location.id);
            PanelManager.showStartInfo(location);
            PanelManager.showPanel();
            MapModule.flyTo([location.latitude, location.longitude]);
          }
        }
      }
    });
  }

  /**
   * Khởi tạo handler cho fullscreen change
   */
  function _initFullscreenHandler() {
    document.addEventListener('fullscreenchange', () => {
      setTimeout(() => {
        MapModule.invalidateSize();
      }, 300);
    });
  }

  /**
   * Khởi tạo handler cho progress dot click
   */
  function _initProgressDotHandler() {
    document.addEventListener('progress-dot-click', (e) => {
      const { location } = e.detail;
      if (location) {
        // Fly to location
        MapModule.flyTo([location.latitude, location.longitude], 15);

        // Hiển thị thông tin
        PanelManager.showStartInfo(location);
        PanelManager.showPanel();
      }
    });
  }

  // Export
  HueNamApp.EventManager = {
    init
  };

})();
