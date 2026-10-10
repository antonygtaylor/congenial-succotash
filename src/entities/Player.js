import * as THREE from 'three';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { LaneController } from '../systems/LaneController.js';

/**
 * Player
 * Manages Dante player 3D mesh representation, smooth lerping between lanes, jump physics, and slide/duck timers.
 */
export class Player {
  constructor(scene, inputManager) {
    this.scene = scene;
    this.inputManager = inputManager;
    this.laneController = new LaneController();

    // Position & Movement State
    this.position = new THREE.Vector3(0, GAME_CONFIG.PLAYER.INITIAL_Y, GAME_CONFIG.PLAYER.START_Z);
    this.velocityY = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;

    // Construct Dante Mesh (Stylized Hero Capsule with Cloak)
    this.meshGroup = new THREE.Group();
    this._createMesh();
    this.scene.add(this.meshGroup);

    // Bounding Box for Collision Detection
    this.boundingBox = new THREE.Box3();
    this.updateBoundingBox();

    // Subscribe to Input Actions
    this.unsubscribeInput = this.inputManager.onAction((action) => this.handleAction(action));
  }

  _createMesh() {
    // Body / Torso Geometry (Dante Red/Crimson Tunic)
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.2, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.5, metalness: 0.3 });
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    this.bodyMesh.position.y = 0.6;
    this.bodyMesh.castShadow = true;
    this.meshGroup.add(this.bodyMesh);

    // Head / Laurel Wreath Crown
    const headGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.8 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 1.35;
    headMesh.castShadow = true;
    this.meshGroup.add(headMesh);

    // Red Cape / Cloak on back
    const capeGeo = new THREE.BoxGeometry(0.6, 1.1, 0.1);
    const capeMat = new THREE.MeshStandardMaterial({ color: 0x5a0000, roughness: 0.7 });
    this.capeMesh = new THREE.Mesh(capeGeo, capeMat);
    this.capeMesh.position.set(0, 0.6, 0.25);
    this.meshGroup.add(this.capeMesh);

    this.meshGroup.position.copy(this.position);
  }

  handleAction(action) {
    switch (action) {
      case 'LEFT':
        this.laneController.moveLeft();
        break;
      case 'RIGHT':
        this.laneController.moveRight();
        break;
      case 'JUMP':
        if (!this.isJumping && !this.isSliding) {
          this.isJumping = true;
          this.velocityY = GAME_CONFIG.PLAYER.JUMP_FORCE;
        }
        break;
      case 'SLIDE':
        if (!this.isJumping && !this.isSliding) {
          this.isSliding = true;
          this.slideTimer = GAME_CONFIG.PLAYER.SLIDE_DURATION;
          // Quickly cancel jump if in mid-air
        } else if (this.isJumping) {
          this.velocityY = -GAME_CONFIG.PLAYER.JUMP_FORCE * 1.5; // Fast dive
        }
        break;
    }
  }

  update(delta) {
    // 1. Smooth Lateral Lane Movement (X-axis Lerp)
    const targetX = this.laneController.getTargetX();
    this.position.x += (targetX - this.position.x) * Math.min(1.0, GAME_CONFIG.PLAYER.LANE_CHANGE_SPEED * delta);

    // Subtle Bank/Tilt on Lane Switching
    const moveDiff = targetX - this.position.x;
    this.meshGroup.rotation.z = -moveDiff * 0.15;
    this.meshGroup.rotation.x = this.isSliding ? 0.6 : 0; // Forward lean when sliding

    // 2. Jump Physics (Y-axis Gravity & Velocity)
    if (this.isJumping) {
      this.position.y += this.velocityY * delta;
      this.velocityY -= GAME_CONFIG.PLAYER.GRAVITY * delta;

      if (this.position.y <= GAME_CONFIG.PLAYER.INITIAL_Y) {
        this.position.y = GAME_CONFIG.PLAYER.INITIAL_Y;
        this.isJumping = false;
        this.velocityY = 0;
      }
    }

    // 3. Slide Timer & Scale Compression
    if (this.isSliding) {
      this.slideTimer -= delta;
      this.meshGroup.scale.set(1.2, 0.5, 1.2); // Crouch down
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.meshGroup.scale.set(1.0, 1.0, 1.0); // Reset scale
      }
    } else {
      this.meshGroup.scale.set(1.0, 1.0, 1.0);
    }

    // Synchronize 3D mesh position
    this.meshGroup.position.copy(this.position);

    // Update collision bounding box
    this.updateBoundingBox();
  }

  updateBoundingBox() {
    const sizeY = this.isSliding ? GAME_CONFIG.PLAYER.SLIDE_HEIGHT : GAME_CONFIG.PLAYER.SIZE.y;
    const halfX = GAME_CONFIG.PLAYER.SIZE.x / 2;
    const halfZ = GAME_CONFIG.PLAYER.SIZE.z / 2;

    this.boundingBox.min.set(
      this.position.x - halfX,
      this.position.y - 0.2,
      this.position.z - halfZ
    );
    this.boundingBox.max.set(
      this.position.x + halfX,
      this.position.y + sizeY,
      this.position.z + halfZ
    );
  }

  reset() {
    this.laneController.reset();
    this.position.set(0, GAME_CONFIG.PLAYER.INITIAL_Y, GAME_CONFIG.PLAYER.START_Z);
    this.velocityY = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.meshGroup.scale.set(1.0, 1.0, 1.0);
    this.meshGroup.position.copy(this.position);
    this.updateBoundingBox();
  }

  destroy() {
    if (this.unsubscribeInput) this.unsubscribeInput();
    this.scene.remove(this.meshGroup);
  }
}
