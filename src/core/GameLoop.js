import { GAME_CONFIG } from '../config/gameConfig.js';
import { SceneManager } from '../graphics/SceneManager.js';
import { InputManager } from '../systems/InputManager.js';
import { Player } from '../entities/Player.js';
import { SpawnerSystem } from '../systems/SpawnerSystem.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { HUD } from '../ui/HUD.js';

/**
 * GameLoop
 * Central coordinator managing timing, frame tick updates, speed acceleration, score accumulation, and game reset.
 */
export class GameLoop {
  constructor(canvas, container) {
    this.canvas = canvas;
    this.container = container;

    // Game State
    this.isRunning = false;
    this.isGameOver = false;
    this.score = 0;
    this.currentSpeed = GAME_CONFIG.BASE_SPEED;
    this.lastTime = 0;

    // Systems Initialization
    this.sceneManager = new SceneManager(this.canvas);
    this.inputManager = new InputManager();
    this.player = new Player(this.sceneManager.scene, this.inputManager);
    this.spawnerSystem = new SpawnerSystem(this.sceneManager.scene);
    this.hud = new HUD(this.container, () => this.restart());

    this.animate = this.animate.bind(this);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isGameOver = false;
    this.lastTime = performance.now();
    requestAnimationFrame(this.animate);
  }

  restart() {
    this.score = 0;
    this.currentSpeed = GAME_CONFIG.BASE_SPEED;
    this.isGameOver = false;
    this.player.reset();
    this.spawnerSystem.reset();
    this.hud.updateScore(0);
    this.lastTime = performance.now();
    this.isRunning = true;
    requestAnimationFrame(this.animate);
  }

  animate(now) {
    if (!this.isRunning) return;

    // Delta time in seconds with clamping to avoid physics explosion on tab-switch
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (!this.isGameOver) {
      // 1. Ramp forward speed over time
      this.currentSpeed = Math.min(
        GAME_CONFIG.MAX_SPEED,
        this.currentSpeed + GAME_CONFIG.SPEED_ACCELERATION * delta
      );

      // 2. Accumulate survival score (descent meters)
      this.score += this.currentSpeed * delta;
      this.hud.updateScore(this.score);

      // 3. Update Scene & Entity Systems
      this.sceneManager.updateTrackMarkers(delta, this.currentSpeed);
      this.player.update(delta);
      this.spawnerSystem.update(delta, this.currentSpeed);

      // 4. Collision Detection Check
      const hitObstacle = CollisionSystem.checkCollision(
        this.player,
        this.spawnerSystem.getActiveObstacles()
      );

      if (hitObstacle) {
        this.isGameOver = true;
        this.isRunning = false;
        this.hud.showGameOver(this.score);
      }
    }

    // Render frame
    this.sceneManager.render();

    if (this.isRunning) {
      requestAnimationFrame(this.animate);
    }
  }

  destroy() {
    this.isRunning = false;
    this.inputManager.destroy();
    this.player.destroy();
    this.spawnerSystem.destroy();
    this.sceneManager.destroy();
  }
}
