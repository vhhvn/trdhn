/**
 * ============================================================
 * PANELMANAGER.JS - Info Panel & Bottom Sheet Management
 * Bản đồ số Hành trình Lễ rước Điện Huệ Nam
 * ============================================================
 */

(function () {
  'use strict';

  const { Utils } = window.HueNamApp;

  /** Elements */
  let _panel = null;
  let _panelBody = null;
  let _bottomSheet = null;
  let _bottomSheetBody = null;
  let _welcomeEl = null;
  let _locationEl = null;

  /** Trạng thái bottom sheet */
  let _sheetState = 'collapsed'; // collapsed, half, expanded
  let _touchStartY = 0;
  let _touchCurrentY = 0;

  /**
   * Khởi tạo panel manager
   */
  function init() {
    _panel = Utils.qs('.info-panel');
    _panelBody = Utils.qs('.info-panel__body');
    _bottomSheet = Utils.qs('.bottom-sheet');
    _bottomSheetBody = Utils.qs('.bottom-sheet__body');

    // Khởi tạo touch events cho bottom sheet
    _initBottomSheetTouch();

    // Hiển thị welcome state
    showWelcome();
  }

  /**
   * Hiển thị welcome state
   */
  function showWelcome() {
    const welcomeHTML = `
      <div class="panel-welcome fade-in">
        <div class="panel-welcome__icon">🏛️</div>
        <h2 class="panel-welcome__title">Chào mừng bạn</h2>
        <p class="panel-welcome__text">
          Nhấn <strong>"Bắt đầu hành trình"</strong> để khám phá tuyến rước 
          Điện Huệ Nam theo từng chặng trên sông Hương.
        </p>
      </div>
    `;

    _updateContent(welcomeHTML);
  }

  /**
   * Hiển thị thông tin địa điểm
   * @param {Object} data - Dữ liệu segment change
   */
  function showLocationInfo(data) {
    const { toLocation, segment, index, total } = data;
    if (!toLocation) return;

    const props = segment.properties;
    const badgeClass = `panel-location__badge--${toLocation.type}`;
    const transportIcon = Utils.getTransportIcon(props.transportType);

    const html = `
      <div class="panel-location active fade-in-up">
        <!-- Segment info bar -->
        <div class="segment-info">
          <div class="segment-info__route">
            <span class="segment-info__route-dot segment-info__route-dot--from"></span>
            <span>${Utils.escapeHtml(props.fromName)}</span>
            <span class="segment-info__route-arrow">→</span>
            <span class="segment-info__route-dot segment-info__route-dot--to"></span>
            <span>${Utils.escapeHtml(props.toName)}</span>
          </div>
          <div class="segment-info__details">
            <span class="segment-info__detail">
              ${transportIcon} ${Utils.escapeHtml(props.transportLabel)}
            </span>
            <span class="segment-info__detail">
              ${Utils.icon('navigation', 14)} ${Utils.escapeHtml(props.distance)}
            </span>
            <span class="segment-info__detail">
              ${Utils.icon('clock', 14)} ${Utils.escapeHtml(props.estimatedTime)}
            </span>
          </div>
        </div>

        <!-- Location badge -->
        <span class="panel-location__badge ${badgeClass}">
          ${Utils.getLocationIcon(toLocation.type)} ${Utils.escapeHtml(toLocation.typeLabel)}
        </span>

        <!-- Location name -->
        <h2 class="panel-location__name">${Utils.escapeHtml(toLocation.name)}</h2>

        <!-- Address -->
        <div class="panel-location__address">
          ${Utils.icon('map-pin', 14)}
          <span>${Utils.escapeHtml(toLocation.address)}</span>
        </div>

        <!-- Image -->
        <div class="panel-location__image-wrapper">
          ${toLocation.image ? 
            `<img class="panel-location__image" 
                  src="${Utils.escapeHtml(toLocation.image)}" 
                  alt="Hình ảnh ${Utils.escapeHtml(toLocation.name)}"
                  loading="lazy"
                  onerror="this.parentElement.innerHTML='${_getPlaceholderHTML()}'">` :
            `<div class="panel-location__image-placeholder">
              ${Utils.icon('image', 48)}
              <span>Chưa có hình ảnh</span>
            </div>`
          }
        </div>

        <!-- Description -->
        <div class="panel-location__section">
          <h3 class="panel-location__section-title">
            ${Utils.icon('book', 18)} Giới thiệu
          </h3>
          <p class="panel-location__section-text">${Utils.escapeHtml(toLocation.fullDescription)}</p>
        </div>

        <!-- Festival Role -->
        ${toLocation.festivalRole ? `
        <div class="panel-location__section">
          <h3 class="panel-location__section-title">
            ${Utils.icon('flag', 18)} Vai trò trong lễ rước
          </h3>
          <p class="panel-location__section-text">${Utils.escapeHtml(toLocation.festivalRole)}</p>
        </div>
        ` : ''}

        <!-- Ritual -->
        ${toLocation.ritual ? `
        <div class="panel-location__section">
          <h3 class="panel-location__section-title">
            ${Utils.icon('star', 18)} Nghi lễ
          </h3>
          <p class="panel-location__section-text">${Utils.escapeHtml(toLocation.ritual)}</p>
        </div>
        ` : ''}

        <!-- Route segment description -->
        ${props.description ? `
        <div class="panel-location__section">
          <h3 class="panel-location__section-title">
            ${Utils.icon('navigation', 18)} Về chặng đường
          </h3>
          <p class="panel-location__section-text">${Utils.escapeHtml(props.description)}</p>
        </div>
        ` : ''}

        <!-- Ritual Activity during route -->
        ${props.ritualActivity ? `
        <div class="panel-location__section">
          <h3 class="panel-location__section-title">
            ${Utils.icon('anchor', 18)} Hoạt động trên hành trình
          </h3>
          <p class="panel-location__section-text">${Utils.escapeHtml(props.ritualActivity)}</p>
        </div>
        ` : ''}

        <!-- Audio player -->
        ${toLocation.audio ? `
        <div class="panel-location__audio">
          <button class="audio-play-btn" aria-label="Nghe thuyết minh" data-audio="${Utils.escapeHtml(toLocation.audio)}">
            ${Utils.icon('play', 18)}
          </button>
          <div class="audio-info">
            <div class="audio-info__title">Nghe thuyết minh</div>
            <div class="audio-info__duration">${Utils.escapeHtml(toLocation.name)}</div>
          </div>
        </div>
        ` : ''}

        <!-- Source -->
        ${toLocation.source ? `
        <div class="panel-location__source">
          📋 Nguồn: ${Utils.escapeHtml(toLocation.source)}
        </div>
        ` : ''}
      </div>
    `;

    _updateContent(html);

    // Trên mobile, mở bottom sheet ra half
    if (Utils.isMobile()) {
      _setSheetState('half');
    }
  }

  /**
   * Hiển thị thông tin cho trạng thái ban đầu (điểm xuất phát)
   * @param {Object} startLocation - Địa điểm xuất phát
   */
  function showStartInfo(startLocation) {
    if (!startLocation) return;

    const badgeClass = `panel-location__badge--${startLocation.type || 'start'}`;

    const html = `
      <div class="panel-location active fade-in-up">
        <span class="panel-location__badge ${badgeClass}">
          ${Utils.getLocationIcon(startLocation.type || 'start')} ${Utils.escapeHtml(startLocation.typeLabel)}
        </span>

        <h2 class="panel-location__name">${Utils.escapeHtml(startLocation.name)}</h2>

        <div class="panel-location__address">
          ${Utils.icon('map-pin', 14)}
          <span>${Utils.escapeHtml(startLocation.address)}</span>
        </div>

        <div class="panel-location__image-wrapper">
          ${startLocation.image ?
            `<img class="panel-location__image" 
                  src="${Utils.escapeHtml(startLocation.image)}" 
                  alt="Hình ảnh ${Utils.escapeHtml(startLocation.name)}"
                  loading="lazy"
                  onerror="this.parentElement.innerHTML='${_getPlaceholderHTML()}'">` :
            `<div class="panel-location__image-placeholder">
              ${Utils.icon('image', 48)}
              <span>Chưa có hình ảnh</span>
            </div>`
          }
        </div>

        <div class="panel-location__section">
          <h3 class="panel-location__section-title">
            ${Utils.icon('book', 18)} Giới thiệu
          </h3>
          <p class="panel-location__section-text">${Utils.escapeHtml(startLocation.fullDescription)}</p>
        </div>

        ${startLocation.festivalRole ? `
        <div class="panel-location__section">
          <h3 class="panel-location__section-title">
            ${Utils.icon('flag', 18)} Vai trò trong lễ rước
          </h3>
          <p class="panel-location__section-text">${Utils.escapeHtml(startLocation.festivalRole)}</p>
        </div>
        ` : ''}

        ${startLocation.ritual ? `
        <div class="panel-location__section">
          <h3 class="panel-location__section-title">
            ${Utils.icon('star', 18)} Nghi lễ
          </h3>
          <p class="panel-location__section-text">${Utils.escapeHtml(startLocation.ritual)}</p>
        </div>
        ` : ''}

        ${startLocation.source ? `
        <div class="panel-location__source">
          📋 Nguồn: ${Utils.escapeHtml(startLocation.source)}
        </div>
        ` : ''}
      </div>
    `;

    _updateContent(html);

    // Trên mobile, mở bottom sheet ra half
    if (Utils.isMobile()) {
      _setSheetState('half');
    }
  }

  /**
   * Cập nhật nội dung panel (cả desktop và mobile)
   * @param {string} html
   */
  function _updateContent(html) {
    if (_panelBody) {
      _panelBody.innerHTML = html;
      _panelBody.scrollTop = 0;
    }

    if (_bottomSheetBody) {
      _bottomSheetBody.innerHTML = html;
      _bottomSheetBody.scrollTop = 0;
    }
  }

  /**
   * Lấy placeholder HTML cho ảnh lỗi
   * @returns {string}
   */
  function _getPlaceholderHTML() {
    // Escaped cho dùng trong onerror attribute
    return '<div class=\\"panel-location__image-placeholder\\"><span>Không tải được hình ảnh</span></div>';
  }

  /**
   * Khởi tạo touch events cho bottom sheet
   */
  function _initBottomSheetTouch() {
    if (!_bottomSheet) return;

    const handle = Utils.qs('.bottom-sheet__handle', _bottomSheet);
    if (!handle) return;

    handle.addEventListener('touchstart', _onTouchStart, { passive: true });
    handle.addEventListener('touchmove', _onTouchMove, { passive: false });
    handle.addEventListener('touchend', _onTouchEnd, { passive: true });

    // Click vào header cũng toggle
    const header = Utils.qs('.bottom-sheet__header', _bottomSheet);
    if (header) {
      header.addEventListener('click', () => {
        if (_sheetState === 'collapsed') {
          _setSheetState('half');
        } else if (_sheetState === 'half') {
          _setSheetState('expanded');
        } else {
          _setSheetState('collapsed');
        }
      });
    }

    // Toggle button
    const toggleBtn = Utils.qs('.bottom-sheet__toggle', _bottomSheet);
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (_sheetState === 'expanded') {
          _setSheetState('collapsed');
        } else {
          _setSheetState('expanded');
        }
      });
    }
  }

  /**
   * Touch start handler
   * @param {TouchEvent} e
   */
  function _onTouchStart(e) {
    _touchStartY = e.touches[0].clientY;
    _touchCurrentY = _touchStartY;

    if (_bottomSheet) {
      _bottomSheet.style.transition = 'none';
    }
  }

  /**
   * Touch move handler
   * @param {TouchEvent} e
   */
  function _onTouchMove(e) {
    _touchCurrentY = e.touches[0].clientY;
    const deltaY = _touchCurrentY - _touchStartY;

    // Chỉ cho phép kéo xuống hoặc lên
    if (Math.abs(deltaY) > 10) {
      e.preventDefault();
    }
  }

  /**
   * Touch end handler
   */
  function _onTouchEnd() {
    const deltaY = _touchCurrentY - _touchStartY;

    if (_bottomSheet) {
      _bottomSheet.style.transition = '';
    }

    // Threshold: 50px
    if (deltaY < -50) {
      // Kéo lên
      if (_sheetState === 'collapsed') {
        _setSheetState('half');
      } else if (_sheetState === 'half') {
        _setSheetState('expanded');
      }
    } else if (deltaY > 50) {
      // Kéo xuống
      if (_sheetState === 'expanded') {
        _setSheetState('half');
      } else if (_sheetState === 'half') {
        _setSheetState('collapsed');
      }
    }
  }

  /**
   * Set trạng thái bottom sheet
   * @param {string} state - 'collapsed', 'half', 'expanded'
   */
  function _setSheetState(state) {
    if (!_bottomSheet) return;

    _bottomSheet.classList.remove('collapsed', 'half', 'expanded');
    _bottomSheet.classList.add(state);
    _sheetState = state;

    // Cập nhật toggle text
    const toggleBtn = Utils.qs('.bottom-sheet__toggle', _bottomSheet);
    if (toggleBtn) {
      toggleBtn.textContent = state === 'expanded' ? 'Thu gọn' : 'Xem chi tiết ▲';
    }
  }

  /**
   * Đóng panel (desktop)
   */
  function hidePanel() {
    if (_panel) {
      _panel.classList.add('hidden');
    }
    if (_bottomSheet) {
      _setSheetState('collapsed');
    }
  }

  /**
   * Mở panel (desktop)
   */
  function showPanel() {
    if (_panel) {
      _panel.classList.remove('hidden');
    }
  }

  /**
   * Kiểm tra panel đang mở không
   * @returns {boolean}
   */
  function isPanelVisible() {
    if (_panel) {
      return !_panel.classList.contains('hidden');
    }
    return false;
  }

  /**
   * Collapse bottom sheet
   */
  function collapseSheet() {
    _setSheetState('collapsed');
  }

  // Export
  HueNamApp.PanelManager = {
    init,
    showWelcome,
    showLocationInfo,
    showStartInfo,
    hidePanel,
    showPanel,
    isPanelVisible,
    collapseSheet
  };

})();
