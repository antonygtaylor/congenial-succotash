/**
 * CollisionSystem
 * Handles Axis-Aligned Bounding Box (AABB) intersection testing between the Player and active Obstacles.
 *
 * COLLISION LOGIC:
 * 1. Primary Check: 3D Axis-Aligned Bounding Box (AABB) intersection check via Three.js Box3.intersectsBox().
 * 2. Obstacle Mechanics Handling:
 *    - 'LOW' obstacles: Player can jump over if player Y position is elevated.
 *    - 'HIGH' obstacles: Player can slide under if player is crouching/sliding (Y height reduced).
 *    - 'FULL' obstacles: Solid wall spanning height; collision occurs if player enters same lane & Z bounds.
 */
export class CollisionSystem {
  /**
   * Check if player collides with any active obstacle in the scene.
   * @param {Player} player - The player instance
   * @param {Array<Obstacle>} obstacles - List of currently active obstacles
   * @returns {Obstacle|null} The collided obstacle or null if clear
   */
  static checkCollision(player, obstacles) {
    const playerBox = player.boundingBox;

    for (let i = 0; i < obstacles.length; i++) {
      const obstacle = obstacles[i];
      if (!obstacle.active) continue;

      const obstacleBox = obstacle.boundingBox;

      // 1. Perform primary 3D AABB overlap check
      if (playerBox.intersectsBox(obstacleBox)) {

        // 2. Specific Jump / Slide action check refinement:
        if (obstacle.type === 'LOW' && player.isJumping && player.position.y > 1.2) {
          // Player is high enough in mid-air to clear low obstacle
          continue;
        }

        if (obstacle.type === 'HIGH' && player.isSliding) {
          // Player is ducking/sliding low enough to pass under overhead barrier
          continue;
        }

        // Collision registered
        return obstacle;
      }
    }

    return null;
  }
}
