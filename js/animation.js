/**
 * ============================================================
 * ANIMATION.JS - Polyline Drawing & Effect Animations
 * Bản đồ số Hành trình Lễ rước Điện Huệ Nam
 * ============================================================
 */

(function () {
  'use strict';

  const { Utils, DataLoader } = window.HueNamApp;

  /**
   * Animate polyline drawing effect
   * Vẽ đường từ từ bằng cách thay đổi stroke-dashoffset
   * @param {L.Polyline} polyline - Polyline cần animate
   * @param {number} [duration] - Thời gian (ms)
   * @returns {Promise<void>}
   */
  function animatePolylineDraw(polyline, duration) {
    const config = DataLoader.getConfig();
    const drawDuration = duration || config.journey.polylineDrawDuration || 2000;

    return new Promise((resolve) => {
      const pathElement = polyline.getElement();
      if (!pathElement) {
        resolve();
        return;
      }

      // Lấy tổng chiều dài path
      const totalLength = pathElement.getTotalLength();

      // Set dash array và offset ban đầu
      pathElement.style.strokeDasharray = totalLength;
      pathElement.style.strokeDashoffset = totalLength;
      pathElement.style.transition = 'none';

      // Force reflow
      void pathElement.offsetWidth;

      // Animate
      pathElement.style.transition = `stroke-dashoffset ${drawDuration}ms ease-in-out`;
      pathElement.style.strokeDashoffset = '0';

      // Resolve sau khi animation hoàn thành
      setTimeout(() => {
        // Xóa dash styles để polyline hiển thị bình thường
        pathElement.style.strokeDasharray = '';
        pathElement.style.strokeDashoffset = '';
        pathElement.style.transition = '';
        resolve();
      }, drawDuration);
    });
  }

  /**
   * Fade in polyline
   * @param {L.Polyline} polyline
   * @param {number} [duration=500]
   * @returns {Promise<void>}
   */
  function fadeInPolyline(polyline, duration = 500) {
    return new Promise((resolve) => {
      const pathElement = polyline.getElement();
      if (!pathElement) {
        resolve();
        return;
      }

      pathElement.style.opacity = '0';
      pathElement.style.transition = `opacity ${duration}ms ease-in-out`;

      void pathElement.offsetWidth;

      pathElement.style.opacity = '1';

      setTimeout(resolve, duration);
    });
  }

  /**
   * Fade out polyline
   * @param {L.Polyline} polyline
   * @param {number} targetOpacity - Opacity đích
   * @param {number} [duration=400]
   * @returns {Promise<void>}
   */
  function fadeOutPolyline(polyline, targetOpacity = 0.3, duration = 400) {
    return new Promise((resolve) => {
      const pathElement = polyline.getElement();
      if (!pathElement) {
        resolve();
        return;
      }

      pathElement.style.transition = `opacity ${duration}ms ease-in-out`;
      pathElement.style.opacity = String(targetOpacity);

      setTimeout(resolve, duration);
    });
  }

  /**
   * Thêm hiệu ứng glow cho polyline active
   * @param {L.Polyline} polyline
   */
  function addGlowEffect(polyline) {
    const pathElement = polyline.getElement();
    if (pathElement) {
      pathElement.classList.add('polyline-glow');
    }
  }

  /**
   * Xóa hiệu ứng glow
   * @param {L.Polyline} polyline
   */
  function removeGlowEffect(polyline) {
    const pathElement = polyline.getElement();
    if (pathElement) {
      pathElement.classList.remove('polyline-glow');
    }
  }

  /**
   * Thêm hiệu ứng flow (dashes chuyển động) cho polyline
   * @param {L.Polyline} polyline
   */
  function addFlowEffect(polyline) {
    const pathElement = polyline.getElement();
    if (pathElement) {
      pathElement.classList.add('polyline-flow');
    }
  }

  /**
   * Xóa hiệu ứng flow
   * @param {L.Polyline} polyline
   */
  function removeFlowEffect(polyline) {
    const pathElement = polyline.getElement();
    if (pathElement) {
      pathElement.classList.remove('polyline-flow');
    }
  }

  /**
   * Animate transition giữa hai trạng thái polyline
   * @param {L.Polyline} polyline
   * @param {Object} fromStyle - Style ban đầu
   * @param {Object} toStyle - Style đích
   * @param {number} [duration=400]
   */
  function transitionPolyline(polyline, fromStyle, toStyle, duration = 400) {
    const pathElement = polyline.getElement();
    if (!pathElement) return;

    pathElement.style.transition = `
      stroke ${duration}ms ease,
      stroke-width ${duration}ms ease,
      stroke-opacity ${duration}ms ease,
      opacity ${duration}ms ease
    `;

    if (toStyle.color) polyline.setStyle({ color: toStyle.color });
    if (toStyle.weight) polyline.setStyle({ weight: toStyle.weight });
    if (toStyle.opacity !== undefined) polyline.setStyle({ opacity: toStyle.opacity });

    setTimeout(() => {
      pathElement.style.transition = '';
    }, duration);
  }

  /**
   * Hiệu ứng celebration khi hoàn thành hành trình
   * @param {HTMLElement} container - Element chứa
   */
  function playCelebration(container) {
    if (!container) return;

    // Tạo burst effect
    const burst = document.createElement('div');
    burst.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--color-primary) 0%, transparent 70%);
      transform: translate(-50%, -50%) scale(0);
      pointer-events: none;
      z-index: 1000;
    `;
    burst.classList.add('celebration-burst');
    container.appendChild(burst);

    // Xóa burst sau animation
    setTimeout(() => {
      burst.remove();
    }, 1200);

    // Tạo confetti particles
    _createConfetti(container, 20);
  }

  /**
   * Tạo confetti particles
   * @param {HTMLElement} container
   * @param {number} count
   */
  function _createConfetti(container, count) {
    const colors = ['#F0A500', '#E74C3C', '#3FB950', '#58A6FF', '#FFB627', '#FF6B5A'];

    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const animDuration = 1.5 + Math.random() * 2;
      const delay = Math.random() * 0.5;
      const size = 4 + Math.random() * 6;

      confetti.style.cssText = `
        position: absolute;
        top: -10px;
        left: ${left}%;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        pointer-events: none;
        z-index: 1001;
        animation: confettiDrop ${animDuration}s ease-in ${delay}s forwards;
      `;

      container.appendChild(confetti);

      // Xóa sau animation
      setTimeout(() => {
        confetti.remove();
      }, (animDuration + delay) * 1000 + 100);
    }
  }

  /**
   * Thêm/xóa class animation cho một element
   * @param {HTMLElement} element
   * @param {string} animationClass
   * @param {number} [duration] - Tự xóa sau duration ms
   */
  function addAnimation(element, animationClass, duration) {
    if (!element) return;

    element.classList.remove(animationClass);
    void element.offsetWidth; // Force reflow
    element.classList.add(animationClass);

    if (duration) {
      setTimeout(() => {
        element.classList.remove(animationClass);
      }, duration);
    }
  }

  /**
   * Xóa class animation
   * @param {HTMLElement} element
   * @param {string} animationClass
   */
  function removeAnimation(element, animationClass) {
    if (element) {
      element.classList.remove(animationClass);
    }
  }

  // Export
  HueNamApp.Animation = {
    animatePolylineDraw,
    fadeInPolyline,
    fadeOutPolyline,
    addGlowEffect,
    removeGlowEffect,
    addFlowEffect,
    removeFlowEffect,
    transitionPolyline,
    playCelebration,
    addAnimation,
    removeAnimation
  };

})();
