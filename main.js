/* NEON HIGHWAY — Campaign, World Map, Branching Roads & Challenge Engine */

(() => {
  // --- ZONES CONFIGURATION ---
  const ZONES = [
    { id: 'district', name: 'Neon District', difficulty: 'Normal', icon: '🌃', reqScore: 0, fogColor: 0x0c061a, sunColor: 0xff7700, desc: 'Downtown synthwave grid. Balanced traffic density.' },
    { id: 'desert', name: 'Desert Overpass', difficulty: 'Fast', icon: '🌅', reqScore: 2000, fogColor: 0x1e0802, sunColor: 0xffea00, desc: 'High-speed sunset freeway with long straightaways.' },
    { id: 'rain', name: 'Rain City', difficulty: 'Hard', icon: '🌧️', reqScore: 6000, fogColor: 0x150020, sunColor: 0xff00aa, desc: 'Twilight rain environment with dense traffic & obstacles.' },
    { id: 'orbital', name: 'Orbital Ring', difficulty: 'Extreme', icon: '🌌', reqScore: 12000, fogColor: 0x001525, sunColor: 0x00f3ff, desc: 'Space highway with intense homing hunter vehicles.' }
  ];

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
    getLastDriverName: () => localStorage.getItem('neondrift_3d_lastname') || 'Racer-X',
    setLastDriverName: (name) => localStorage.setItem('neondrift_3d_lastname', name),
    getSelectedCar: () => localStorage.getItem('neondrift_3d_car') || 'cyber',
    setSelectedCar: (id) => localStorage.setItem('neondrift_3d_car', id),
    getSelectedZone: () => localStorage.getItem('neondrift_3d_zone') || 'district',
    setSelectedZone: (id) => localStorage.setItem('neondrift_3d_zone', id),
    getSelectedMode: () => localStorage.getItem('neondrift_3d_mode') || 'endless',
    setSelectedMode: (id) => localStorage.setItem('neondrift_3d_mode', id),
    getCampaign: () => JSON.parse(localStorage.getItem('neondrift_3d_campaign') || '{"completed":[]}'),
    setCampaign: (c) => localStorage.setItem('neondrift_3d_campaign', JSON.stringify(c)),
    getLeaderboard: () => JSON.parse(localStorage.getItem('neondrift_3d_leaderboard') || '[]'),
    setLeaderboard: (data) => localStorage.setItem('neondrift_3d_leaderboard', JSON.stringify(data)),
    getSettings: () => JSON.parse(localStorage.getItem('neondrift_3d_settings') || '{"sound":true,"shake":true,"input":"keyboard"}'),
    setSettings: (cfg) => localStorage.setItem('neondrift_3d_settings', JSON.stringify(cfg)),
    clearAll: () => {
      localStorage.removeItem('neondrift_3d_best');
      localStorage.removeItem('neondrift_3d_lastname');
      localStorage.removeItem('neondrift_3d_car');
      localStorage.removeItem('neondrift_3d_zone');
      localStorage.removeItem('neondrift_3d_mode');
      localStorage.removeItem('neondrift_3d_campaign');
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

    playBoost() {
      if (!this.ctx || this.muted) return;
      this.playPickup(440);
      this.playPickup(880);
    }
  }

  const audio = new SoundSynth();

  // --- THREE.JS & GAME GLOBALS ---
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
  let pendingHighScore = null;

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
  let distanceMeters = 0;
  let cameraShake = 0;
  let curveOffset = 0;

  let modeTimer = 0;
  let collectedOrbs = 0;
  let zeroDamageHit = false;

  let forkWarningTime = 0;
  let activeBranchType = 'NORMAL';

  const keys = {};

  // --- ROUTER ---
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
    document.querySelectorAll('.view-page').forEach(v => v.classList.remove('active'));

    const targetView = document.getElementById(`view-${viewId}`) || document.getElementById('view-home');
    targetView.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === viewId);
    });

    const uiContainer = document.getElementById('ui-container');
    if (viewId === 'play') {
      uiContainer.style.display = 'flex';
      updatePlaybackControlsHUD();
      if (!isPlaying) startRace();
    } else {
      uiContainer.style.display = 'none';
      isPlaying = false;
      isPaused = false;
      document.getElementById('pauseModal').classList.add('hidden');
      document.getElementById('gameOverModal').classList.add('hidden');
      document.getElementById('highScoreModal').classList.add('hidden');
      document.getElementById('confirmModal').classList.add('hidden');
      updatePlaybackControlsHUD();
    }

    if (viewId === 'home') updateHomeRibbon();
    if (viewId === 'map') renderWorldMap();
    if (viewId === 'leaderboard') renderLeaderboard();
    if (viewId === 'garage') renderGarage();
    if (viewId === 'settings') renderSettings();
  }

  function updateHomeRibbon() {
    const best = Storage.getBestScore();
    const ribbon = document.getElementById('homeBestRibbon');
    if (best > 0) {
      ribbon.innerHTML = `🏆 YOUR PERSONAL BEST HIGH SCORE: <strong>${best.toLocaleString()} PTS</strong>`;
      ribbon.style.display = 'inline-flex';
    } else { ribbon.style.display = 'none'; }
  }

  function updatePlaybackControlsHUD() {
    const btnTopPlay = document.getElementById('btn-top-play');
    const btnTopPause = document.getElementById('btn-top-pause');
    const btnTopResume = document.getElementById('btn-top-resume');

    const btnHudPlay = document.getElementById('btn-hud-play');
    const btnHudPause = document.getElementById('btn-hud-pause');
    const btnHudResume = document.getElementById('btn-hud-resume');

    if (!isPlaying) {
      btnTopPlay.style.display = 'inline-flex';
      btnTopPause.style.display = 'none';
      btnTopResume.style.display = 'none';

      btnHudPlay.style.display = 'inline-flex';
      btnHudPause.style.display = 'none';
      btnHudResume.style.display = 'none';
    } else if (isPaused) {
      btnTopPlay.style.display = 'none';
      btnTopPause.style.display = 'none';
      btnTopResume.style.display = 'inline-flex';

      btnHudPlay.style.display = 'none';
      btnHudPause.style.display = 'none';
      btnHudResume.style.display = 'inline-flex';
    } else {
      btnTopPlay.style.display = 'none';
      btnTopPause.style.display = 'inline-flex';
      btnTopResume.style.display = 'none';

      btnHudPlay.style.display = 'none';
      btnHudPause.style.display = 'inline-flex';
      btnHudResume.style.display = 'none';
    }
  }

  // --- THREE.JS ENGINE SETUP ---
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

    // Attach Top Header & HUD Playback Control Listeners
    document.getElementById('btn-top-play').addEventListener('click', () => { window.location.hash = '#play'; startRace(); });
    document.getElementById('btn-top-pause').addEventListener('click', togglePause);
    document.getElementById('btn-top-resume').addEventListener('click', togglePause);

    document.getElementById('btn-hud-play').addEventListener('click', startRace);
    document.getElementById('btn-hud-pause').addEventListener('click', togglePause);
    document.getElementById('btn-hud-resume').addEventListener('click', togglePause);

    setupHighScoreModalHandlers();
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

  function applyZoneTheme() {
    const activeZoneId = Storage.getSelectedZone();
    const zone = ZONES.find(z => z.id === activeZoneId) || ZONES[0];
    if (scene) scene.fog.color.setHex(zone.fogColor);
    if (sunMesh) sunMesh.material.color.setHex(zone.sunColor);
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

  function spawnObstacle() {
    const laneIdx = Math.floor(rand(0, LANES.length));
    const x = LANES[laneIdx];
    const z = -ROAD_LENGTH + 50;

    const mode = Storage.getSelectedMode();
    const isHunter = (mode === 'gauntlet' || time > 1800) && Math.random() < 0.45;
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
    if (roll < 0.7) { type = 'ORB'; color = 0x00f3ff; geom = new THREE.OctahedronGeometry(0.7); }
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
    if (!isPlaying) return;
    isPaused = !isPaused;
    document.getElementById('pauseModal').classList.toggle('hidden', !isPaused);
    updatePlaybackControlsHUD();
  }

  function rand(min, max) { return min + Math.random() * (max - min); }

  function updateGame() {
    if (!isPlaying || isPaused) return;
    time++;
    distanceMeters += Math.floor(currentSpeed * 0.05);

    const cfg = Storage.getSettings();
    const mode = Storage.getSelectedMode();

    if (time % 1600 === 0) {
      forkWarningTime = 120;
      document.getElementById('fork-banner').style.display = 'block';
    }
    if (forkWarningTime > 0) {
      forkWarningTime--;
      if (forkWarningTime === 0) {
        document.getElementById('fork-banner').style.display = 'none';
        if (targetLane <= 1) activeBranchType = 'SHORTCUT';
        else if (targetLane === 2) activeBranchType = 'HIGHWAY';
        else activeBranchType = 'HAZARD';
      }
    }

    currentSpeed = isBoosting && boostAmount > 0 ? MAX_SPEED : BASE_SPEED + Math.min(time * 0.02, 50);

    if (isBoosting && boostAmount > 0) boostAmount = Math.max(0, boostAmount - 0.8);
    else if (boostAmount < 100) boostAmount = Math.min(100, boostAmount + 0.25);

    document.getElementById('boost-meter-inner').style.width = `${boostAmount}%`;
    audio.updateEngine(currentSpeed / MAX_SPEED);

    curveOffset = Math.sin(time * 0.015) * (activeBranchType === 'HAZARD' ? 14 : 8);
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

    const spawnRate = activeBranchType === 'HAZARD' ? 0.05 : 0.035;
    if (Math.random() < spawnRate) spawnObstacle();
    if (Math.random() < 0.025) spawnPickup();

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
        zeroDamageHit = true;
        if (mode === 'zerodmg') {
          audio.playExplosion();
          triggerGameOver(false, 'Zero Damage Challenge Failed!');
          return;
        }

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
          triggerGameOver(false);
          return;
        }
      }

      if (obs.mesh.position.z > 20) { scene.remove(obs.mesh); obstacles.splice(i, 1); }
    }

    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i];
      p.mesh.position.z += scrollDelta;
      p.mesh.rotation.y += 0.05;

      const dz = Math.abs(p.mesh.position.z - playerCar.position.z);
      const dx = Math.abs(p.mesh.position.x - playerCar.position.x);

      if (dz < 2.2 && dx < 1.8) {
        audio.playPickup();
        if (p.type === 'ORB') {
          collectedOrbs++;
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

    if (mode === 'time' && distanceMeters >= 2000) { triggerGameOver(true, 'Time Trial Completed!'); return; }
    if (mode === 'zerodmg' && distanceMeters >= 1500) { triggerGameOver(true, 'Zero Damage Mastered!'); return; }
    if (mode === 'collector' && collectedOrbs >= 15) { triggerGameOver(true, 'Orb Collector Completed!'); return; }

    document.getElementById('score').textContent = Math.floor(score);
    document.getElementById('best').textContent = Math.max(Math.floor(score), Storage.getBestScore());
    document.getElementById('speedometer').textContent = Math.floor(currentSpeed);
    document.getElementById('combo-display').textContent = combo > 1 ? `COMBO x${combo}` : '';

    const modeHud = document.getElementById('mode-hud-meter');
    if (mode === 'time') modeHud.textContent = `⏱️ ${(time / 60).toFixed(1)}s / 2000m`;
    else if (mode === 'zerodmg') modeHud.textContent = `🛡️ NO HIT: ${distanceMeters}m / 1500m`;
    else if (mode === 'collector') modeHud.textContent = `💎 ORBS: ${collectedOrbs} / 15`;
    else modeHud.textContent = `ZONE: ${Storage.getSelectedZone().toUpperCase()}`;

    document.querySelectorAll('.lane-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === targetLane);
    });
  }

  function renderLoop() {
    if (currentView === 'play' && isPlaying && !isPaused) {
      updateGame();
    } else {
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
    applyZoneTheme();
    isPlaying = true;
    isPaused = false;

    score = 0; combo = 1; comboTimer = 0; time = 0; distanceMeters = 0;
    targetLane = 2; playerPosX = 0; shieldActive = false; boostAmount = 100;
    collectedOrbs = 0; zeroDamageHit = false; forkWarningTime = 0; activeBranchType = 'NORMAL';

    shieldBubbleMesh.visible = false;
    document.getElementById('shield-bar-container').classList.remove('active');
    document.getElementById('fork-banner').style.display = 'none';

    obstacles.forEach(o => scene.remove(o.mesh));
    pickups.forEach(p => scene.remove(p.mesh));
    obstacles = []; pickups = [];

    document.getElementById('pauseModal').classList.add('hidden');
    document.getElementById('gameOverModal').classList.add('hidden');
    document.getElementById('highScoreModal').classList.add('hidden');
    updatePlaybackControlsHUD();
  }

  function triggerGameOver(success = false, customMsg = '') {
    isPlaying = false;
    updatePlaybackControlsHUD();

    const finalScore = Math.floor(score);
    const prevBest = Storage.getBestScore();

    if (finalScore > prevBest) Storage.setBestScore(finalScore);

    if (success) {
      const camp = Storage.getCampaign();
      const currentZone = Storage.getSelectedZone();
      if (!camp.completed.includes(currentZone)) camp.completed.push(currentZone);
      Storage.setCampaign(camp);
    }

    document.getElementById('gameOverTitle').textContent = success ? 'VICTORY!' : 'RUN CRASHED';
    document.getElementById('finalScore').textContent = finalScore;
    document.getElementById('finalBest').textContent = Storage.getBestScore();

    const lb = Storage.getLeaderboard();
    if (lb.length < 10 || finalScore > (lb[lb.length - 1]?.score || 0)) {
      pendingHighScore = finalScore;
      const inputEl = document.getElementById('driverNameInput');
      inputEl.value = Storage.getLastDriverName();
      document.getElementById('highScoreModal').classList.remove('hidden');
      setTimeout(() => { inputEl.focus(); inputEl.select(); }, 150);
    } else {
      document.getElementById('gameOverModal').classList.remove('hidden');
    }
  }

  function setupHighScoreModalHandlers() {
    const modal = document.getElementById('highScoreModal');
    const inputEl = document.getElementById('driverNameInput');
    const btnSubmit = document.getElementById('btnSubmitHighScore');
    const btnSkip = document.getElementById('btnSkipHighScore');

    function saveHighScore() {
      if (!pendingHighScore) return;
      const name = (inputEl.value.trim() || 'Racer-X').substring(0, 15);
      Storage.setLastDriverName(name);

      const lb = Storage.getLeaderboard();
      lb.push({ name, score: pendingHighScore, car: Storage.getSelectedCar(), date: new Date().toLocaleDateString() });
      lb.sort((a, b) => b.score - a.score);
      Storage.setLeaderboard(lb.slice(0, 10));

      pendingHighScore = null;
      modal.classList.add('hidden');
      document.getElementById('gameOverModal').classList.remove('hidden');
    }

    btnSubmit.addEventListener('click', saveHighScore);
    btnSkip.addEventListener('click', () => {
      pendingHighScore = null;
      modal.classList.add('hidden');
      document.getElementById('gameOverModal').classList.remove('hidden');
    });

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveHighScore();
    });
  }

  // --- WORLD MAP RENDERER ---
  function renderWorldMap() {
    const container = document.getElementById('worldMapNodes');
    const bestScore = Storage.getBestScore();
    const activeZone = Storage.getSelectedZone();
    const camp = Storage.getCampaign();

    container.innerHTML = ZONES.map((z, idx) => {
      const isUnlocked = bestScore >= z.reqScore;
      const isCompleted = camp.completed.includes(z.id);

      const posX = 15 + idx * 25;
      const posY = 50 + (idx % 2 === 0 ? -18 : 18);

      return `
        <div class="zone-node ${isCompleted ? 'completed' : ''} ${isUnlocked ? 'unlocked' : 'locked'}"
             style="left:${posX}%; top:${posY}%;" data-id="${z.id}">
          <div class="node-icon">${z.icon}</div>
          <div class="node-title">${z.name}</div>
        </div>
      `;
    }).join('');

    const progress = Math.min(100, Math.floor((camp.completed.length / ZONES.length) * 100));
    document.getElementById('campaignProgressFill').style.width = `${progress}%`;
    document.getElementById('campaignProgressText').textContent = `${progress}% COMPLETED`;

    document.querySelectorAll('.zone-node.unlocked').forEach(node => {
      node.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        Storage.setSelectedZone(id);
        renderWorldMap();
      });
    });
  }

  // --- GARAGE & LEADERBOARD RENDERERS ---
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

  function renderLeaderboard() {
    const tableBody = document.getElementById('leaderboardBody');
    const lb = Storage.getLeaderboard();

    if (lb.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">No high scores recorded yet! <a href="#play" style="color:var(--cyan);">Drive a run to set the first score.</a></td></tr>`;
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

    const resetBtn = document.getElementById('resetDataBtn');
    const confirmModal = document.getElementById('confirmModal');
    const btnConfirm = document.getElementById('btnConfirmAction');
    const btnCancel = document.getElementById('btnCancelAction');

    resetBtn.onclick = () => {
      confirmModal.classList.remove('hidden');
    };

    btnCancel.onclick = () => {
      confirmModal.classList.add('hidden');
    };

    btnConfirm.onclick = () => {
      confirmModal.classList.add('hidden');
      Storage.clearAll();
      location.reload();
    };
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  document.getElementById('startRaceBtn').addEventListener('click', () => { window.location.hash = '#play'; startRace(); });
  document.getElementById('retryBtn').addEventListener('click', startRace);
  document.getElementById('resumeBtn').addEventListener('click', togglePause);

  initThree();
  initRouter();
  renderLoop();
})();
