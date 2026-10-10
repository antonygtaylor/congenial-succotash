import * as THREE from 'three';

/**
 * Obstacle Types:
 * - 'LOW': Can be jumped over or dodged by switching lanes.
 * - 'HIGH': Overhead bar/barrier; must be dodged by ducking/sliding or changing lanes.
 * - 'FULL': Tall pillar blocking entire lane height; must switch lanes to avoid.
 */
export class Obstacle {
  constructor(type, scene) {
    this.type = type;
    this.scene = scene;
    this.active = false;
    this.position = new THREE.Vector3();

    this.meshGroup = new THREE.Group();
    this.boundingBox = new THREE.Box3();

    this._buildMesh();
  }

  _buildMesh() {
    let geo, mat, mesh;

    switch (this.type) {
      case 'LOW':
        // Low tombstone / boulder barrier (Jumpable)
        geo = new THREE.BoxGeometry(1.8, 0.7, 0.8);
        mat = new THREE.MeshStandardMaterial({ color: 0x7a2222, roughness: 0.7 });
        mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 0.35;
        break;

      case 'HIGH':
        // Overhead hanging archway / blade (Slideable under)
        geo = new THREE.BoxGeometry(2.0, 0.8, 0.6);
        mat = new THREE.MeshStandardMaterial({ color: 0xa84318, roughness: 0.5 });
        mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 1.8; // Elevated off ground
        break;

      case 'FULL':
      default:
        // Tall dark monolith pillar (Must change lane)
        geo = new THREE.BoxGeometry(1.8, 2.8, 1.0);
        mat = new THREE.MeshStandardMaterial({ color: 0x2e080a, roughness: 0.9, metalness: 0.1 });
        mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 1.4;
        break;
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.meshGroup.add(mesh);

    // Keep hidden initially
    this.meshGroup.visible = false;
    this.scene.add(this.meshGroup);
  }

  spawn(x, z) {
    this.position.set(x, 0, z);
    this.meshGroup.position.copy(this.position);
    this.meshGroup.visible = true;
    this.active = true;
    this.updateBoundingBox();
  }

  update(delta, currentSpeed) {
    if (!this.active) return;

    // Move obstacle towards player (+Z direction)
    this.position.z += currentSpeed * delta;
    this.meshGroup.position.copy(this.position);
    this.updateBoundingBox();
  }

  updateBoundingBox() {
    this.boundingBox.setFromObject(this.meshGroup);
  }

  recycle() {
    this.active = false;
    this.meshGroup.visible = false;
  }

  destroy() {
    this.scene.remove(this.meshGroup);
  }
}
