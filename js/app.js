/**
 * ============================================================
 * APP.JS - Application Entry Point
 * Bản đồ số Hành trình Lễ rước Điện Huệ Nam
 * ============================================================
 */

(function () {
  'use strict';

  const {
    Config,
    Utils,
    DataLoader,
    Map: MapModule,
    MarkerManager,
    RouteController,
    PanelManager,
    ProgressManager,
    Animation,
    UI,
    EventManager
  } = window.HueNamApp;

  /**
   * Khởi tạo ứng dụng
   */
  async function initApp() {
    console.log('🏛️ Khởi tạo Bản đồ Hành trình Lễ rước Điện Huệ Nam...');

    try {
      // 1. Tải dữ liệu
      await DataLoader.loadAll((progress) => {
        UI.updateLoadingProgress(progress);
      });

      // 2. Khởi tạo bản đồ
      MapModule.init();

      // 3. Khởi tạo UI
      UI.init();

      // 4. Tạo markers
      MarkerManager.createAllMarkers();

      // 5. Khởi tạo panel
      PanelManager.init();

      // 6. Khởi tạo progress bar
      ProgressManager.init();

      // 7. Khởi tạo route controller với callbacks
      RouteController.init({
        onSegmentChange: _handleSegmentChange,
        onJourneyComplete: _handleJourneyComplete,
        onStateChange: _handleStateChange
      });

      // 8. Khởi tạo event handlers
      EventManager.init();

      // 9. Fit bản đồ vào tất cả markers
      setTimeout(() => {
        MapModule.fitAllMarkers();
      }, 500);

      // 10. Hiển thị thông tin điểm xuất phát & cập nhật Season label
      const seasonInfo = DataLoader.getSeasonInfo();
      UI.updateHeaderSeasonLabel(seasonInfo);

      const startLocation = DataLoader.getLocationByOrder(1);
      if (startLocation) {
        PanelManager.showStartInfo(startLocation);
      }

      // 11. Ẩn loading screen & mở Season Modal
      await Utils.delay(Config.TIMING.LOADING_SCREEN_DELAY);
      UI.hideLoadingScreen();
      UI.showSeasonModal();

      console.log('✅ Ứng dụng đã sẵn sàng!');
      console.log(`📍 ${DataLoader.getTotalLocations()} địa điểm | 🗺️ ${DataLoader.getTotalSegments()} chặng`);

    } catch (error) {
      console.error('❌ Lỗi khởi tạo ứng dụng:', error);
      _showError(error);
    }
  }

  /**
   * Thay đổi kỳ lễ hội (Tháng 3 vs Tháng 7)
   * @param {string} seasonId - 'march' hoặc 'july'
   */
  async function changeSeason(seasonId) {
    try {
      const seasonData = await DataLoader.loadSeason(seasonId);
      const seasonInfo = seasonData.season;

      // Reset & Re-render UI & Map layers
      MarkerManager.createAllMarkers();
      ProgressManager.init();
      RouteController.reinitRoute();

      const startLocation = DataLoader.getLocationByOrder(1);
      if (startLocation) {
        PanelManager.showStartInfo(startLocation);
      }

      UI.updateHeaderSeasonLabel(seasonInfo);
      MapModule.fitAllMarkers();

      UI.showToast(`✨ Đã chuyển sang ${seasonInfo.name}`);
    } catch (error) {
      console.error('Lỗi khi chuyển kỳ lễ hội:', error);
      UI.showToast('⚠️ Không thể chuyển kỳ lễ hội');
    }
  }

  /**
   * Callback khi chặng thay đổi
   * @param {Object} data
   */
  function _handleSegmentChange(data) {
    // Cập nhật panel thông tin
    PanelManager.showLocationInfo(data);

    // Cập nhật progress bar
    ProgressManager.update(data.index, data.total);

    // Cập nhật nút điều khiển
    UI.updateControls({
      state: Config.JOURNEY_STATES.ACTIVE,
      currentIndex: data.index,
      isAutoPlaying: RouteController.isAutoPlaying(),
      total: data.total
    });
  }

  /**
   * Callback khi hoàn thành hành trình
   */
  function _handleJourneyComplete() {
    // Hiển thị completion overlay
    setTimeout(() => {
      UI.showCompletion();
    }, Config.TIMING.COMPLETION_DELAY);

    // Cập nhật progress
    ProgressManager.complete();

    // Cập nhật controls
    UI.updateControls({
      state: Config.JOURNEY_STATES.COMPLETED,
      currentIndex: DataLoader.getTotalSegments(),
      isAutoPlaying: false,
      total: DataLoader.getTotalSegments()
    });

    // Zoom ra toàn tuyến
    setTimeout(() => {
      MapModule.fitAllRoutes();
    }, 500);
  }

  /**
   * Callback khi trạng thái hành trình thay đổi
   * @param {Object} state
   */
  function _handleStateChange(state) {
    UI.updateControls(state);
  }

  /**
   * Hiển thị lỗi
   * @param {Error} error
   */
  function _showError(error) {
    const loadingScreen = Utils.qs('.loading-screen');
    if (loadingScreen) {
      const title = Utils.qs('.loading-screen__title', loadingScreen);
      const text = Utils.qs('.loading-screen__text', loadingScreen);
      const icon = Utils.qs('.loading-screen__icon', loadingScreen);

      if (icon) icon.textContent = '⚠️';
      if (title) title.textContent = 'Không thể tải ứng dụng';
      if (text) text.textContent = `Lỗi: ${error.message}. Vui lòng tải lại trang.`;

      const bar = Utils.qs('.loading-bar', loadingScreen);
      if (bar) bar.style.display = 'none';
    }
  }

  // Export
  HueNamApp.App = {
    changeSeason
  };

  // Khởi chạy khi DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
