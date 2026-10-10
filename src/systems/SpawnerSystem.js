import { GAME_CONFIG } from '../config/gameConfig.js';
import { Obstacle } from '../entities/Obstacle.js';

/**
 * SpawnerSystem
 * Spawns obstacle waves ahead of the player using object pooling to eliminate GC latency.
 */
export class SpawnerSystem {
  constructor(scene) {
    this.scene = scene;
    this.pool = [];
    this.activeObstacles = [];
    this.timer = 0;
    this.spawnInterval = GAME_CONFIG.SPAWNER.MAX_SPAWN_INTERVAL;

    this._initializePool(30);
  }

  _initializePool(size) {
    const types = ['LOW', 'HIGH', 'FULL'];
    for (let i = 0; i < size; i++) {
      const type = types[i % types.length];
      const obstacle = new Obstacle(type, this.scene);
      this.pool.push(obstacle);
    }
  }

  _getFromPool(type) {
    let obstacle = this.pool.find((obs) => !obs.active && obs.type === type);
    if (!obstacle) {
      obstacle = new Obstacle(type, this.scene);
      this.pool.push(obstacle);
    }
    return obstacle;
  }

  update(delta, currentSpeed) {
    // 1. Move active obstacles and recycle out-of-bounds obstacles
    for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
      const obs = this.activeObstacles[i];
      obs.update(delta, currentSpeed);

      if (obs.position.z >= GAME_CONFIG.SPAWNER.DESPAWN_Z) {
        obs.recycle();
        this.activeObstacles.splice(i, 1);
      }
    }

    // 2. Adjust spawn interval based on current player speed
    const speedProgress = (currentSpeed - GAME_CONFIG.BASE_SPEED) / (GAME_CONFIG.MAX_SPEED - GAME_CONFIG.BASE_SPEED);
    const clampedProgress = Math.min(Math.max(speedProgress, 0), 1.0);
    this.spawnInterval = GAME_CONFIG.SPAWNER.MAX_SPAWN_INTERVAL - clampedProgress * (GAME_CONFIG.SPAWNER.MAX_SPAWN_INTERVAL - GAME_CONFIG.SPAWNER.MIN_SPAWN_INTERVAL);

    // 3. Spawner Timer
    this.timer += delta;
    if (this.timer >= this.spawnInterval) {
      this.timer = 0;
      this.spawnWave();
    }
  }

  spawnWave() {
    const obstacleTypes = ['LOW', 'HIGH', 'FULL'];

    // Select 1 or 2 lanes to spawn obstacles in (always leave at least 1 lane free)
    const numObstacles = Math.random() < 0.6 ? 1 : 2;
    const availableLanes = [0, 1, 2];

    for (let i = 0; i < numObstacles; i++) {
      const laneIndexInArr = Math.floor(Math.random() * availableLanes.length);
      const laneIndex = availableLanes.splice(laneIndexInArr, 1)[0];
      const xPos = GAME_CONFIG.LANES[laneIndex];

      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const obstacle = this._getFromPool(type);

      obstacle.spawn(xPos, GAME_CONFIG.SPAWNER.SPAWN_Z);
      this.activeObstacles.push(obstacle);
    }
  }

  getActiveObstacles() {
    return this.activeObstacles;
  }

  reset() {
    this.activeObstacles.forEach((obs) => obs.recycle());
    this.activeObstacles = [];
    this.timer = 0;
  }

  destroy() {
    this.pool.forEach((obs) => obs.destroy());
    this.pool = [];
    this.activeObstacles = [];
  }
}
