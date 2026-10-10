/**
 * InputManager
 * Handles keyboard (WASD / Arrows) and Touch Swipe inputs for cross-platform control.
 */
export class InputManager {
  constructor() {
    this.listeners = new Set();

    // Touch tracking variables
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.minSwipeDistance = 30; // Min pixels for swipe registration

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);

    this.init();
  }

  init() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('touchstart', this._onTouchStart, { passive: true });
    window.addEventListener('touchend', this._onTouchEnd, { passive: true });
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('touchstart', this._onTouchStart);
    window.removeEventListener('touchend', this._onTouchEnd);
    this.listeners.clear();
  }

  /**
   * Subscribe an action callback
   * Actions: 'LEFT', 'RIGHT', 'JUMP', 'SLIDE'
   */
  onAction(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  _emit(action) {
    this.listeners.forEach((callback) => callback(action));
  }

  _onKeyDown(event) {
    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this._emit('LEFT');
        break;
      case 'ArrowRight':
      case 'KeyD':
        this._emit('RIGHT');
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        this._emit('JUMP');
        break;
      case 'ArrowDown':
      case 'KeyS':
        this._emit('SLIDE');
        break;
    }
  }

  _onTouchStart(event) {
    if (event.touches.length > 0) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  }

  _onTouchEnd(event) {
    if (event.changedTouches.length === 0) return;

    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    const deltaY = event.changedTouches[0].clientY - this.touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) >= this.minSwipeDistance) {
        if (deltaX > 0) {
          this._emit('RIGHT');
        } else {
          this._emit('LEFT');
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) >= this.minSwipeDistance) {
        if (deltaY < 0) {
          this._emit('JUMP'); // Swipe up
        } else {
          this._emit('SLIDE'); // Swipe down
        }
      }
    }
  }
}
