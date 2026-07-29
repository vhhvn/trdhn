/**
 * ============================================================
 * PROGRESSMANAGER.JS - Progress Bar & Timeline
 * Bản đồ số Hành trình Lễ rước Điện Huệ Nam
 * ============================================================
 */

(function () {
  'use strict';

  const { Utils, DataLoader } = window.HueNamApp;

  /** Elements */
  let _progressBar = null;
  let _progressFill = null;
  let _progressDots = null;
  let _progressText = null;

  /**
   * Khởi tạo progress bar
   */
  function init() {
    _progressBar = Utils.qs('.progress-bar');
    _progressFill = Utils.qs('.progress-bar__fill');
    _progressDots = Utils.qs('.progress-dots');
    _progressText = Utils.qs('.progress-text');

    _createDots();
    _updateText(0, DataLoader.getTotalSegments());
  }

  /**
   * Tạo các dots trên progress bar
   */
  function _createDots() {
    if (!_progressDots) return;

    const locations = DataLoader.getLocations();
    _progressDots.innerHTML = '';

    locations.forEach((location, index) => {
      const dot = document.createElement('button');
      dot.className = 'progress-dot';
      dot.setAttribute('data-index', index);
      dot.setAttribute('data-label', location.name);
      dot.setAttribute('aria-label', `Điểm ${index + 1}: ${location.name}`);
      dot.setAttribute('role', 'tab');
      dot.setAttribute('tabindex', '0');

      // Click vào dot hiển thị thông tin location
      dot.addEventListener('click', () => {
        _onDotClick(index, location);
      });

      _progressDots.appendChild(dot);
    });

    // Activate dot đầu tiên
    if (locations.length > 0) {
      _progressDots.firstChild.classList.add('active');
    }
  }

  /**
   * Handler khi click vào dot
   * @param {number} index
   * @param {Object} location
   */
  function _onDotClick(index, location) {
    // Emit event cho app.js xử lý
    const event = new CustomEvent('progress-dot-click', {
      detail: { index, location }
    });
    document.dispatchEvent(event);
  }

  /**
   * Cập nhật progress khi chuyển chặng
   * @param {number} currentIndex - Index chặng hiện tại (0-based)
   * @param {number} total - Tổng số chặng
   */
  function update(currentIndex, total) {
    // Cập nhật fill width
    // Chặng 0 = điểm 1→2, nên điểm hoàn thành = currentIndex + 2 / (total + 1)
    const progress = Math.min(((currentIndex + 1) / total) * 100, 100);
    _updateFill(progress);

    // Cập nhật dots
    _updateDots(currentIndex);

    // Cập nhật text
    _updateText(currentIndex + 1, total);
  }

  /**
   * Cập nhật fill bar
   * @param {number} percent - Phần trăm (0-100)
   */
  function _updateFill(percent) {
    if (_progressFill) {
      _progressFill.style.width = `${percent}%`;
    }
  }

  /**
   * Cập nhật trạng thái dots
   * @param {number} currentIndex - Index chặng hiện tại
   */
  function _updateDots(currentIndex) {
    if (!_progressDots) return;

    const dots = _progressDots.querySelectorAll('.progress-dot');

    dots.forEach((dot, index) => {
      dot.classList.remove('active', 'visited');

      if (index <= currentIndex) {
        dot.classList.add('visited');
      }
      // Active dot là điểm đến hiện tại (currentIndex + 1)
      if (index === currentIndex + 1) {
        dot.classList.add('active');
      }
    });

    // Nếu là chặng đầu, active cả dot 0 và 1
    if (currentIndex === 0) {
      if (dots[0]) dots[0].classList.add('visited');
      if (dots[1]) dots[1].classList.add('active');
    }
  }

  /**
   * Cập nhật text hiển thị
   * @param {number} current - Chặng hiện tại
   * @param {number} total - Tổng chặng
   */
  function _updateText(current, total) {
    if (_progressText) {
      if (current === 0) {
        _progressText.textContent = `Sẵn sàng`;
      } else if (current > total) {
        _progressText.textContent = `Hoàn thành!`;
      } else {
        _progressText.textContent = `Chặng ${current}/${total}`;
      }
    }
  }

  /**
   * Hoàn thành - fill 100%
   */
  function complete() {
    _updateFill(100);

    if (_progressDots) {
      const dots = _progressDots.querySelectorAll('.progress-dot');
      dots.forEach(dot => {
        dot.classList.remove('active');
        dot.classList.add('visited');
      });
      if (dots.length > 0) {
        dots[dots.length - 1].classList.add('active');
      }
    }

    if (_progressText) {
      _progressText.textContent = 'Hoàn thành! 🎉';
    }
  }

  /**
   * Reset progress về 0
   */
  function reset() {
    _updateFill(0);

    if (_progressDots) {
      const dots = _progressDots.querySelectorAll('.progress-dot');
      dots.forEach((dot, index) => {
        dot.classList.remove('active', 'visited');
        if (index === 0) {
          dot.classList.add('active');
        }
      });
    }

    _updateText(0, DataLoader.getTotalSegments());
  }

  // Export
  HueNamApp.ProgressManager = {
    init,
    update,
    complete,
    reset
  };

})();
