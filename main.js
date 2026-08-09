/* NEON DRIFT: SYNTHWAVE OVERDRIVE — Three.js Engine & Game Logic */

(() => {
  // --- Audio Synthesizer (Web Audio API) ---
  class SoundSynth {
    constructor() {
      this.ctx = null;
      this.engineOsc = null;
      this.engineGain = null;
      this.isInit = false;
    }

    init() {
      if (this.isInit) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
        this.isInit = true;
        this.startEngine();
      } catch (e) {
        console.warn('Web Audio API not supported', e);
      }
    }

    startEngine() {
      if (!this.ctx) return;
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(60, this.ctx.currentTime);
      this.engineGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      // Lowpass filter for smooth engine rumble
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();
    }

    updateEngine(speedRatio) {
      if (!this.ctx || !this.engineOsc) return;
      const targetFreq = 50 + speedRatio * 180;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    }

    playPickup(freq = 587) {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.6, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    }

    playExplosion() {
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start();
    }

    playBoost() {
      if (!this.ctx) return;
      this.playPickup(440);
      this.playPickup(880);
    }
  }

  const audio = new SoundSynth();

  // --- Constants & Config ---
  const LANES = [-8, -4, 0, 4, 8]; // 5 lanes
  const ROAD_WIDTH = 22;
  const ROAD_LENGTH = 500;
  const SEGMENT_LENGTH = 10;

  // --- DOM Elements ---
  const container = document.getElementById('canvas-container');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const speedEl = document.getElementById('speedometer');
  const comboEl = document.getElementById('combo-display');
  const shieldStatusEl = document.getElementById('shield-bar-container');
  const boostInnerEl = document.getElementById('boost-meter-inner');

  const menuModal = document.getElementById('menuModal');
  const gameOverModal = document.getElementById('gameOverModal');
  const pauseModal = document.getElementById('pauseModal');

  const startBtn = document.getElementById('startBtn');
  const retryBtn = document.getElementById('retryBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const finalScoreEl = document.getElementById('finalScore');
  const finalBestEl = document.getElementById('finalBest');

  let bestScore = Number(localStorage.getItem('neondrift_3d_best') || 0);
  bestEl.textContent = bestScore;

  // --- Three.js Globals ---
  let scene, camera, renderer;
  let roadGroup, sunMesh, mountainGroup;
  let playerCar, shieldBubbleMesh;
  let playerTrailParticles = [];
  let obstacles = [];
  let pickups = [];
  let shockwaves = [];
  let roadSegments = [];

  // Game state variables
  let gameState = 'MENU'; // MENU, PLAYING, PAUSED, GAMEOVER
  let targetLane = 2; // Middle lane (0 to 4)
  let playerPosX = 0;
  let speed = 0;
  const BASE_SPEED = 70;
  const MAX_SPEED = 160;
  let currentSpeed = BASE_SPEED;
  let isBoosting = false;
  let boostAmount = 100;

  let score = 0;
  let combo = 1;
  let comboTimer = 0;
  let shieldActive = false;
  let time = 0;
  let cameraShake = 0;
  let curveOffset = 0;

  // Key tracking
  const keys = {};

  // --- Initialization ---
  function initThree() {
    // Scene & Fog
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04040a);
    scene.fog = new THREE.FogExp2(0x0c061a, 0.0055);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 800);
    camera.position.set(0, 4.2, 12);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f3ff, 0.8);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    const magentaLight = new THREE.DirectionalLight(0xff00aa, 0.6);
    magentaLight.position.set(-20, 20, -40);
    scene.add(magentaLight);

    // Build Environment & Meshes
    buildEnvironment();
    buildRoad();
    buildPlayerCar();

    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    setupTouchControls();
  }

  // --- Environment & Sun ---
  function buildEnvironment() {
    // Retro Synthwave Sun
    const sunGeom = new THREE.CircleGeometry(45, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xff7700,
      side: THREE.DoubleSide
    });
    sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sunMesh.position.set(0, 20, -350);
    scene.add(sunMesh);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(1000, 80, 0xff00aa, 0x00f3ff);
    gridHelper.position.y = -0.5;
    gridHelper.position.z = -200;
    scene.add(gridHelper);

    // Mountain Backdrop Silhouettes
    mountainGroup = new THREE.Group();
    for (let i = -10; i <= 10; i++) {
      if (Math.abs(i) < 2) continue; // Leave middle open for sun
      const mGeom = new THREE.ConeGeometry(rand(20, 40), rand(30, 60), 4);
      const mMat = new THREE.MeshLambertMaterial({ color: 0x090518, flatShading: true });
      const m = new THREE.Mesh(mGeom, mMat);
      m.position.set(i * 35, 10, -340 + rand(-20, 20));
      m.rotation.y = Math.PI / 4;
      mountainGroup.add(m);
    }
    scene.add(mountainGroup);
  }

  // --- Procedural 3D Road ---
  function buildRoad() {
    roadGroup = new THREE.Group();
    const numSegments = ROAD_LENGTH / SEGMENT_LENGTH;

    for (let i = 0; i < numSegments; i++) {
      const z = -i * SEGMENT_LENGTH;
      const segGeom = new THREE.PlaneGeometry(ROAD_WIDTH, SEGMENT_LENGTH);
      const segMat = new THREE.MeshStandardMaterial({
        color: (i % 2 === 0) ? 0x0a0c16 : 0x080912,
        roughness: 0.4,
        metalness: 0.6
      });
      const seg = new THREE.Mesh(segGeom, segMat);
      seg.rotation.x = -Math.PI / 2;
      seg.position.set(0, 0, z);

      // Glowing Lane Dividers
      LANES.forEach((xPos, idx) => {
        if (idx === 0 || idx === LANES.length - 1) return; // Outer edges
        const lineGeom = new THREE.PlaneGeometry(0.2, SEGMENT_LENGTH * 0.5);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
        const line = new THREE.Mesh(lineGeom, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(xPos, 0.02, 0);
        seg.add(line);
      });

      // Curb Light Posts
      [-ROAD_WIDTH / 2 - 0.5, ROAD_WIDTH / 2 + 0.5].forEach(xBorder => {
        const postGeom = new THREE.BoxGeometry(0.3, 1.2, 0.3);
        const postMat = new THREE.MeshBasicMaterial({ color: 0xff00aa });
        const post = new THREE.Mesh(postGeom, postMat);
        post.position.set(xBorder, 0.6, 0);
        seg.add(post);
      });

      roadGroup.add(seg);
      roadSegments.push(seg);
    }
    scene.add(roadGroup);
  }

  // --- Low-Poly Cyberpunk Car ---
  function buildPlayerCar() {
    playerCar = new THREE.Group();

    // Car Body / Chassis
    const bodyGeom = new THREE.BoxGeometry(2.2, 0.7, 4.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x070b14, roughness: 0.2, metalness: 0.8 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 0.5;
    playerCar.add(body);

    // Windshield Cabin
    const cabinGeom = new THREE.BoxGeometry(1.7, 0.55, 2.0);
    const cabinMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
    const cabin = new THREE.Mesh(cabinGeom, cabinMat);
    cabin.position.set(0, 1.0, -0.3);
    playerCar.add(cabin);

    // Glowing Neon Taillights
    const tailGeom = new THREE.BoxGeometry(2.0, 0.15, 0.1);
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff00aa });
    const tail = new THREE.Mesh(tailGeom, tailMat);
    tail.position.set(0, 0.65, 2.1);
    playerCar.add(tail);

    // Glowing Cyan Headlights
    const headGeom = new THREE.BoxGeometry(1.8, 0.12, 0.1);
    const headMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.set(0, 0.5, -2.1);
    playerCar.add(head);

    // 4 Wheels
    const wheelGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
    [[-1.1, 1.3], [1.1, 1.3], [-1.1, -1.3], [1.1, -1.3]].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(wheelGeom, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.4, wz);
      playerCar.add(wheel);
    });

    // Shield Bubble Mesh (Hidden initially)
    const shieldGeom = new THREE.SphereGeometry(2.8, 16, 16);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0xff00aa,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    shieldBubbleMesh = new THREE.Mesh(shieldGeom, shieldMat);
    shieldBubbleMesh.visible = false;
    playerCar.add(shieldBubbleMesh);

    playerCar.position.set(0, 0, 0);
    scene.add(playerCar);
  }

  // --- Spawners ---
  function spawnObstacle() {
    const laneIdx = Math.floor(rand(0, LANES.length));
    const x = LANES[laneIdx];
    const z = -ROAD_LENGTH + 50;

    const isHunter = time > 2500 && Math.random() < 0.35;
    const isDestructible = !isHunter && Math.random() < 0.25;

    let mesh;
    if (isHunter) {
      // Homing Hunter Car (Orange)
      const hGeom = new THREE.BoxGeometry(2.0, 0.8, 3.8);
      const hMat = new THREE.MeshBasicMaterial({ color: 0xff7700, wireframe: true });
      mesh = new THREE.Mesh(hGeom, hMat);
    } else if (isDestructible) {
      // Destructible Yellow Energy Barrier
      const dGeom = new THREE.BoxGeometry(2.6, 1.4, 0.8);
      const dMat = new THREE.MeshBasicMaterial({ color: 0xffea00, wireframe: true });
      mesh = new THREE.Mesh(dGeom, dMat);
    } else {
      // Regular Red Barrier Vehicle
      const rGeom = new THREE.BoxGeometry(2.2, 0.9, 3.6);
      const rMat = new THREE.MeshStandardMaterial({ color: 0xff0044, roughness: 0.3, metalness: 0.7 });
      mesh = new THREE.Mesh(rGeom, rMat);
    }

    mesh.position.set(x, 0.6, z);
    scene.add(mesh);
    obstacles.push({
      mesh,
      laneIdx,
      isHunter,
      isDestructible,
      speedOffset: isHunter ? 1.5 : rand(-0.5, 0.5)
    });
  }

  function spawnPickup() {
    const laneIdx = Math.floor(rand(0, LANES.length));
    const x = LANES[laneIdx];
    const z = -ROAD_LENGTH + 50;

    const typeRoll = Math.random();
    let type = 'ORB'; // ORB (cyan), SHIELD (magenta), BOMB (yellow)
    let color = 0x00f3ff;
    let geom;

    if (typeRoll < 0.65) {
      type = 'ORB';
      color = 0x00f3ff;
      geom = new THREE.OctahedronGeometry(0.7);
    } else if (typeRoll < 0.85) {
      type = 'SHIELD';
      color = 0xff00aa;
      geom = new THREE.TorusGeometry(0.6, 0.2, 8, 16);
    } else {
      type = 'BOMB';
      color = 0xffea00;
      geom = new THREE.IcosahedronGeometry(0.7);
    }

    const mat = new THREE.MeshBasicMaterial({ color, wireframe: true });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, 1.2, z);
    scene.add(mesh);

    pickups.push({ mesh, type, laneIdx });
  }

  // --- Keyboard & Input ---
  function onKeyDown(e) {
    const k = e.key.toLowerCase();
    keys[k] = true;

    if (gameState === 'PLAYING') {
      if (k === 'arrowleft' || k === 'a') {
        if (targetLane > 0) targetLane--;
      }
      if (k === 'arrowright' || k === 'd') {
        if (targetLane < LANES.length - 1) targetLane++;
      }
      if (k === ' ') {
        isBoosting = true;
        audio.playBoost();
      }
      if (k === 'p') togglePause();
    } else if (gameState === 'PAUSED' && k === 'p') {
      togglePause();
    }
  }

  function onKeyUp(e) {
    const k = e.key.toLowerCase();
    keys[k] = false;
    if (k === ' ') isBoosting = false;
  }

  function setupTouchControls() {
    let startX = 0;
    window.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    });
    window.addEventListener('touchend', e => {
      const endX = e.changedTouches[0].clientX;
      const diff = endX - startX;
      if (Math.abs(diff) > 30 && gameState === 'PLAYING') {
        if (diff < 0 && targetLane > 0) targetLane--;
        if (diff > 0 && targetLane < LANES.length - 1) targetLane++;
      }
    });
  }

  function togglePause() {
    if (gameState === 'PLAYING') {
      gameState = 'PAUSED';
      pauseModal.classList.remove('hidden');
    } else if (gameState === 'PAUSED') {
      gameState = 'PLAYING';
      pauseModal.classList.add('hidden');
      animate();
    }
  }

  function rand(min, max) { return min + Math.random() * (max - min); }

  // --- Game Loop Update ---
  function update() {
    time++;

    // Speed & Boost Logic
    currentSpeed = isBoosting && boostAmount > 0 ? MAX_SPEED : BASE_SPEED + Math.min(time * 0.02, 50);
    if (isBoosting && boostAmount > 0) {
      boostAmount = Math.max(0, boostAmount - 0.8);
    } else if (boostAmount < 100) {
      boostAmount = Math.min(100, boostAmount + 0.25);
    }
    boostInnerEl.style.width = `${boostAmount}%`;
    audio.updateEngine(currentSpeed / MAX_SPEED);

    // Road Curve Effect
    curveOffset = Math.sin(time * 0.015) * 8;
    sunMesh.position.x = curveOffset * 1.5;

    // Smooth Player Lane Movement & Steering Lean
    const targetX = LANES[targetLane];
    playerPosX += (targetX - playerPosX) * 0.2;
    playerCar.position.x = playerPosX;

    const steerDelta = targetX - playerPosX;
    playerCar.rotation.z = -steerDelta * 0.12; // Bank angle
    playerCar.rotation.y = -steerDelta * 0.05;

    // Camera FOV and Shake
    const targetFov = isBoosting ? 75 : 60;
    camera.fov += (targetFov - camera.fov) * 0.1;
    camera.updateProjectionMatrix();

    if (cameraShake > 0) {
      camera.position.x = rand(-cameraShake, cameraShake);
      camera.position.y = 4.2 + rand(-cameraShake, cameraShake);
      cameraShake *= 0.85;
    } else {
      camera.position.x = 0;
      camera.position.y = 4.2;
    }

    // Scroll Road Segments
    const scrollDelta = currentSpeed * 0.05;
    roadSegments.forEach(seg => {
      seg.position.z += scrollDelta;
      if (seg.position.z > 20) {
        seg.position.z -= ROAD_LENGTH;
      }
      // Apply curve bend based on Z depth
      const zFactor = Math.abs(seg.position.z) / ROAD_LENGTH;
      seg.position.x = Math.sin(zFactor * Math.PI) * curveOffset;
    });

    // Spawning logic
    if (Math.random() < 0.035) spawnObstacle();
    if (Math.random() < 0.025) spawnPickup();

    // Update Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.mesh.position.z += scrollDelta - obs.speedOffset;

      // Hunter homing drift
      if (obs.isHunter && obs.mesh.position.z < -20) {
        const diffX = playerCar.position.x - obs.mesh.position.x;
        obs.mesh.position.x += Math.sign(diffX) * 0.08;
      }

      // Collision check with player
      const dz = Math.abs(obs.mesh.position.z - playerCar.position.z);
      const dx = Math.abs(obs.mesh.position.x - playerCar.position.x);

      if (dz < 2.5 && dx < 2.0) {
        if (isBoosting && obs.isDestructible) {
          // Destructible bonus hit while boosting!
          audio.playExplosion();
          cameraShake = 0.8;
          scene.remove(obs.mesh);
          obstacles.splice(i, 1);
          score += 250 * combo;
          continue;
        } else if (shieldActive) {
          // Shield absorbs crash
          audio.playExplosion();
          cameraShake = 0.6;
          shieldActive = false;
          shieldBubbleMesh.visible = false;
          shieldStatusEl.classList.remove('active');
          scene.remove(obs.mesh);
          obstacles.splice(i, 1);
          continue;
        } else {
          // Game Over Crash
          audio.playExplosion();
          cameraShake = 1.2;
          triggerGameOver();
          return;
        }
      }

      // Despawn behind camera
      if (obs.mesh.position.z > 20) {
        scene.remove(obs.mesh);
        obstacles.splice(i, 1);
      }
    }

    // Update Pickups
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i];
      p.mesh.position.z += scrollDelta;
      p.mesh.rotation.y += 0.05;

      const dz = Math.abs(p.mesh.position.z - playerCar.position.z);
      const dx = Math.abs(p.mesh.position.x - playerCar.position.x);

      if (dz < 2.2 && dx < 1.8) {
        audio.playPickup();
        if (p.type === 'ORB') {
          combo = Math.min(combo + 1, 20);
          comboTimer = 180;
          score += 100 * combo;
        } else if (p.type === 'SHIELD') {
          shieldActive = true;
          shieldBubbleMesh.visible = true;
          shieldStatusEl.classList.add('active');
        } else if (p.type === 'BOMB') {
          // EMP shockwave clears nearby obstacles
          audio.playExplosion();
          cameraShake = 0.8;
          boostAmount = 100;
          obstacles.forEach(o => scene.remove(o.mesh));
          obstacles = [];
          score += 500;
        }

        scene.remove(p.mesh);
        pickups.splice(i, 1);
        continue;
      }

      if (p.mesh.position.z > 20) {
        scene.remove(p.mesh);
        pickups.splice(i, 1);
      }
    }

    // Combo Timer Decay
    if (comboTimer > 0) {
      comboTimer--;
      if (comboTimer === 0) combo = 1;
    }

    // Score & HUD Updates
    score += Math.floor(currentSpeed * 0.05 * combo);
    scoreEl.textContent = Math.floor(score);
    speedEl.textContent = Math.floor(currentSpeed);
    comboEl.textContent = combo > 1 ? `COMBO x${combo}` : '';

    // Update Lane Indicator HUD
    document.querySelectorAll('.lane-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === targetLane);
    });
  }

  // --- Render Loop ---
  function animate() {
    if (gameState === 'PLAYING') {
      update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    } else if (gameState === 'MENU') {
      // Menu background ambient camera drift
      time += 0.5;
      roadSegments.forEach(seg => {
        seg.position.z += 1.5;
        if (seg.position.z > 20) seg.position.z -= ROAD_LENGTH;
      });
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
  }

  // --- Reset & Game Over ---
  function startGame() {
    audio.init();
    gameState = 'PLAYING';

    score = 0;
    combo = 1;
    comboTimer = 0;
    time = 0;
    targetLane = 2;
    playerPosX = 0;
    shieldActive = false;
    boostAmount = 100;
    shieldBubbleMesh.visible = false;
    shieldStatusEl.classList.remove('active');

    // Clear active hazards
    obstacles.forEach(o => scene.remove(o.mesh));
    pickups.forEach(p => scene.remove(p.mesh));
    obstacles = [];
    pickups = [];

    menuModal.classList.add('hidden');
    gameOverModal.classList.add('hidden');
    pauseModal.classList.add('hidden');

    animate();
  }

  function triggerGameOver() {
    gameState = 'GAMEOVER';

    const finalScore = Math.floor(score);
    finalScoreEl.textContent = finalScore;

    if (finalScore > bestScore) {
      bestScore = finalScore;
      localStorage.setItem('neondrift_3d_best', bestScore);
      bestEl.textContent = bestScore;
    }
    finalBestEl.textContent = bestScore;

    gameOverModal.classList.remove('hidden');
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Button Listeners
  startBtn.addEventListener('click', startGame);
  retryBtn.addEventListener('click', startGame);
  resumeBtn.addEventListener('click', togglePause);

  // Initialize Scene
  initThree();
  animate();
})();
