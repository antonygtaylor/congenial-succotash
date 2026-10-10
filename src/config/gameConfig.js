/**
 * Game Configuration Constants
 * Centralized settings for lane coordinates, physics, speeds, and spawner timings.
 */
export const GAME_CONFIG = {
  // Lane positions on X-axis (Left: -1, Center: 0, Right: 1)
  LANES: [-2.5, 0, 2.5],
  LANE_WIDTH: 2.5,

  // Forward track speed (units/second)
  BASE_SPEED: 18.0,
  MAX_SPEED: 35.0,
  SPEED_ACCELERATION: 0.1, // Speed increase per second

  // Player physics
  PLAYER: {
    START_Z: 0,
    INITIAL_Y: 0.75,
    SIZE: { x: 0.8, y: 1.5, z: 0.8 },
    LANE_CHANGE_SPEED: 15.0, // Lerp factor for lateral movement
    JUMP_FORCE: 12.0,
    GRAVITY: 32.0,
    SLIDE_DURATION: 0.75, // Seconds spent sliding/ducking
    SLIDE_HEIGHT: 0.75 // Player height when ducking
  },

  // Obstacle Spawner Parameters
  SPAWNER: {
    SPAWN_Z: -60, // Distance ahead where obstacles spawn
    DESPAWN_Z: 10, // Distance behind player where obstacles are recycled
    MIN_SPAWN_INTERVAL: 0.8, // Seconds between spawns at max speed
    MAX_SPAWN_INTERVAL: 1.8 // Seconds between spawns at base speed
  },

  // Camera Settings
  CAMERA: {
    FOV: 60,
    OFFSET_Y: 3.5,
    OFFSET_Z: 6.0,
    LOOK_AT_Y: 1.2,
    LOOK_AT_Z: -5.0
  }
};
