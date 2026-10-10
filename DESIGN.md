# Dante's Inferno: Descent into the Abyss — Game Architecture & Blueprint

Welcome to the project specification for **Dante's Inferno: Descent into the Abyss**, a 3D web-based 3-lane rail-runner game where the player controls Dante as he descends through the Nine Circles of Hell.

---

## 1. Core Architecture Outline

The game engine is designed with a decoupled, component-based modular web architecture (leveraging **Three.js** for 3D graphics, **Web Audio API** for spatial audio, and vanilla HTML5/TypeScript or JavaScript ES Modules for performance and low overhead).

```
+-----------------------------------------------------------------------+
|                              Game Engine                              |
|                                                                       |
|  +------------------+     +-------------------+     +--------------+  |
|  |   Game Loop      | --> |   State Manager   | --> | Event Bus    |  |
|  | (delta time, fps)|     | (Menu, Play, Pause|     | (Pub/Sub)    |  |
|  +------------------+     +-------------------+     +--------------+  |
|           |                         |                      |          |
|           v                         v                      v          |
|  +------------------+     +-------------------+     +--------------+  |
|  | Input Controller |     | Lane & Movement   |     | Level/Circle |  |
|  | (Keyboard/Touch) | --> |   System (3-Lanes)| --> |   Manager    |  |
|  +------------------+     +-------------------+     +--------------+  |
|                                     |                      |          |
|                                     v                      v          |
|  +------------------+     +-------------------+     +--------------+  |
|  | Collision Detector| <-- | Obstacle Spawner  | <-- | Environmental|  |
|  | (AABB / Bounding)|     | (Object Pooling)  |     | Hazards Sys  |  |
|  +------------------+     +-------------------+     +--------------+  |
|           |                                                |          |
|           +-------------------------+----------------------+          |
|                                     |                                 |
|                                     v                                 |
|                          +---------------------+                      |
|                          | Render System (WebGL|                      |
|                          | Three.js / Shader)  |                      |
|                          +---------------------+                      |
+-----------------------------------------------------------------------+
```

### Key Subsystems

1. **Game Loop (`GameLoop.js`)**
   - Uses `requestAnimationFrame` with fixed delta-time clamping (60 FPS target) to ensure smooth physics and movement independent of hardware refresh rates.
   - Manages global state: `INIT`, `START`, `PLAYING`, `PAUSED`, `LEVEL_TRANSITION`, `GAME_OVER`.

2. **Lane State & Movement System (`LaneController.js` & `Player.js`)**
   - **3 Discrete Lanes:** Left (`-1`), Center (`0`), Right (`1`) with smooth lateral interpolation (lerp / Spring physics).
   - **Vertical Actions:** Jump (Dodge low obstacles), Slide/Duck (Dodge high obstacles).
   - **Forward Speed Acceleration:** Base speed increases per circle, with dynamic speed ramps based on descent progress.

3. **Obstacle Spawner & Object Pool (`Spawner.js` & `ObjectPool.js`)**
   - Pattern-based or procedural pattern generation for obstacle waves (e.g. `[OBSTACLE, EMPTY, OBSTACLE]`).
   - Uses **Object Pooling** to re-use meshes and bounding volumes, minimizing Garbage Collection (GC) hitches during gameplay.

4. **Collision Detection System (`CollisionSystem.js`)**
   - Hierarchical Axis-Aligned Bounding Box (AABB) and Oriented Bounding Box (OBB) detection for low-overhead checking.
   - Triggers hit response callbacks: Health deduction, stumble animation, camera shake, or instant fatality depending on obstacle type.

5. **Environmental Hazard System (`HazardManager.js`)**
   - Controls Circle-specific active hazards (e.g. hurricane wind pushes player between lanes in Lust, torrential rain obscuring vision in Gluttony, ice sliding mechanics in Treachery).

6. **Camera & Scene Manager (`CameraSystem.js` & `SceneManager.js`)**
   - Dynamic 3rd-person follow camera with subtle tilt on lane changes, recoil on collisions, and dynamic FOV adjustment during speed bursts or boss transitions.

---

## 2. Nine Circles Mechanics Breakdown

