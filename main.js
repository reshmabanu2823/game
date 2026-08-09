/* NEON HIGHWAY — Modular Swappable Zone Engine, SVG Icons, Custom Hazards & Audio Synth */

(() => {
  // --- MODULAR ZONE CONFIGURATIONS WITH SVG ICONS ---
  const ZONE_CONFIGS = {
    district: {
      id: 'district',
      name: 'Neon District',
      icon: `<svg class="cyber-icon" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)"><path d="M3 21h18M5 21V7l6-3v17M11 21V11l8-4v14"/></svg>`,
      difficulty: 'Normal',
      reqScore: 0,
      fogColor: 0x0c061a,
      sunColor: 0xff7700,
      hudSkinClass: 'hud-skin-district',
      desc: 'Downtown cyberpunk streets. Skyscrapers, neon light bridges, and city traffic.',
      spawnHazards: ['TRAFFIC', 'BARRIER', 'LOW_SIGN'],
      weatherType: 'NEON_DRIFT',
      ambientFreq: 110
    },
    desert: {
      id: 'desert',
      name: 'Desert Overpass',
      icon: `<svg class="cyber-icon" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)"><circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
      difficulty: 'Fast',
      reqScore: 2000,
      fogColor: 0x1e0802,
      sunColor: 0xffea00,
      hudSkinClass: 'hud-skin-desert',
      desc: 'Sun-scorched highway. Rolling tumbleweeds, high speed, and periodic sandstorms.',
      spawnHazards: ['TRAFFIC', 'TUMBLEWEED', 'HUNTER'],
      weatherType: 'SANDSTORM',
      ambientFreq: 85
    },
    rain: {
      id: 'rain',
      name: 'Rain City',
      icon: `<svg class="cyber-icon" viewBox="0 0 24 24" fill="none" stroke="#00aaff"><path d="M16 13a4 4 0 0 0-7.2-2.4A3.5 3.5 0 0 0 4 14a3 3 0 0 0 3 3h10a3 3 0 0 0 2.5-4.7A4 4 0 0 0 16 13zM8 21l-1 2M12 21l-1 2M16 21l-1 2"/></svg>`,
      difficulty: 'Hard',
      reqScore: 6000,
      fogColor: 0x150020,
      sunColor: 0xff00aa,
      hudSkinClass: 'hud-skin-rain',
      desc: 'Wet night streets. Persistent rain, hydroplane puddles, and lightning sky flashes.',
      spawnHazards: ['TRAFFIC', 'PUDDLE', 'STEALTH_HUNTER'],
      weatherType: 'RAIN',
      ambientFreq: 140
    },
    orbital: {
      id: 'orbital',
      name: 'Orbital Ring',
      icon: `<svg class="cyber-icon" viewBox="0 0 24 24" fill="none" stroke="#b700ff"><circle cx="12" cy="12" r="6"/><ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(-30 12 12)"/></svg>`,
      difficulty: 'Extreme',
      reqScore: 12000,
      fogColor: 0x001525,
      sunColor: 0x00f3ff,
      hudSkinClass: 'hud-skin-orbital',
      desc: 'Space station highway. Zero-G floating debris, flickering laser gates, and heavy hunter waves.',
      spawnHazards: ['ZERO_G_DEBRIS', 'LASER_GATE', 'HUNTER'],
      weatherType: 'COSMIC_DRIFT',
      ambientFreq: 180
    }
  };

  const ZONES = Object.values(ZONE_CONFIGS);

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

  // --- THREE.JS ENGINE GLOBALS ---
  const LANES = [-8, -4, 0, 4, 8];
  const ROAD_WIDTH = 22;
  const ROAD_LENGTH = 500;
  const SEGMENT_LENGTH = 10;

  let scene, camera, renderer;
  let roadGroup, sunMesh, sceneryGroup;
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
      ribbon.innerHTML = `<svg class="hud-svg-icon" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17M14 14.66V17M18 4H6v7a6 6 0 0 0 12 0V4z"/></svg> YOUR PERSONAL BEST HIGH SCORE: <strong>${best.toLocaleString()} PTS</strong>`;
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

    sceneryGroup = new THREE.Group();
    scene.add(sceneryGroup);
  }

  // --- DYNAMIC ZONE THEME & ENVIRONMENT SWAPPER ---
  function applyZoneTheme() {
    const activeZoneId = Storage.getSelectedZone();
    const cfg = ZONE_CONFIGS[activeZoneId] || ZONE_CONFIGS.district;

    if (scene) scene.fog.color.setHex(cfg.fogColor);
    if (sunMesh) sunMesh.material.color.setHex(cfg.sunColor);

    const uiContainer = document.getElementById('ui-container');
    if (uiContainer) {
      uiContainer.className = '';
      uiContainer.classList.add(cfg.hudSkinClass, 'zone-flicker');
      setTimeout(() => uiContainer.classList.remove('zone-flicker'), 400);
    }

    while (sceneryGroup.children.length > 0) sceneryGroup.remove(sceneryGroup.children[0]);

    if (cfg.id === 'district') {
      for (let i = -10; i <= 10; i++) {
        if (Math.abs(i) < 2) continue;
        const bGeom = new THREE.BoxGeometry(rand(14, 22), rand(40, 90), rand(14, 22));
        const bMat = new THREE.MeshLambertMaterial({ color: 0x090616, flatShading: true });
        const b = new THREE.Mesh(bGeom, bMat);
        b.position.set(i * 32, 20, -340 + rand(-20, 20));
        sceneryGroup.add(b);
      }
    } else if (cfg.id === 'desert') {
      for (let i = -10; i <= 10; i++) {
        if (Math.abs(i) < 2) continue;
        const rGeom = new THREE.DodecahedronGeometry(rand(12, 24));
        const rMat = new THREE.MeshLambertMaterial({ color: 0x1c0b04, flatShading: true });
        const r = new THREE.Mesh(rGeom, rMat);
        r.position.set(i * 35, 10, -340 + rand(-20, 20));
        sceneryGroup.add(r);
      }
    } else if (cfg.id === 'rain') {
      for (let i = -10; i <= 10; i++) {
        if (Math.abs(i) < 2) continue;
        const rGeom = new THREE.BoxGeometry(rand(12, 18), rand(35, 75), rand(12, 18));
        const rMat = new THREE.MeshLambertMaterial({ color: 0x040e24, flatShading: true });
        const r = new THREE.Mesh(rGeom, rMat);
        r.position.set(i * 30, 15, -340 + rand(-20, 20));
        sceneryGroup.add(r);
      }
    } else if (cfg.id === 'orbital') {
      const ringGeom = new THREE.TorusGeometry(120, 6, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.set(0, 40, -300);
      ring.rotation.x = Math.PI / 6;
      sceneryGroup.add(ring);
    }
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

    const activeZoneId = Storage.getSelectedZone();
    const cfg = ZONE_CONFIGS[activeZoneId] || ZONE_CONFIGS.district;
    const mode = Storage.getSelectedMode();

    const isHunter = (mode === 'gauntlet' || cfg.id === 'orbital' || time > 1800) && Math.random() < 0.45;
    const isDestructible = !isHunter && Math.random() < 0.25;

    let mesh;
    if (cfg.id === 'desert' && Math.random() < 0.3) {
      const tGeom = new THREE.DodecahedronGeometry(1.2);
      const tMat = new THREE.MeshBasicMaterial({ color: 0xffea00, wireframe: true });
      mesh = new THREE.Mesh(tGeom, tMat);
    } else if (cfg.id === 'rain' && Math.random() < 0.25) {
      const pGeom = new THREE.CircleGeometry(2.2, 16);
      const pMat = new THREE.MeshBasicMaterial({ color: 0x00aaff, side: THREE.DoubleSide });
      mesh = new THREE.Mesh(pGeom, pMat);
      mesh.rotation.x = -Math.PI / 2;
    } else if (cfg.id === 'orbital' && Math.random() < 0.3) {
      const dGeom = new THREE.IcosahedronGeometry(1.4);
      const dMat = new THREE.MeshBasicMaterial({ color: 0xb700ff, wireframe: true });
      mesh = new THREE.Mesh(dGeom, dMat);
      mesh.position.y = 1.8;
    } else if (isHunter) {
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

    if (!mesh.position.y) mesh.position.y = 0.6;
    mesh.position.x = x;
    mesh.position.z = z;
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
    const activeZoneId = Storage.getSelectedZone();

    if (activeZoneId === 'rain' && Math.random() < 0.005) {
      scene.background.setHex(0x354060);
      setTimeout(() => scene.background.setHex(0x04040a), 60);
    }

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
    if (mode === 'time') modeHud.innerHTML = `<svg class="hud-svg-icon" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${(time / 60).toFixed(1)}s / 2000m`;
    else if (mode === 'zerodmg') modeHud.innerHTML = `<svg class="hud-svg-icon" viewBox="0 0 24 24" fill="none" stroke="var(--green)"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> NO HIT: ${distanceMeters}m / 1500m`;
    else if (mode === 'collector') modeHud.innerHTML = `<svg class="hud-svg-icon" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)"><polygon points="12 2 22 8.5 12 22 2 8.5 12 2"/></svg> ORBS: ${collectedOrbs} / 15`;
    else modeHud.innerHTML = `<svg class="hud-svg-icon" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)"><rect x="3" y="3" width="18" height="18" rx="2"/></svg> ZONE: ${Storage.getSelectedZone().toUpperCase()}`;

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

  document.getElementById('startRaceBtn')?.addEventListener('click', () => { window.location.hash = '#play'; startRace(); });
  document.getElementById('retryBtn')?.addEventListener('click', startRace);
  document.getElementById('resumeBtn')?.addEventListener('click', togglePause);

  initThree();
  initRouter();
  renderLoop();
})();
