import * as THREE from 'three';
import { GAME_CONFIG } from '../config/gameConfig.js';

/**
 * SceneManager
 * Sets up the Three.js WebGL renderer, perspective camera, atmospheric lighting,
 * deep fog, and the 3-lane track with scrolling road markers for depth perception.
 */
export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Scene & Fog setup (Hellish dark atmosphere)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0305);
    this.scene.fog = new THREE.FogExp2(0x0a0305, 0.025);

    // Perspective Camera setup
    this.camera = new THREE.PerspectiveCamera(
      GAME_CONFIG.CAMERA.FOV,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, GAME_CONFIG.CAMERA.OFFSET_Y, GAME_CONFIG.CAMERA.OFFSET_Z);
    this.camera.lookAt(0, GAME_CONFIG.CAMERA.LOOK_AT_Y, GAME_CONFIG.CAMERA.LOOK_AT_Z);

    // Track scroll markers array
    this.trackMarkers = [];

    this._setupLighting();
    this._createTrackEnvironment();

    // Window resize handler
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }

  _setupLighting() {
    // Dim ambient infernal light
    const ambientLight = new THREE.AmbientLight(0x40151a, 1.2);
    this.scene.add(ambientLight);

    // Directional light casting soft shadows
    const dirLight = new THREE.DirectionalLight(0xff7744, 1.5);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -70;
    this.scene.add(dirLight);

    // Red fiery point light moving behind the track
    const pointLight = new THREE.PointLight(0xff2200, 2.0, 30);
    pointLight.position.set(0, 3, -15);
    this.scene.add(pointLight);
  }

  _createTrackEnvironment() {
    const totalWidth = GAME_CONFIG.LANE_WIDTH * 3 + 1.0;
    const trackLength = 120;

    // Main floor track geometry
    const trackGeo = new THREE.PlaneGeometry(totalWidth, trackLength);
    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x1f1518,
      roughness: 0.8,
      metalness: 0.2
    });

    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.rotation.x = -Math.PI / 2;
    trackMesh.position.set(0, 0, -trackLength / 2 + 10);
    trackMesh.receiveShadow = true;
    this.scene.add(trackMesh);

    // Lane divider lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xc43d22 });

    const dividerX1 = -GAME_CONFIG.LANE_WIDTH / 2 - 0.1;
    const dividerX2 = GAME_CONFIG.LANE_WIDTH / 2 + 0.1;

    [dividerX1, dividerX2].forEach((xPos) => {
      const lineGeo = new THREE.PlaneGeometry(0.08, trackLength);
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.rotation.x = -Math.PI / 2;
      lineMesh.position.set(xPos, 0.01, -trackLength / 2 + 10);
      this.scene.add(lineMesh);
    });

    // Outer border walls/rails
    const railGeo = new THREE.BoxGeometry(0.3, 0.6, trackLength);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x5a1818, roughness: 0.6 });

    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(-totalWidth / 2, 0.3, -trackLength / 2 + 10);
    leftRail.castShadow = true;
    leftRail.receiveShadow = true;
    this.scene.add(leftRail);

    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(totalWidth / 2, 0.3, -trackLength / 2 + 10);
    rightRail.castShadow = true;
    rightRail.receiveShadow = true;
    this.scene.add(rightRail);

    // Create scrolling road grid/markers for perspective speed feedback
    const markerGeo = new THREE.BoxGeometry(totalWidth - 0.4, 0.02, 0.4);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x3d1418 });

    for (let z = 5; z > -70; z -= 4) {
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(0, 0.015, z);
      this.scene.add(marker);
      this.trackMarkers.push(marker);
    }
  }

  /**
   * Scroll track markers towards player to give sense of forward movement
   */
  updateTrackMarkers(delta, currentSpeed) {
    const moveDist = currentSpeed * delta;
    this.trackMarkers.forEach((marker) => {
      marker.position.z += moveDist;
      if (marker.position.z > 10) {
        marker.position.z -= 75; // Cycle back ahead
      }
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  destroy() {
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
  }
}
