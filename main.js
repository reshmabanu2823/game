/* NEON HIGHWAY — Full Multi-Page SPA Router & 3D Game Engine */

(() => {
  // --- CAR SKINS DEFINITION ---
  const CAR_SKINS = [
    { id: 'cyber', name: 'Cyber Streak', reqScore: 0, bodyColor: 0x070b14, glowColor: 0x00f3ff, tailColor: 0xff00aa, desc: 'Standard issue high-speed synthwave cruiser.' },
    { id: 'phantom', name: 'Phantom Neon', reqScore: 2500, bodyColor: 0x140712, glowColor: 0xff00aa, tailColor: 0x00f3ff, desc: 'Unlocked at 2,500 pts. Sleek magenta glow variant.' },
    { id: 'solar', name: 'Solar Flare', reqScore: 5000, bodyColor: 0x181205, glowColor: 0xffea00, tailColor: 0xff7700, desc: 'Unlocked at 5,000 pts. Radiant yellow nitro chassis.' },
    { id: 'vaporwave', name: 'Vaporwave Special', reqScore: 10000, bodyColor: 0x0a0518, glowColor: 0x9900ff, tailColor: 0x00f3ff, desc: 'Unlocked at 10,000 pts. Ultra-violet grid racer.' },
    { id: 'titan', name: 'Titan Dark', reqScore: 20000, bodyColor: 0x05140d, glowColor: 0x00ffaa, tailColor: 0xffea00, desc: 'Unlocked at 20,000 pts. Emerald energy power vehicle.' }
  ];

  // --- LOCAL STORAGE MANAGER ---
  const Storage = {
    getBestScore: () => Number(localStorage.getItem('neondrift_3d_best') || 0),
    setBestScore: (s) => localStorage.setItem('neondrift_3d_best', s),
    getSelectedCar: () => localStorage.getItem('neondrift_3d_car') || 'cyber',
    setSelectedCar: (id) => localStorage.setItem('neondrift_3d_car', id),
    getLeaderboard: () => JSON.parse(localStorage.getItem('neondrift_3d_leaderboard') || '[]'),
    setLeaderboard: (data) => localStorage.setItem('neondrift_3d_leaderboard', JSON.stringify(data)),
    getSettings: () => JSON.parse(localStorage.getItem('neondrift_3d_settings') || '{"sound":true,"shake":true,"input":"keyboard","reducedMotion":false}'),
    setSettings: (cfg) => localStorage.setItem('neondrift_3d_settings', JSON.stringify(cfg)),
    clearAll: () => {
      localStorage.removeItem('neondrift_3d_best');
      localStorage.removeItem('neondrift_3d_car');
      localStorage.removeItem('neondrift_3d_leaderboard');
      localStorage.removeItem('neondrift_3d_settings');
    }
  };

  // --- AUDIO SYNTHESIZER ---
  class SoundSynth {
    constructor() {
      this.ctx = null;
      this.engineOsc = null;
      this.engineGain = null;
      this.isInit = false;
      this.muted = !Storage.getSettings().sound;
    }

    init() {
      if (this.isInit || this.muted) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
        this.isInit = true;
        this.startEngine();
      } catch (e) { console.warn('AudioContext not supported'); }
    }

    startEngine() {
      if (!this.ctx || this.muted) return;
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(60, this.ctx.currentTime);
      this.engineGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();
    }

    updateEngine(speedRatio) {
      if (!this.ctx || !this.engineOsc || this.muted) return;
      const targetFreq = 50 + speedRatio * 180;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    }

    playPickup(freq = 587) {
      if (!this.ctx || this.muted) return;
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
      if (!this.ctx || this.muted) return;
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start();
    }
  }

  const audio = new SoundSynth();

  // --- GAME & THREE.JS GLOBALS ---
  const LANES = [-8, -4, 0, 4, 8];
  const ROAD_WIDTH = 22;
  const ROAD_LENGTH = 500;
  const SEGMENT_LENGTH = 10;

  let scene, camera, renderer;
  let roadGroup, sunMesh, mountainGroup;
  let playerCar, playerBodyMesh, playerCabinMesh, playerTailMesh, shieldBubbleMesh;
  let obstacles = [];
  let pickups = [];
  let roadSegments = [];

  let currentView = 'home';
  let isPlaying = false;
  let isPaused = false;

  let targetLane = 2;
  let playerPosX = 0;
  let currentSpeed = 70;
  const BASE_SPEED = 70;
  const MAX_SPEED = 160;
  let isBoosting = false;
  let boostAmount = 100;

  let score = 0;
  let combo = 1;
  let comboTimer = 0;
  let shieldActive = false;
  let time = 0;
  let cameraShake = 0;
  let curveOffset = 0;

  const keys = {};

  // --- SPA ROUTER & NAVIGATION ---
  function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    switchView(hash);
  }

  function switchView(viewId) {
    currentView = viewId;
    const views = document.querySelectorAll('.view-page');
    views.forEach(v => v.classList.remove('active'));

    const targetView = document.getElementById(`view-${viewId}`) || document.getElementById('view-home');
    targetView.classList.add('active');

    // Update active navbar link
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === viewId);
    });

    // Toggle 3D canvas visibility & race mode
    const uiContainer = document.getElementById('ui-container');
    if (viewId === 'play') {
      uiContainer.style.display = 'flex';
      if (!isPlaying) startRace();
    } else {
      uiContainer.style.display = 'none';
      isPlaying = false;
      isPaused = false;
      document.getElementById('pauseModal').classList.add('hidden');
      document.getElementById('gameOverModal').classList.add('hidden');
    }

    // Refresh view specific contents
    if (viewId === 'home') updateHomeRibbon();
    if (viewId === 'leaderboard') renderLeaderboard();
    if (viewId === 'garage') renderGarage();
    if (viewId === 'settings') renderSettings();
  }

  function updateHomeRibbon() {
    const best = Storage.getBestScore();
    const ribbon = document.getElementById('homeBestRibbon');
    if (best > 0) {
      ribbon.innerHTML = `🏆 YOUR PERSONAL BEST HIGH SCORE: <strong>${best} PTS</strong>`;
      ribbon.style.display = 'inline-flex';
    } else {
      ribbon.style.display = 'none';
    }
  }

  // --- THREE.JS INITIALIZATION ---
  function initThree() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04040a);
    scene.fog = new THREE.FogExp2(0x0c061a, 0.0055);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 800);
    camera.position.set(0, 4.2, 12);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f3ff, 0.8);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    buildEnvironment();
    buildRoad();
    buildPlayerCar();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  }

  function buildEnvironment() {
    const sunGeom = new THREE.CircleGeometry(45, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xff7700, side: THREE.DoubleSide });
    sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sunMesh.position.set(0, 20, -350);
    scene.add(sunMesh);

    const gridHelper = new THREE.GridHelper(1000, 80, 0xff00aa, 0x00f3ff);
    gridHelper.position.y = -0.5;
    gridHelper.position.z = -200;
    scene.add(gridHelper);

    mountainGroup = new THREE.Group();
    for (let i = -10; i <= 10; i++) {
      if (Math.abs(i) < 2) continue;
      const mGeom = new THREE.ConeGeometry(rand(20, 40), rand(30, 60), 4);
      const mMat = new THREE.MeshLambertMaterial({ color: 0x090518, flatShading: true });
      const m = new THREE.Mesh(mGeom, mMat);
      m.position.set(i * 35, 10, -340 + rand(-20, 20));
      m.rotation.y = Math.PI / 4;
      mountainGroup.add(m);
    }
    scene.add(mountainGroup);
  }

  function buildRoad() {
    roadGroup = new THREE.Group();
    const numSegments = ROAD_LENGTH / SEGMENT_LENGTH;
    for (let i = 0; i < numSegments; i++) {
      const z = -i * SEGMENT_LENGTH;
      const segGeom = new THREE.PlaneGeometry(ROAD_WIDTH, SEGMENT_LENGTH);
      const segMat = new THREE.MeshStandardMaterial({
        color: (i % 2 === 0) ? 0x0a0c16 : 0x080912,
        roughness: 0.4, metalness: 0.6
      });
      const seg = new THREE.Mesh(segGeom, segMat);
      seg.rotation.x = -Math.PI / 2;
      seg.position.set(0, 0, z);

      LANES.forEach((xPos, idx) => {
        if (idx === 0 || idx === LANES.length - 1) return;
        const lineGeom = new THREE.PlaneGeometry(0.2, SEGMENT_LENGTH * 0.5);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
        const line = new THREE.Mesh(lineGeom, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(xPos, 0.02, 0);
        seg.add(line);
      });

      roadGroup.add(seg);
      roadSegments.push(seg);
    }
    scene.add(roadGroup);
  }

  function buildPlayerCar() {
    playerCar = new THREE.Group();

    const bodyGeom = new THREE.BoxGeometry(2.2, 0.7, 4.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x070b14, roughness: 0.2, metalness: 0.8 });
    playerBodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    playerBodyMesh.position.y = 0.5;
    playerCar.add(playerBodyMesh);

    const cabinGeom = new THREE.BoxGeometry(1.7, 0.55, 2.0);
    const cabinMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
    playerCabinMesh = new THREE.Mesh(cabinGeom, cabinMat);
    playerCabinMesh.position.set(0, 1.0, -0.3);
    playerCar.add(playerCabinMesh);

    const tailGeom = new THREE.BoxGeometry(2.0, 0.15, 0.1);
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff00aa });
    playerTailMesh = new THREE.Mesh(tailGeom, tailMat);
    playerTailMesh.position.set(0, 0.65, 2.1);
    playerCar.add(playerTailMesh);

    const wheelGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
    [[-1.1, 1.3], [1.1, 1.3], [-1.1, -1.3], [1.1, -1.3]].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(wheelGeom, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.4, wz);
      playerCar.add(wheel);
    });

    const shieldGeom = new THREE.SphereGeometry(2.8, 16, 16);
    const shieldMat = new THREE.MeshBasicMaterial({ color: 0xff00aa, wireframe: true, transparent: true, opacity: 0.6 });
    shieldBubbleMesh = new THREE.Mesh(shieldGeom, shieldMat);
    shieldBubbleMesh.visible = false;
    playerCar.add(shieldBubbleMesh);

    playerCar.position.set(0, 0, 0);
    scene.add(playerCar);
    applySelectedCarSkin();
  }

  function applySelectedCarSkin() {
    const activeId = Storage.getSelectedCar();
    const skin = CAR_SKINS.find(s => s.id === activeId) || CAR_SKINS[0];
    if (playerBodyMesh) playerBodyMesh.material.color.setHex(skin.bodyColor);
    if (playerCabinMesh) playerCabinMesh.material.color.setHex(skin.glowColor);
    if (playerTailMesh) playerTailMesh.material.color.setHex(skin.tailColor);
  }

  // --- GAME LOOP & SPAWNER ---
  function spawnObstacle() {
    const laneIdx = Math.floor(rand(0, LANES.length));
    const x = LANES[laneIdx];
    const z = -ROAD_LENGTH + 50;

    const isHunter = time > 2200 && Math.random() < 0.35;
    const isDestructible = !isHunter && Math.random() < 0.25;

    let mesh;
    if (isHunter) {
      const hGeom = new THREE.BoxGeometry(2.0, 0.8, 3.8);
      const hMat = new THREE.MeshBasicMaterial({ color: 0xff7700, wireframe: true });
      mesh = new THREE.Mesh(hGeom, hMat);
    } else if (isDestructible) {
      const dGeom = new THREE.BoxGeometry(2.6, 1.4, 0.8);
      const dMat = new THREE.MeshBasicMaterial({ color: 0xffea00, wireframe: true });
      mesh = new THREE.Mesh(dGeom, dMat);
    } else {
      const rGeom = new THREE.BoxGeometry(2.2, 0.9, 3.6);
      const rMat = new THREE.MeshStandardMaterial({ color: 0xff0044, roughness: 0.3, metalness: 0.7 });
      mesh = new THREE.Mesh(rGeom, rMat);
    }

    mesh.position.set(x, 0.6, z);
    scene.add(mesh);
    obstacles.push({ mesh, isHunter, isDestructible, speedOffset: isHunter ? 1.5 : rand(-0.5, 0.5) });
  }

  function spawnPickup() {
    const laneIdx = Math.floor(rand(0, LANES.length));
    const x = LANES[laneIdx];
    const z = -ROAD_LENGTH + 50;

    const roll = Math.random();
    let type = 'ORB', color = 0x00f3ff, geom;
    if (roll < 0.65) { type = 'ORB'; color = 0x00f3ff; geom = new THREE.OctahedronGeometry(0.7); }
    else if (roll < 0.85) { type = 'SHIELD'; color = 0xff00aa; geom = new THREE.TorusGeometry(0.6, 0.2, 8, 16); }
    else { type = 'BOMB'; color = 0xffea00; geom = new THREE.IcosahedronGeometry(0.7); }

    const mat = new THREE.MeshBasicMaterial({ color, wireframe: true });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, 1.2, z);
    scene.add(mesh);
    pickups.push({ mesh, type });
  }

  function onKeyDown(e) {
    const k = e.key.toLowerCase();
    keys[k] = true;
    if (currentView === 'play' && isPlaying) {
      if (k === 'arrowleft' || k === 'a') { if (targetLane > 0) targetLane--; }
      if (k === 'arrowright' || k === 'd') { if (targetLane < LANES.length - 1) targetLane++; }
      if (k === ' ') { isBoosting = true; audio.playBoost(); }
      if (k === 'p' || k === 'escape') togglePause();
    }
  }

  function onKeyUp(e) {
    const k = e.key.toLowerCase();
    keys[k] = false;
    if (k === ' ') isBoosting = false;
  }

  function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseModal').classList.toggle('hidden', !isPaused);
  }

  function rand(min, max) { return min + Math.random() * (max - min); }

  function updateGame() {
    if (!isPlaying || isPaused) return;
    time++;

    const cfg = Storage.getSettings();
    currentSpeed = isBoosting && boostAmount > 0 ? MAX_SPEED : BASE_SPEED + Math.min(time * 0.02, 50);

    if (isBoosting && boostAmount > 0) boostAmount = Math.max(0, boostAmount - 0.8);
    else if (boostAmount < 100) boostAmount = Math.min(100, boostAmount + 0.25);

    document.getElementById('boost-meter-inner').style.width = `${boostAmount}%`;
    audio.updateEngine(currentSpeed / MAX_SPEED);

    curveOffset = Math.sin(time * 0.015) * 8;
    sunMesh.position.x = curveOffset * 1.5;

    const targetX = LANES[targetLane];
    playerPosX += (targetX - playerPosX) * 0.2;
    playerCar.position.x = playerPosX;

    const steerDelta = targetX - playerPosX;
    playerCar.rotation.z = -steerDelta * 0.12;
    playerCar.rotation.y = -steerDelta * 0.05;

    const targetFov = isBoosting ? 75 : 60;
    camera.fov += (targetFov - camera.fov) * 0.1;
    camera.updateProjectionMatrix();

    if (cameraShake > 0 && cfg.shake) {
      camera.position.x = rand(-cameraShake, cameraShake);
      camera.position.y = 4.2 + rand(-cameraShake, cameraShake);
      cameraShake *= 0.85;
    } else { camera.position.x = 0; camera.position.y = 4.2; }

    const scrollDelta = currentSpeed * 0.05;
    roadSegments.forEach(seg => {
      seg.position.z += scrollDelta;
      if (seg.position.z > 20) seg.position.z -= ROAD_LENGTH;
      const zFactor = Math.abs(seg.position.z) / ROAD_LENGTH;
      seg.position.x = Math.sin(zFactor * Math.PI) * curveOffset;
    });

    if (Math.random() < 0.035) spawnObstacle();
    if (Math.random() < 0.025) spawnPickup();

    // Obstacle collisions
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.mesh.position.z += scrollDelta - obs.speedOffset;

      if (obs.isHunter && obs.mesh.position.z < -20) {
        const diffX = playerCar.position.x - obs.mesh.position.x;
        obs.mesh.position.x += Math.sign(diffX) * 0.08;
      }

      const dz = Math.abs(obs.mesh.position.z - playerCar.position.z);
      const dx = Math.abs(obs.mesh.position.x - playerCar.position.x);

      if (dz < 2.5 && dx < 2.0) {
        if (isBoosting && obs.isDestructible) {
          audio.playExplosion();
          cameraShake = 0.8;
          scene.remove(obs.mesh);
          obstacles.splice(i, 1);
          score += 250 * combo;
          continue;
        } else if (shieldActive) {
          audio.playExplosion();
          cameraShake = 0.6;
          shieldActive = false;
          shieldBubbleMesh.visible = false;
          document.getElementById('shield-bar-container').classList.remove('active');
          scene.remove(obs.mesh);
          obstacles.splice(i, 1);
          continue;
        } else {
          audio.playExplosion();
          cameraShake = 1.2;
          triggerGameOver();
          return;
        }
      }

      if (obs.mesh.position.z > 20) { scene.remove(obs.mesh); obstacles.splice(i, 1); }
    }

    // Pickups
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
          document.getElementById('shield-bar-container').classList.add('active');
        } else if (p.type === 'BOMB') {
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

      if (p.mesh.position.z > 20) { scene.remove(p.mesh); pickups.splice(i, 1); }
    }

    if (comboTimer > 0) { comboTimer--; if (comboTimer === 0) combo = 1; }

    score += Math.floor(currentSpeed * 0.05 * combo);
    document.getElementById('score').textContent = Math.floor(score);
    document.getElementById('best').textContent = Math.max(Math.floor(score), Storage.getBestScore());
    document.getElementById('speedometer').textContent = Math.floor(currentSpeed);
    document.getElementById('combo-display').textContent = combo > 1 ? `COMBO x${combo}` : '';

    document.querySelectorAll('.lane-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === targetLane);
    });
  }

  function renderLoop() {
    if (currentView === 'play' && isPlaying && !isPaused) {
      updateGame();
    } else {
      // Ambient camera movement for non-race pages
      time += 0.5;
      roadSegments.forEach(seg => {
        seg.position.z += 1.5;
        if (seg.position.z > 20) seg.position.z -= ROAD_LENGTH;
      });
    }
    renderer.render(scene, camera);
    requestAnimationFrame(renderLoop);
  }

  function startRace() {
    audio.init();
    isPlaying = true;
    isPaused = false;
    score = 0;
    combo = 1;
    comboTimer = 0;
    time = 0;
    targetLane = 2;
    playerPosX = 0;
    shieldActive = false;
    boostAmount = 100;
    shieldBubbleMesh.visible = false;
    document.getElementById('shield-bar-container').classList.remove('active');

    obstacles.forEach(o => scene.remove(o.mesh));
    pickups.forEach(p => scene.remove(p.mesh));
    obstacles = []; pickups = [];

    document.getElementById('pauseModal').classList.add('hidden');
    document.getElementById('gameOverModal').classList.add('hidden');
  }

  function triggerGameOver() {
    isPlaying = false;
    const finalScore = Math.floor(score);
    const prevBest = Storage.getBestScore();

    if (finalScore > prevBest) {
      Storage.setBestScore(finalScore);
    }

    document.getElementById('finalScore').textContent = finalScore;
    document.getElementById('finalBest').textContent = Storage.getBestScore();

    // Check if score qualifies for top 10 leaderboard
    const lb = Storage.getLeaderboard();
    if (lb.length < 10 || finalScore > (lb[lb.length - 1]?.score || 0)) {
      setTimeout(() => {
        const name = prompt('NEW HIGH SCORE! Enter your driver name:', 'Racer-X') || 'Anonymous';
        lb.push({ name, score: finalScore, car: Storage.getSelectedCar(), date: new Date().toLocaleDateString() });
        lb.sort((a, b) => b.score - a.score);
        Storage.setLeaderboard(lb.slice(0, 10));
      }, 300);
    }

    document.getElementById('gameOverModal').classList.remove('hidden');
  }

  // --- GARAGE VIEW RENDERER ---
  function renderGarage() {
    const grid = document.getElementById('garageGrid');
    const bestScore = Storage.getBestScore();
    const activeCar = Storage.getSelectedCar();

    grid.innerHTML = CAR_SKINS.map(skin => {
      const isUnlocked = bestScore >= skin.reqScore;
      const isSelected = activeCar === skin.id;

      return `
        <div class="car-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}">
          <div class="car-preview-box">
            <div style="width:50px; height:20px; background:#${skin.bodyColor.toString(16).padStart(6,'0')}; border:2px solid #${skin.glowColor.toString(16).padStart(6,'0')}; border-radius:4px; box-shadow:0 0 15px #${skin.glowColor.toString(16).padStart(6,'0')};"></div>
          </div>
          <div class="car-name">${skin.name}</div>
          <div class="car-condition">${isUnlocked ? 'STATUS: UNLOCKED' : `REQUIRES: ${skin.reqScore.toLocaleString()} PTS`}</div>
          <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px;">${skin.desc}</p>
          ${isUnlocked
            ? `<button class="btn-secondary select-car-btn" data-id="${skin.id}">${isSelected ? 'EQUIPPED' : 'SELECT CAR'}</button>`
            : `<button class="btn-secondary" disabled style="opacity:0.5; cursor:not-allowed;">LOCKED</button>`
          }
        </div>
      `;
    }).join('');

    document.querySelectorAll('.select-car-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        Storage.setSelectedCar(id);
        applySelectedCarSkin();
        renderGarage();
      });
    });
  }

  // --- LEADERBOARD VIEW RENDERER ---
  function renderLeaderboard() {
    const tableBody = document.getElementById('leaderboardBody');
    const lb = Storage.getLeaderboard();

    if (lb.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">
            No high scores recorded yet! <a href="#play" style="color:var(--cyan);">Drive a run to set the first score.</a>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = lb.map((entry, idx) => `
      <tr>
        <td><span class="rank-badge ${idx < 3 ? `rank-${idx+1}` : 'rank-other'}">${idx + 1}</span></td>
        <td style="font-weight:bold; color:#fff;">${entry.name}</td>
        <td style="color:var(--cyan); font-weight:bold; font-family:'Orbitron';">${entry.score.toLocaleString()}</td>
        <td style="color:var(--yellow); text-transform:uppercase;">${entry.car}</td>
        <td style="color:var(--text-muted); font-size:13px;">${entry.date}</td>
      </tr>
    `).join('');
  }

  // --- SETTINGS VIEW RENDERER ---
  function renderSettings() {
    const cfg = Storage.getSettings();
    document.getElementById('settingSound').checked = cfg.sound;
    document.getElementById('settingShake').checked = cfg.shake;

    document.getElementById('settingSound').onchange = (e) => {
      cfg.sound = e.target.checked;
      audio.muted = !cfg.sound;
      Storage.setSettings(cfg);
    };

    document.getElementById('settingShake').onchange = (e) => {
      cfg.shake = e.target.checked;
      Storage.setSettings(cfg);
    };

    document.getElementById('resetDataBtn').onclick = () => {
      if (confirm('Are you sure you want to reset all high scores, garage unlocks, and settings?')) {
        Storage.clearAll();
        alert('All saved data has been reset.');
        location.reload();
      }
    };
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // --- ATTACH EVENT LISTENERS & START ---
  document.getElementById('startRaceBtn').addEventListener('click', () => window.location.hash = '#play');
  document.getElementById('retryBtn').addEventListener('click', startRace);
  document.getElementById('resumeBtn').addEventListener('click', togglePause);

  initThree();
  initRouter();
  renderLoop();
})();
