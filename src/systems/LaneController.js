import { GAME_CONFIG } from '../config/gameConfig.js';

/**
 * LaneController
 * Manages discrete lane state index (0: Left, 1: Center, 2: Right) and calculates target X coordinate.
 */
export class LaneController {
  constructor() {
    this.currentLaneIndex = 1; // Start in center lane (index 1)
  }

  moveLeft() {
    if (this.currentLaneIndex > 0) {
      this.currentLaneIndex--;
    }
  }

  moveRight() {
    if (this.currentLaneIndex < GAME_CONFIG.LANES.length - 1) {
      this.currentLaneIndex++;
    }
  }

  getTargetX() {
    return GAME_CONFIG.LANES[this.currentLaneIndex];
  }

  getLaneIndex() {
    return this.currentLaneIndex;
  }

  reset() {
    this.currentLaneIndex = 1;
  }
}