| Circle | Name | Visual Theme & Environment | Obstacle Types | Active Environmental Hazards |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Limbo** | Foggy, twilight ruins, somber stone arcades, dim glowing braziers. | Fallen pillars, unbaptized soul shadows, decaying archways. | Low visibility mist periodically obscuring distant obstacles. |
| **2** | **Lust** | Violent dark tempest, swirling purple/crimson winds, floating debris. | Flying jagged debris, wind-blown spires, tumbling statues. | **Crosswinds:** Gusts push player laterally towards adjacent lanes. |
| **3** | **Gluttony** | Fetid mud pit, endless putrid rain, decaying flesh walls, slavering mouths. | Giant toxic toadstools, bile pools, grasping rotting limbs. | **Mire:** Mud patches on lanes slow down movement or delay lane switches. |
| **4** | **Greed** | Golden hoard chambers, molten gold rivers, giant rolling heavy boulders. | Rolling golden weights, lava channels, crushing coin sacks. | **Crushing Boulders:** Heavy weights roll down lanes at varying speeds. |
| **5** | **Wrath** | Styx swamp, boiling muddy waters, thrashing enraged sinners. | Thrashing submerged souls, burning wreckage, sudden geysers. | **Boiling Geysers:** Sudden vertical lava/water bursts requiring quick lane shifts. |
| **6** | **Heresy** | Burning necropolis, iron tombs glowing red with eternal flames, smoke. | Flaming sarcophagi, open iron tombs, fiery walls. | **Heatwave Flash:** Periodic screen-blur flares requiring memorized lane position. |
| **7** | **Violence** | Blood river (Phlegethon), thorny bleeding forest, raining fire sand desert. | Thorny wood brambles, centaur arrows, boiling blood cascades. | **Rain of Fire:** Scorching embers fall on targeted lane indicators before exploding. |
| **8** | **Fraud (Malebolge)** | 10 stony chasms (chasm bridges), pitch pools, jagged whip-cracking demons. | Broken stone bridges, pitch cauldrons, swinging demon whips. | **Collapsing Bridges:** Floor tiles crumble behind and beneath the player. |
| **9** | **Treachery (Cocytus)** | Frozen lake, howling ice winds, encased icy sinners, towering Lucifer shadow. | Ice monoliths, frozen sinner pillars, slippery ice crevasses. | **Icy Surface:** Removes traction; lane switching continues momentum (slide drift). |

---

## 3. File & Folder Blueprint

```
dantes-inferno-runner/
│
├── index.html                  # Main entry point & HTML shell
├── package.json                # Project dependencies & scripts (Vite/Three.js)
├── vite.config.js              # Bundler configuration
├── README.md                   # Project description & run instructions
├── DESIGN.md                   # Full game architectural blueprint & specs
│
├── public/                     # Static assets
│   ├── assets/
│   │   ├── models/             # 3D GLTF/GLB models (Dante, Obstacles, Environments)
│   │   ├── textures/           # Materials, particle textures, terrain maps
│   │   ├── audio/              # Sound effects (jump, hit, circle themes)
│   │   └── fonts/              # Custom gothic / medieval fonts
│   └── favicon.ico
│
└── src/                        # Main source code
    ├── main.js                 # Application initializer & Bootstrap
    │
    ├── config/                 # Game balancing & Circle configurations
    │   ├── gameConfig.js       # Global constants (speeds, lane widths, gravity)
    │   └── circlesConfig.js    # Circle parameters (hazards, visuals, speed multipliers)
    │
    ├── core/                   # Engine infrastructure
    │   ├── GameLoop.js         # Loop driver & delta timer
    │   ├── GameState.js        # Global state management
    │   ├── EventBus.js         # Event dispatcher / pub-sub system
    │   └── ObjectPool.js       # Generic object pooling mechanism
    │
    ├── entities/               # Game objects
    │   ├── Player.js           # Dante character logic, animations & state
    │   ├── Obstacle.js         # Base obstacle class
    │   ├── Pickup.js           # Virgil's Grace / Holy Relic collectibles
    │   └── Hazard.js           # Environmental hazard entity logic
    │
    ├── systems/                # Core game systems
    │   ├── InputManager.js     # Keyboard, touch swipe & gamepad handler
    │   ├── LaneController.js   # 3-lane state, position lerping & jumping
    │   ├── SpawnerSystem.js    # Pattern generator & obstacle spawner
    │   ├── HazardSystem.js     # Circle-specific hazard trigger logic
    │   ├── CollisionSystem.js  # Bounding box / sphere collision manager
    │   └── ProgressionManager.js # Circle descent, meter progress, level transitions
    │
    ├── graphics/               # Three.js renderers & visual effects
    │   ├── SceneManager.js     # Scene setup, fog, skybox, ambient lighting
    │   ├── CameraSystem.js     # 3rd-person camera follow, shake & dynamic FOV
    │   ├── ParticleSystem.js   # Fire, ember, fog, splash particle emitters
    │   └── Shaders.js          # Custom shaders (e.g. lava, heat distortion, ice)
    │
    ├── audio/                  # Sound & Music architecture
    │   ├── AudioManager.js     # Web Audio API ambient music crossfader & SFX player
    │   └── SoundCatalog.js     # Sound mapping per Circle and action
    │
    └── ui/                     # User Interface & HUD overlays
        ├── HUD.js              # Meter depth counter, active Circle indicator, Beatrice health bar
        ├── Menus.js            # Main Menu, Pause Menu, Game Over Screen
        └── CircleTransitionUI.js # "Abandon All Hope..." Circle entrance overlay
```

