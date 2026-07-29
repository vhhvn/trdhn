/**
 * ============================================================
 * UI.JS - Theme Toggle, Toast & UI State Management
 * Bản đồ số Hành trình Lễ rước Điện Huệ Nam
 * ============================================================
 */

(function () {
  'use strict';

  const { Config, Utils, Map: MapModule, RouteController } = window.HueNamApp;

  /** Trạng thái theme hiện tại */
  let _currentTheme = 'dark';
  /** Toast queue */
  let _toastQueue = [];
  let _toastTimer = null;
  /** Loading screen element */
  let _loadingScreen = null;
  /** Completion overlay */
  let _completionOverlay = null;

  /** Season Modal element */
  let _seasonModal = null;

  /**
   * Khởi tạo UI manager
   */
  function init() {
    _loadingScreen = Utils.qs('.loading-screen');
    _completionOverlay = Utils.qs('.completion-overlay');
    _seasonModal = Utils.qs('#season-modal');

    // Khôi phục theme từ localStorage
    const savedTheme = Utils.loadFromStorage('theme', Config.DEFAULT_CONFIG.theme.default);
    setTheme(savedTheme);

    // Khởi tạo nút theme toggle
    _initThemeToggle();

    // Khởi tạo các map overlay buttons
    _initMapOverlayButtons();

    // Khởi tạo Season Modal selection UI
    _initSeasonModalUI();
  }

  /**
   * Khởi tạo Season Selector UI
   */
  function _initSeasonModalUI() {
    if (!_seasonModal) return;

    const cards = Utils.qsa('.season-card-btn', _seasonModal);
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });

    const confirmBtn = Utils.qs('#btn-confirm-season', _seasonModal);
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        const activeCard = Utils.qs('.season-card-btn.active', _seasonModal);
        const selectedSeason = activeCard ? activeCard.getAttribute('data-season') : 'march';
        hideSeasonModal();

        // Chuyển mùa nếu khác mùa hiện tại
        const currentSeason = HueNamApp.DataLoader.getCurrentSeasonId();
        if (selectedSeason !== currentSeason) {
          await HueNamApp.App.changeSeason(selectedSeason);
        }
      });
    }

    const switchBtn = Utils.qs('#btn-switch-season');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        const currentSeason = HueNamApp.DataLoader.getCurrentSeasonId();
        const nextSeason = currentSeason === 'march' ? 'july' : 'march';
        HueNamApp.App.changeSeason(nextSeason);
      });
    }
  }

  function showSeasonModal() {
    if (_seasonModal) _seasonModal.classList.add('active');
  }

  function hideSeasonModal() {
    if (_seasonModal) _seasonModal.classList.remove('active');
  }

  function updateHeaderSeasonLabel(seasonInfo) {
    const label = Utils.qs('#header-season-label');
    const btnText = Utils.qs('#season-btn-text');

    if (label && seasonInfo) {
      label.textContent = `Đang xem: ${seasonInfo.name}`;
    }
    if (btnText && seasonInfo) {
      btnText.textContent = seasonInfo.id === 'march' ? '🌸 Tháng 3' : '🌾 Tháng 7';
    }
  }

  /**
   * Khởi tạo nút theme toggle
   */
  function _initThemeToggle() {
    const themeBtn = Utils.qs('#btn-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        toggleTheme();
      });
      _updateThemeButton();
    }
  }

  /**
   * Set theme
   * @param {string} theme - 'dark' hoặc 'light'
   */
  function setTheme(theme) {
    _currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    Utils.saveToStorage('theme', theme);

    // Cập nhật map tile layer
    if (MapModule.getMap()) {
      MapModule.switchTheme(theme);
    }

    // Cập nhật route colors
    if (RouteController.getJourneyState() !== Config.JOURNEY_STATES.IDLE) {
      RouteController.updateRouteColors();
    }

    _updateThemeButton();
  }

  /**
   * Toggle theme
   */
  function toggleTheme() {
    const newTheme = _currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);

    // Animation
    const themeBtn = Utils.qs('#btn-theme-toggle');
    if (themeBtn) {
      themeBtn.classList.add('theme-switching');
      setTimeout(() => {
        themeBtn.classList.remove('theme-switching');
      }, 500);
    }

    showToast(newTheme === 'dark' ? '🌙 Chế độ tối' : '☀️ Chế độ sáng');
  }

  /**
   * Cập nhật icon nút theme
   */
  function _updateThemeButton() {
    const themeBtn = Utils.qs('#btn-theme-toggle');
    if (!themeBtn) return;

    themeBtn.innerHTML = _currentTheme === 'dark'
      ? Utils.icon('sun', 20)
      : Utils.icon('moon', 20);
    themeBtn.setAttribute('aria-label',
      _currentTheme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'
    );
    themeBtn.setAttribute('aria-pressed', 'false');
  }

  /**
   * Khởi tạo các nút trên map overlay
   */
  function _initMapOverlayButtons() {
    // Fullscreen button
    const fullscreenBtn = Utils.qs('#btn-fullscreen');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        MapModule.toggleFullscreen();
        const isFs = MapModule.isFullscreen();
        fullscreenBtn.innerHTML = isFs
          ? Utils.icon('minimize', 18)
          : Utils.icon('maximize', 18);
        fullscreenBtn.setAttribute('aria-label',
          isFs ? 'Thoát toàn màn hình' : 'Toàn màn hình'
        );
      });
    }

    // Locate button
    const locateBtn = Utils.qs('#btn-locate');
    if (locateBtn) {
      locateBtn.addEventListener('click', () => {
        MapModule.locateUser();
        showToast('📍 Đang xác định vị trí...');
      });
    }
  }

  /**
   * Hiển thị toast notification
   * @param {string} message - Nội dung
   * @param {number} [duration] - Thời gian (ms)
   */
  function showToast(message, duration) {
    const container = Utils.qs('.toast-container');
    if (!container) return;

    const toastDuration = duration || Config.TIMING.TOAST_DURATION;

    const toast = Utils.createElement(`
      <div class="toast toast-enter" role="alert" aria-live="polite">
        <span class="toast__text">${message}</span>
      </div>
    `);

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-exit');
      setTimeout(() => {
        toast.remove();
      }, Config.TIMING.TOAST_FADE_DURATION);
    }, toastDuration);
  }

  /**
   * Cập nhật loading screen
   * @param {Object} progress - Tiến trình
   * @param {number} progress.percent
   * @param {string} progress.label
   */
  function updateLoadingProgress(progress) {
    if (!_loadingScreen) return;

    const fill = Utils.qs('.loading-bar__fill', _loadingScreen);
    const text = Utils.qs('.loading-screen__text', _loadingScreen);

    if (fill) {
      fill.style.width = `${progress.percent}%`;
    }
    if (text) {
      text.textContent = progress.label;
    }
  }

  /**
   * Ẩn loading screen
   */
  function hideLoadingScreen() {
    if (_loadingScreen) {
      _loadingScreen.classList.add('hidden');
      // Xóa khỏi DOM sau transition
      setTimeout(() => {
        _loadingScreen.style.display = 'none';
      }, 500);
    }
  }

  /**
   * Hiển thị completion overlay
   */
  function showCompletion() {
    if (!_completionOverlay) return;

    _completionOverlay.classList.add('active');

    // Animation celebration
    const card = Utils.qs('.completion-card', _completionOverlay);
    if (card) {
      HueNamApp.Animation.playCelebration(card);
    }
  }

  /**
   * Ẩn completion overlay
   */
  function hideCompletion() {
    if (_completionOverlay) {
      _completionOverlay.classList.remove('active');
    }
  }

  /**
   * Cập nhật text và trạng thái các nút điều khiển
   * @param {Object} state - Trạng thái hành trình
   */
  function updateControls(state) {
    const nextBtn = Utils.qs('#btn-next');
    const prevBtn = Utils.qs('#btn-prev');
    const autoBtn = Utils.qs('#btn-auto-play');

    if (!nextBtn) return;

    const DataLoader = HueNamApp.DataLoader;
    const { JOURNEY_STATES, BUTTON_LABELS } = Config;

    switch (state.state) {
      case JOURNEY_STATES.IDLE:
        nextBtn.innerHTML = `${Utils.icon('play', 18)} <span>${BUTTON_LABELS.START}</span>`;
        nextBtn.disabled = false;
        if (prevBtn) prevBtn.disabled = true;
        if (autoBtn) {
          autoBtn.classList.remove('active');
          autoBtn.disabled = false;
          autoBtn.innerHTML = `${Utils.icon('play', 18)} <span class="btn__text-mobile-hide">${BUTTON_LABELS.AUTO_PLAY}</span>`;
        }
        break;

      case JOURNEY_STATES.ACTIVE: {
        const totalSegments = DataLoader ? DataLoader.getTotalSegments() : state.total || 5;
        const nextIndex = state.currentIndex + 1;

        if (nextIndex < totalSegments) {
          const nextSegment = DataLoader ? DataLoader.getSegmentByIndex(nextIndex) : null;
          const nextName = nextSegment ? nextSegment.properties.toName : '';
          nextBtn.innerHTML = `${Utils.icon('chevron-right', 18)} <span>${BUTTON_LABELS.NEXT_PREFIX}<span class="btn__text-mobile-hide">${Utils.escapeHtml(nextName)}</span></span>`;
        } else {
          nextBtn.innerHTML = `${Utils.icon('flag', 18)} <span>Hoàn thành hành trình</span>`;
        }

        nextBtn.disabled = false;
        if (prevBtn) prevBtn.disabled = state.currentIndex <= 0;

        if (autoBtn) {
          autoBtn.disabled = false;
          if (state.isAutoPlaying) {
            autoBtn.classList.add('active');
            autoBtn.innerHTML = `${Utils.icon('pause', 18)} <span class="btn__text-mobile-hide">${BUTTON_LABELS.PAUSE}</span>`;
          } else {
            autoBtn.classList.remove('active');
            autoBtn.innerHTML = `${Utils.icon('play', 18)} <span class="btn__text-mobile-hide">${BUTTON_LABELS.AUTO_PLAY}</span>`;
          }
        }
        break;
      }

      case JOURNEY_STATES.COMPLETED:
        nextBtn.innerHTML = `${Utils.icon('refresh', 18)} <span>${BUTTON_LABELS.RESTART}</span>`;
        nextBtn.disabled = false;
        if (prevBtn) prevBtn.disabled = true;
        if (autoBtn) {
          autoBtn.classList.remove('active');
          autoBtn.disabled = true;
        }
        break;
    }
  }

  /**
   * Lấy theme hiện tại
   * @returns {string}
   */
  function getTheme() {
    return _currentTheme;
  }

  // Export
  HueNamApp.UI = {
    init,
    setTheme,
    toggleTheme,
    getTheme,
    showToast,
    updateLoadingProgress,
    hideLoadingScreen,
    showCompletion,
    hideCompletion,
    showSeasonModal,
    hideSeasonModal,
    updateHeaderSeasonLabel,
    updateControls
  };

})();