---

## 4. Step-by-Step Build Plan (5-Phase Roadmap)

### Phase 1: MVP Core Runner Engine (The Foundation)
- **Goal:** Playable 3-lane prototype with basic geometry and collision.
- **Deliverables:**
  1. Set up Three.js rendering pipeline, canvas, base lighting, and infinite floor strip.
  2. Implement `LaneController` (3 lanes: `-1, 0, 1`) with smooth left/right movement, jump, and duck/slide.
  3. Build `InputManager` supporting Arrow Keys/WASD and Touch Swipes.
  4. Create basic `SpawnerSystem` spawning primitive shapes (cubes, ramps, barriers) in pattern formations.
  5. Implement `CollisionSystem` (AABB bounding box) with game over trigger on hit.
  6. Basic HUD showing distance descended.

### Phase 2: Circle Progression & Level Transition System
- **Goal:** Dynamic transition through the 9 Circles of Hell as distance increases.
- **Deliverables:**
  1. Implement `ProgressionManager` tracking depth/distance (e.g., 500m per Circle).
  2. Implement `circlesConfig` driving environmental color palettes, fog density, light colors, and track textures per Circle.
  3. Create smooth level transition effects (vortex portal track segment, screen flash, atmospheric change).
  4. Build `CircleTransitionUI` displaying Dante's inscription banner (e.g., *"Circle II: Lust - The Infernal Storm"*).

### Phase 3: Circle Hazards & Collectibles
- **Goal:** Unique gameplay mechanics for all 9 Circles to prevent monotony.
- **Deliverables:**
  1. Implement Circle-specific active hazards (Lust crosswinds, Gluttony mud slow-down, Greed rolling boulders, Violence falling fire embers, Treachery ice drift).
  2. Add collectible items (Virgil's Guidance for shield/invincibility, Beatrice's Light for bonus score multiplier, Holy Cross for clear-screen burst).
  3. Add distinct obstacle 3D mesh types corresponding to each Circle.

### Phase 4: Audio, Visual Polish & Shaders
- **Goal:** Atmospheric immersive horror aesthetics and feedback.
- **Deliverables:**
  1. Implement custom particle effects (embers in Heresy, blood rain in Violence, snow/ice dust in Treachery).
  2. Integrate Web Audio API manager for dynamic atmospheric score per Circle and crisp SFX (groans, wind howl, flame bursts, footsteps).
  3. Camera shake effects on collision, near-miss slow motion, and dynamic FOV speed trails.
  4. Post-processing effects (bloom for fires, vignette, chromatic aberration).

### Phase 5: UI, High Scores & Final Polish
- **Goal:** Complete game wrapper, UI polish, balance tuning, and web deployment setup.
- **Deliverables:**
  1. Main Menu with title art, instructions, and high-score leaderboard (Local Storage / JSON).
  2. Pause menu, sound settings, and game over screen with descent stats summary (Deepest Circle reached, Souls collected).
  3. Mobile touch responsiveness optimization and performance profiling (guaranteeing 60fps).
  4. Final playtesting, obstacle pattern balance pass, and deployment pipeline setup.
