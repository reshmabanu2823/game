/* NEON HIGHWAY — Grounded Realistic 3D Racing Engine, Mid-Run Weather Transitions & Slow-Motion Crash Replay */

(() => {
  // --- REALISTIC ZONE CONFIGURATIONS ---
  const ZONE_CONFIGS = {
    district: {
      id: 'district',
      name: 'City Streets',
      icon: `<svg class="cyber-icon" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)"><path d="M3 21h18M5 21V7l6-3v17M11 21V11l8-4v14"/></svg>`,
      difficulty: 'Normal',
      reqScore: 0,
      fogColor: 0x121824,
      nightFogColor: 0x060912,
      sunColor: 0xffaa44,
      hudSkinClass: 'hud-skin-district',
      desc: 'Urban avenue lined with building facades, streetlamps, and city traffic.',
      spawnHazards: ['TRAFFIC', 'BARRIER', 'LOW_SIGN'],
      weatherType: 'CITY_LIGHTS',
      ambientFreq: 110
    },
    desert: {
      id: 'desert',
      name: 'Desert Highway',
      icon: `<svg class="cyber-icon" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)"><circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
      difficulty: 'Fast',
      reqScore: 2000,
      fogColor: 0x3d2817,
      nightFogColor: 0x120a04,
      sunColor: 0xffcc44,
      hudSkinClass: 'hud-skin-desert',
      desc: 'Sun-lit freeway through rock formations, desert terrain, and roadside signs.',
      spawnHazards: ['TRAFFIC', 'TUMBLEWEED', 'HUNTER'],
      weatherType: 'HEAT_HAZE',
      ambientFreq: 85
    },
    rain: {
      id: 'rain',
      name: 'Rain Expressway',
      icon: `<svg class="cyber-icon" viewBox="0 0 24 24" fill="none" stroke="#00aaff"><path d="M16 13a4 4 0 0 0-7.2-2.4A3.5 3.5 0 0 0 4 14a3 3 0 0 0 3 3h10a3 3 0 0 0 2.5-4.7A4 4 0 0 0 16 13zM8 21l-1 2M12 21l-1 2M16 21l-1 2"/></svg>`,
      difficulty: 'Hard',
      reqScore: 6000,
      fogColor: 0x0f172a,
      nightFogColor: 0x030712,
      sunColor: 0x88aacc,
      hudSkinClass: 'hud-skin-rain',
      desc: 'Overcast twilight highway with wet asphalt sheen, puddles, and lightning flashes.',
      spawnHazards: ['TRAFFIC', 'PUDDLE', 'STEALTH_HUNTER'],
      weatherType: 'RAIN',
      ambientFreq: 140
    },
    orbital: {
      id: 'orbital',
      name: 'Coastal Mountain Pass',
      icon: `<svg class="cyber-icon" viewBox="0 0 24 24" fill="none" stroke="#b700ff"><polygon points="12 2 2 22 22 22 12 2"/></svg>`,
      difficulty: 'Extreme',
      reqScore: 12000,
      fogColor: 0x181028,
      nightFogColor: 0x080410,
      sunColor: 0xff66aa,
      hudSkinClass: 'hud-skin-orbital',
      desc: 'Winding cliffside highway with mountain peaks, dusk lighting, and heavy traffic.',
      spawnHazards: ['CARGO_BOX', 'TRAFFIC_CONE', 'HUNTER'],
      weatherType: 'DUSK_FOG',
      ambientFreq: 180
    }
  };

  const ZONES = Object.values(ZONE_CONFIGS);

  // --- CAR SKINS DEFINITION ---
  const CAR_SKINS = [
    { id: 'cyber', name: 'GT Sport Silver', reqScore: 0, bodyColor: 0x222836, specularColor: 0x00e5ff, desc: 'High-performance metallic silver sports coupe.' },
    { id: 'phantom', name: 'Crimson Velocity', reqScore: 2500, bodyColor: 0x88051a, specularColor: 0xff0044, desc: 'Unlocked at 2,500 pts. Deep red metallic gloss.' },
    { id: 'solar', name: 'Golden Apex', reqScore: 5000, bodyColor: 0x997700, specularColor: 0xffc800, desc: 'Unlocked at 5,000 pts. Sun-bright amber finish.' },
    { id: 'vaporwave', name: 'Midnight Violet', reqScore: 10000, bodyColor: 0x330066, specularColor: 0x9900ff, desc: 'Unlocked at 10,000 pts. Ultra-violet pearl coat.' },
    { id: 'titan', name: 'Emerald Stealth', reqScore: 20000, bodyColor: 0x05331a, specularColor: 0x00e676, desc: 'Unlocked at 20,000 pts. Emerald carbon weave.' }
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
    getGhost: (zone, mode) => JSON.parse(localStorage.getItem(`neondrift_ghost_${zone}_${mode}`) || 'null'),
    setGhost: (zone, mode, data) => localStorage.setItem(`neondrift_ghost_${zone}_${mode}`, JSON.stringify(data)),
    getRivalSetting: () => localStorage.getItem('neondrift_setting_rival') === 'true',
    setRivalSetting: (v) => localStorage.setItem('neondrift_setting_rival', v),
    getWeatherSetting: () => localStorage.getItem('neondrift_setting_weather') !== 'false',
    setWeatherSetting: (v) => localStorage.setItem('neondrift_setting_weather', v),
    getCrashReplaySetting: () => localStorage.getItem('neondrift_setting_crashreplay') !== 'false',
    setCrashReplaySetting: (v) => localStorage.setItem('neondrift_setting_crashreplay', v),
    clearAll: () => {
      localStorage.removeItem('neondrift_3d_best');
      localStorage.removeItem('neondrift_3d_lastname');
      localStorage.removeItem('neondrift_3d_car');
      localStorage.removeItem('neondrift_3d_zone');
      localStorage.removeItem('neondrift_3d_mode');
      localStorage.removeItem('neondrift_3d_campaign');
      localStorage.removeItem('neondrift_3d_leaderboard');
      localStorage.removeItem('neondrift_3d_settings');
      localStorage.removeItem('neondrift_setting_rival');
      localStorage.removeItem('neondrift_setting_weather');
      localStorage.removeItem('neondrift_setting_crashreplay');
    }
  };

  let previewCarId = Storage.getSelectedCar();

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
      const targetFreq = 55 + speedRatio * 190;
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

  let scene, camera, renderer, dirLight;
  let roadGroup, sunMesh, sceneryGroup;
  let playerCar, playerBodyMesh, playerGlassMesh, playerTaillightMat, shieldBubbleMesh;
  let ghostCarMesh = null;
  let rivalCarMesh = null;
  let frontLeftWheel, frontRightWheel, rearLeftWheel, rearRightWheel;
  let headlightLeftLight, headlightRightLight;

  let obstacles = [];
  let pickups = [];
  let roadSegments = [];

  // --- TELEMETRY, RIVAL & REPLAY ROLLING BUFFER GLOBALS ---
  let currentRunTelemetry = [];
  let crashBuffer = [];
  let activeGhostData = null;
  let isRivalMode = false;
  let rivalDistMeters = 0;
  let rivalLane = 2;
  let hasOvertakenGhost = false;

  // Replay State
  let isReplaying = false;
  let replayFrameIndex = 0;

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
      if (!isPlaying && !isReplaying) startRace();
    } else {
      uiContainer.style.display = 'none';
      isPlaying = false;
      isPaused = false;
      isReplaying = false;
      document.getElementById('replayModal').classList.add('hidden');
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
    scene.background = new THREE.Color(0x0c101d);
    scene.fog = new THREE.FogExp2(0x121824, 0.005);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 800);
    camera.position.set(0, 3.8, 11);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xddeeff, 0.7);
    scene.add(ambientLight);

    dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    dirLight.position.set(40, 80, 40);
    scene.add(dirLight);

    buildEnvironment();
    buildRoad();
    buildPlayerCar();
    buildGhostCar();
    buildRivalCar();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    document.getElementById('btn-top-play').addEventListener('click', () => { window.location.hash = '#play'; startRace(); });
    document.getElementById('btn-top-pause').addEventListener('click', togglePause);
    document.getElementById('btn-top-resume').addEventListener('click', togglePause);

    document.getElementById('btn-hud-play').addEventListener('click', startRace);
    document.getElementById('btn-hud-pause').addEventListener('click', togglePause);
    document.getElementById('btn-hud-resume').addEventListener('click', togglePause);

    // Replay Modal Controls
    document.getElementById('watchReplayBtn').addEventListener('click', startCrashReplay);
    document.getElementById('btnReplayAgain').addEventListener('click', startCrashReplay);
    document.getElementById('btnCloseReplay').addEventListener('click', closeCrashReplay);

    setupHighScoreModalHandlers();
  }

  function buildEnvironment() {
    const sunGeom = new THREE.CircleGeometry(40, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa44, side: THREE.DoubleSide });
    sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sunMesh.position.set(0, 25, -350);
    scene.add(sunMesh);

    sceneryGroup = new THREE.Group();
    scene.add(sceneryGroup);
  }

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
        const bGeom = new THREE.BoxGeometry(rand(16, 26), rand(35, 80), rand(16, 26));
        const bMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.7, metalness: 0.3 });
        const b = new THREE.Mesh(bGeom, bMat);
        b.position.set(i * 32, 20, -340 + rand(-20, 20));
        sceneryGroup.add(b);

        const postGeom = new THREE.CylinderGeometry(0.2, 0.2, 8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
        const post = new THREE.Mesh(postGeom, postMat);
        post.position.set(i > 0 ? 12 : -12, 4, -i * 30);
        sceneryGroup.add(post);
      }
    } else if (cfg.id === 'desert') {
      for (let i = -10; i <= 10; i++) {
        if (Math.abs(i) < 2) continue;
        const rGeom = new THREE.DodecahedronGeometry(rand(14, 28));
        const rMat = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.9, metalness: 0.1 });
        const r = new THREE.Mesh(rGeom, rMat);
        r.position.set(i * 35, 10, -340 + rand(-20, 20));
        sceneryGroup.add(r);
      }
    } else if (cfg.id === 'rain') {
      for (let i = -10; i <= 10; i++) {
        if (Math.abs(i) < 2) continue;
        const rGeom = new THREE.BoxGeometry(rand(14, 22), rand(30, 70), rand(14, 22));
        const rMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
        const r = new THREE.Mesh(rGeom, rMat);
        r.position.set(i * 30, 15, -340 + rand(-20, 20));
        sceneryGroup.add(r);
      }
    } else if (cfg.id === 'orbital') {
      for (let i = -10; i <= 10; i++) {
        if (Math.abs(i) < 2) continue;
        const mGeom = new THREE.ConeGeometry(rand(20, 35), rand(40, 75), 5);
        const mMat = new THREE.MeshStandardMaterial({ color: 0x1e1b2e, roughness: 0.8 });
        const m = new THREE.Mesh(mGeom, mMat);
        m.position.set(i * 35, 15, -340 + rand(-20, 20));
        sceneryGroup.add(m);
      }
    }
  }

  function buildRoad() {
    roadGroup = new THREE.Group();
    const numSegments = ROAD_LENGTH / SEGMENT_LENGTH;

    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      roughness: 0.7,
      metalness: 0.2
    });

    const lineMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
    const shoulderMat = new THREE.MeshBasicMaterial({ color: 0xfcb316 });
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.3 });

    for (let i = 0; i < numSegments; i++) {
      const z = -i * SEGMENT_LENGTH;
      const segGeom = new THREE.PlaneGeometry(ROAD_WIDTH, SEGMENT_LENGTH);
      const seg = new THREE.Mesh(segGeom, roadMat);
      seg.rotation.x = -Math.PI / 2;
      seg.position.set(0, 0, z);

      [-ROAD_WIDTH/2 + 0.4, ROAD_WIDTH/2 - 0.4].forEach(xPos => {
        const sLineGeom = new THREE.PlaneGeometry(0.3, SEGMENT_LENGTH);
        const sLine = new THREE.Mesh(sLineGeom, shoulderMat);
        sLine.rotation.x = -Math.PI / 2;
        sLine.position.set(xPos, 0.02, 0);
        seg.add(sLine);
      });

      [-ROAD_WIDTH/2 - 0.2, ROAD_WIDTH/2 + 0.2].forEach(xPos => {
        const railGeom = new THREE.BoxGeometry(0.3, 0.8, SEGMENT_LENGTH);
        const rail = new THREE.Mesh(railGeom, railMat);
        rail.position.set(xPos, 0.4, 0);
        seg.add(rail);
      });

      LANES.forEach((xPos, idx) => {
        if (idx === 0 || idx === LANES.length - 1) return;
        const lineGeom = new THREE.PlaneGeometry(0.25, SEGMENT_LENGTH * 0.45);
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

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x222836,
      roughness: 0.25,
      metalness: 0.85
    });

    const bodyGeom = new THREE.BoxGeometry(2.3, 0.65, 4.4);
    playerBodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    playerBodyMesh.position.y = 0.55;
    playerCar.add(playerBodyMesh);

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });
    playerGlassMesh = glassMat;

    const cabinGeom = new THREE.BoxGeometry(1.8, 0.55, 2.2);
    const cabinMesh = new THREE.Mesh(cabinGeom, glassMat);
    cabinMesh.position.set(0, 1.1, -0.3);
    playerCar.add(cabinMesh);

    const grilleGeom = new THREE.BoxGeometry(2.0, 0.25, 0.1);
    const grilleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const grille = new THREE.Mesh(grilleGeom, grilleMat);
    grille.position.set(0, 0.5, -2.25);
    playerCar.add(grille);

    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-0.85, 0.85].forEach(xPos => {
      const hlGeom = new THREE.BoxGeometry(0.35, 0.15, 0.1);
      const hl = new THREE.Mesh(hlGeom, headlightMat);
      hl.position.set(xPos, 0.55, -2.23);
      playerCar.add(hl);
    });

    headlightLeftLight = new THREE.SpotLight(0xffffff, 2, 40, Math.PI / 6, 0.5);
    headlightLeftLight.position.set(-0.85, 0.55, -2.2);
    headlightLeftLight.target.position.set(-0.85, 0, -20);
    playerCar.add(headlightLeftLight);
    playerCar.add(headlightLeftLight.target);

    headlightRightLight = new THREE.SpotLight(0xffffff, 2, 40, Math.PI / 6, 0.5);
    headlightRightLight.position.set(0.85, 0.55, -2.2);
    headlightRightLight.target.position.set(0.85, 0, -20);
    playerCar.add(headlightRightLight);
    playerCar.add(headlightRightLight.target);

    playerTaillightMat = new THREE.MeshBasicMaterial({ color: 0xcc0000 });
    const tailGeom = new THREE.BoxGeometry(2.0, 0.15, 0.1);
    const taillights = new THREE.Mesh(tailGeom, playerTaillightMat);
    taillights.position.set(0, 0.65, 2.23);
    playerCar.add(taillights);

    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });

    function createWheel() {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.35, 18), tireMat);
      tire.rotation.z = Math.PI / 2;
      wGroup.add(tire);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.37, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      wGroup.add(rim);
      return wGroup;
    }

    frontLeftWheel = createWheel(); frontLeftWheel.position.set(-1.15, 0.42, -1.4); playerCar.add(frontLeftWheel);
    frontRightWheel = createWheel(); frontRightWheel.position.set(1.15, 0.42, -1.4); playerCar.add(frontRightWheel);
    rearLeftWheel = createWheel(); rearLeftWheel.position.set(-1.15, 0.42, 1.4); playerCar.add(rearLeftWheel);
    rearRightWheel = createWheel(); rearRightWheel.position.set(1.15, 0.42, 1.4); playerCar.add(rearRightWheel);

    const shieldGeom = new THREE.SphereGeometry(2.8, 16, 16);
    const shieldMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.5 });
    shieldBubbleMesh = new THREE.Mesh(shieldGeom, shieldMat);
    shieldBubbleMesh.visible = false;
    playerCar.add(shieldBubbleMesh);

    playerCar.position.set(0, 0, 0);
    scene.add(playerCar);
    applySelectedCarSkin();
  }

  function buildGhostCar() {
    ghostCarMesh = new THREE.Group();
    const gMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.42
    });

    const bGeom = new THREE.BoxGeometry(2.3, 0.65, 4.4);
    const bMesh = new THREE.Mesh(bGeom, gMat);
    bMesh.position.y = 0.55;
    ghostCarMesh.add(bMesh);

    const cGeom = new THREE.BoxGeometry(1.8, 0.55, 2.2);
    const cMesh = new THREE.Mesh(cGeom, gMat);
    cMesh.position.set(0, 1.1, -0.3);
    ghostCarMesh.add(cMesh);

    ghostCarMesh.visible = false;
    scene.add(ghostCarMesh);
  }

  function buildRivalCar() {
    rivalCarMesh = new THREE.Group();
    const rMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.3,
      metalness: 0.8
    });

    const bGeom = new THREE.BoxGeometry(2.3, 0.65, 4.4);
    const bMesh = new THREE.Mesh(bGeom, rMat);
    bMesh.position.y = 0.55;
    rivalCarMesh.add(bMesh);

    const cGeom = new THREE.BoxGeometry(1.8, 0.55, 2.2);
    const cMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const cMesh = new THREE.Mesh(cGeom, cMat);
    cMesh.position.set(0, 1.1, -0.3);
    rivalCarMesh.add(cMesh);

    rivalCarMesh.visible = false;
    scene.add(rivalCarMesh);
  }

  function applySelectedCarSkin(targetId = null) {
    const activeId = targetId || previewCarId || Storage.getSelectedCar();
    const skin = CAR_SKINS.find(s => s.id === activeId) || CAR_SKINS[0];
    if (playerBodyMesh) playerBodyMesh.material.color.setHex(skin.bodyColor);
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
      const tMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
      mesh = new THREE.Mesh(tGeom, tMat);
    } else if (cfg.id === 'rain' && Math.random() < 0.25) {
      const pGeom = new THREE.CircleGeometry(2.2, 16);
      const pMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, metalness: 0.9, side: THREE.DoubleSide });
      mesh = new THREE.Mesh(pGeom, pMat);
      mesh.rotation.x = -Math.PI / 2;
    } else if (isHunter) {
      const hGeom = new THREE.BoxGeometry(2.2, 0.8, 4.2);
      const hMat = new THREE.MeshStandardMaterial({ color: 0x990000, roughness: 0.3, metalness: 0.8 });
      mesh = new THREE.Mesh(hGeom, hMat);
    } else if (isDestructible) {
      const dGeom = new THREE.BoxGeometry(2.2, 1.4, 1.4);
      const dMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.8 });
      mesh = new THREE.Mesh(dGeom, dMat);
    } else {
      const rGeom = new THREE.BoxGeometry(2.2, 0.8, 4.2);
      const rMat = new THREE.MeshStandardMaterial({ color: rand(0, 1) > 0.5 ? 0x334155 : 0x475569, roughness: 0.3, metalness: 0.7 });
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
    let type = 'ORB', color = 0x00e5ff, geom;
    if (roll < 0.7) { type = 'ORB'; color = 0x00e5ff; geom = new THREE.OctahedronGeometry(0.7); }
    else if (roll < 0.85) { type = 'SHIELD'; color = 0xff007f; geom = new THREE.TorusGeometry(0.6, 0.2, 8, 16); }
    else { type = 'BOMB'; color = 0xffc800; geom = new THREE.IcosahedronGeometry(0.7); }

    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.2, metalness: 0.8 });
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
    const activeZoneCfg = ZONE_CONFIGS[activeZoneId] || ZONE_CONFIGS.district;

    // --- DYNAMIC MID-RUN WEATHER & TIME-OF-DAY PROGRESSION ---
    if (Storage.getWeatherSetting()) {
      const dayProgress = Math.min(1.0, time / 2400); // 40-second smooth transition from dusk to night

      // Sun sets below horizon
      sunMesh.position.y = 25 - dayProgress * 32;

      // Fog transitions to deep night dark tone
      const startColor = new THREE.Color(activeZoneCfg.fogColor);
      const nightColor = new THREE.Color(activeZoneCfg.nightFogColor);
      scene.fog.color.lerpColors(startColor, nightColor, dayProgress);

      // Ambient light dims while headlights intensify naturally
      if (dirLight) dirLight.intensity = Math.max(0.25, 1.2 - dayProgress * 0.9);
      if (headlightLeftLight) headlightLeftLight.intensity = 2.0 + dayProgress * 3.5;
      if (headlightRightLight) headlightRightLight.intensity = 2.0 + dayProgress * 3.5;
    }

    // Telemetry Sample Recording & Rolling Crash Replay Buffer (every 100ms)
    if (time % 6 === 0) {
      const frameData = {
        time,
        posX: playerCar.position.x,
        distanceMeters,
        score: Math.floor(score),
        speed: currentSpeed,
        rotZ: playerCar.rotation.z
      };
      currentRunTelemetry.push(frameData);

      crashBuffer.push(frameData);
      if (crashBuffer.length > 60) crashBuffer.shift(); // 6-second rolling window
    }

    // --- GHOST REPLAY & LIVE DELTA HUD LOGIC ---
    if (activeGhostData && activeGhostData.samples && activeGhostData.samples.length > 0) {
      const sampleIdx = Math.min(Math.floor(time / 6), activeGhostData.samples.length - 1);
      const ghostFrame = activeGhostData.samples[sampleIdx];

      if (ghostFrame && ghostCarMesh) {
        ghostCarMesh.visible = true;
        const relativeZ = -(ghostFrame.distanceMeters - distanceMeters) * 0.5;
        ghostCarMesh.position.set(ghostFrame.posX, 0.4, Math.max(-120, Math.min(40, relativeZ)));

        const deltaDist = distanceMeters - ghostFrame.distanceMeters;
        const ghostHudPanel = document.getElementById('ghost-hud-panel');
        const ghostDeltaReadout = document.getElementById('ghostDeltaReadout');
        const ghostProgressFill = document.getElementById('ghostProgressFill');
        const ghostHudLabel = document.getElementById('ghostHudLabel');

        ghostHudPanel.style.display = 'flex';
        ghostHudLabel.textContent = 'VS GHOST';

        const secondsDelta = (deltaDist * 0.04).toFixed(1);
        if (deltaDist >= 0) {
          ghostDeltaReadout.textContent = `+${secondsDelta}s ahead`;
          ghostDeltaReadout.className = 'ghost-delta-readout ghost-delta-ahead';
          ghostProgressFill.style.backgroundColor = 'var(--green)';
          ghostProgressFill.style.width = `${Math.min(100, 50 + deltaDist * 0.5)}%`;

          if (!hasOvertakenGhost && deltaDist > 10) {
            hasOvertakenGhost = true;
            const banner = document.getElementById('overtake-banner');
            banner.style.display = 'block';
            setTimeout(() => { banner.style.display = 'none'; }, 1800);
          }
        } else {
          ghostDeltaReadout.textContent = `${secondsDelta}s behind`;
          ghostDeltaReadout.className = 'ghost-delta-readout ghost-delta-behind';
          ghostProgressFill.style.backgroundColor = '#ff4757';
          ghostProgressFill.style.width = `${Math.max(0, 50 + deltaDist * 0.5)}%`;
        }
      }
    } else if (isRivalMode && rivalCarMesh) {
      rivalCarMesh.visible = true;
      const targetRivalDist = distanceMeters + Math.sin(time * 0.05) * 15;
      rivalDistMeters += (targetRivalDist - rivalDistMeters) * 0.05;

      const relativeZ = -(rivalDistMeters - distanceMeters) * 0.5;
      rivalCarMesh.position.set(LANES[rivalLane], 0.4, Math.max(-120, Math.min(40, relativeZ)));

      const deltaDist = distanceMeters - rivalDistMeters;
      const ghostHudPanel = document.getElementById('ghost-hud-panel');
      const ghostDeltaReadout = document.getElementById('ghostDeltaReadout');
      const ghostProgressFill = document.getElementById('ghostProgressFill');
      const ghostHudLabel = document.getElementById('ghostHudLabel');

      ghostHudPanel.style.display = 'flex';
      ghostHudLabel.textContent = 'VS RIVAL';

      const secondsDelta = (deltaDist * 0.04).toFixed(1);
      if (deltaDist >= 0) {
        ghostDeltaReadout.textContent = `+${secondsDelta}s ahead`;
        ghostDeltaReadout.className = 'ghost-delta-readout ghost-delta-ahead';
        ghostProgressFill.style.backgroundColor = 'var(--green)';
        ghostProgressFill.style.width = `${Math.min(100, 50 + deltaDist * 0.5)}%`;
      } else {
        ghostDeltaReadout.textContent = `${secondsDelta}s behind`;
        ghostDeltaReadout.className = 'ghost-delta-readout ghost-delta-behind';
        ghostProgressFill.style.backgroundColor = '#ff4757';
        ghostProgressFill.style.width = `${Math.max(0, 50 + deltaDist * 0.5)}%`;
      }
    } else {
      document.getElementById('ghost-hud-panel').style.display = 'none';
    }

    if (activeZoneId === 'rain' && Math.random() < 0.008) {
      scene.background.setHex(0x334155);
      setTimeout(() => scene.background.setHex(0x0c101d), 60);
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
    const steerDelta = targetX - playerPosX;

    playerPosX += steerDelta * 0.2;
    playerCar.position.x = playerPosX;

    playerCar.rotation.z = -steerDelta * 0.18;
    playerCar.rotation.y = -steerDelta * 0.08;

    const wheelTurnAngle = steerDelta * 0.4;
    if (frontLeftWheel) frontLeftWheel.rotation.y = wheelTurnAngle;
    if (frontRightWheel) frontRightWheel.rotation.y = wheelTurnAngle;

    const wheelSpin = (currentSpeed * 0.08);
    if (frontLeftWheel) frontLeftWheel.children[0].rotation.x += wheelSpin;
    if (frontRightWheel) frontRightWheel.children[0].rotation.x += wheelSpin;
    if (rearLeftWheel) rearLeftWheel.children[0].rotation.x += wheelSpin;
    if (rearRightWheel) rearRightWheel.children[0].rotation.x += wheelSpin;

    if (playerTaillightMat) {
      if (steerDelta !== 0 || !isBoosting) {
        playerTaillightMat.color.setHex(0xff0000);
      } else {
        playerTaillightMat.color.setHex(0x660000);
      }
    }

    const targetFov = isBoosting ? 75 : 60;
    camera.fov += (targetFov - camera.fov) * 0.1;
    camera.updateProjectionMatrix();

    if (cameraShake > 0 && cfg.shake) {
      camera.position.x = rand(-cameraShake, cameraShake);
      camera.position.y = 3.8 + rand(-cameraShake, cameraShake);
      cameraShake *= 0.85;
    } else { camera.position.x = 0; camera.position.y = 3.8; }

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

  // --- CINEMATIC SLOW-MOTION CRASH REPLAY PLAYBACK LOOP ---
  function updateCrashReplay() {
    if (!isReplaying || crashBuffer.length === 0) return;

    // Slow down playback to 0.35x speed (freeze-frame 0.1x at crash moment)
    const isImpactFrame = replayFrameIndex >= crashBuffer.length - 4;
    const playbackSpeed = isImpactFrame ? 0.08 : 0.35;

    replayFrameIndex += playbackSpeed;

    if (replayFrameIndex >= crashBuffer.length) {
      replayFrameIndex = crashBuffer.length - 1; // Hold on final crash frame
    }

    const frameIdx = Math.floor(replayFrameIndex);
    const frame = crashBuffer[frameIdx];

    if (frame && playerCar) {
      playerCar.position.x = frame.posX;
      playerCar.rotation.z = frame.rotZ || 0;

      // Cinematic Orbiting Camera Angle
      const camAngle = (replayFrameIndex * 0.08);
      camera.position.set(frame.posX + Math.sin(camAngle) * 8.5, 3.2 + Math.cos(camAngle) * 1.5, 9);
      camera.lookAt(frame.posX, 0.6, 0);
    }
  }

  function renderLoop() {
    if (currentView === 'play' && isPlaying && !isPaused) {
      updateGame();
    } else if (isReplaying) {
      updateCrashReplay();
    } else {
      time += 0.5;
      if (playerCar) playerCar.rotation.y += 0.015;
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
    isReplaying = false;

    score = 0; combo = 1; comboTimer = 0; time = 0; distanceMeters = 0;
    targetLane = 2; playerPosX = 0; shieldActive = false; boostAmount = 100;
    collectedOrbs = 0; zeroDamageHit = false; forkWarningTime = 0; activeBranchType = 'NORMAL';

    currentRunTelemetry = [];
    crashBuffer = [];
    hasOvertakenGhost = false;
    const currentZone = Storage.getSelectedZone();
    const currentMode = Storage.getSelectedMode();
    activeGhostData = Storage.getGhost(currentZone, currentMode);
    isRivalMode = Storage.getRivalSetting();
    rivalDistMeters = 0;

    shieldBubbleMesh.visible = false;
    if (ghostCarMesh) ghostCarMesh.visible = false;
    if (rivalCarMesh) rivalCarMesh.visible = false;

    document.getElementById('shield-bar-container').classList.remove('active');
    document.getElementById('fork-banner').style.display = 'none';
    document.getElementById('overtake-banner').style.display = 'none';
    document.getElementById('ghost-hud-panel').style.display = 'none';
    document.getElementById('replayModal').classList.add('hidden');

    camera.position.set(0, 3.8, 11);
    camera.lookAt(0, 0, 0);

    obstacles.forEach(o => scene.remove(o.mesh));
    pickups.forEach(p => scene.remove(p.mesh));
    obstacles = []; pickups = [];

    document.getElementById('pauseModal').classList.add('hidden');
    document.getElementById('gameOverModal').classList.add('hidden');
    document.getElementById('highScoreModal').classList.add('hidden');
    updatePlaybackControlsHUD();
  }

  function startCrashReplay() {
    if (crashBuffer.length < 5) return;
    isReplaying = true;
    isPlaying = false;
    replayFrameIndex = 0;

    document.getElementById('gameOverModal').classList.add('hidden');
    document.getElementById('highScoreModal').classList.add('hidden');
    document.getElementById('replayModal').classList.remove('hidden');
  }

  function closeCrashReplay() {
    isReplaying = false;
    document.getElementById('replayModal').classList.add('hidden');
    document.getElementById('gameOverModal').classList.remove('hidden');
    camera.position.set(0, 3.8, 11);
    camera.lookAt(0, 0, 0);
  }

  function triggerGameOver(success = false, customMsg = '') {
    isPlaying = false;
    updatePlaybackControlsHUD();

    const finalScore = Math.floor(score);
    const prevBest = Storage.getBestScore();

    if (finalScore > prevBest) Storage.setBestScore(finalScore);

    const currentZone = Storage.getSelectedZone();
    const currentMode = Storage.getSelectedMode();

    let isNewGhostBest = false;
    if (!activeGhostData || finalScore > (activeGhostData.score || 0)) {
      isNewGhostBest = true;
      Storage.setGhost(currentZone, currentMode, {
        score: finalScore,
        samples: currentRunTelemetry
      });
    }

    if (success) {
      const camp = Storage.getCampaign();
      if (!camp.completed.includes(currentZone)) camp.completed.push(currentZone);
      Storage.setCampaign(camp);
    }

    document.getElementById('gameOverTitle').textContent = success ? 'VICTORY!' : 'RUN CRASHED';
    document.getElementById('finalScore').textContent = finalScore;
    document.getElementById('finalBest').textContent = Storage.getBestScore();

    // Show/Hide Watch Replay CTA button based on settings & buffer availability
    const watchReplayBtn = document.getElementById('watchReplayBtn');
    if (Storage.getCrashReplaySetting() && crashBuffer.length >= 10) {
      watchReplayBtn.style.display = 'inline-flex';
    } else { watchReplayBtn.style.display = 'none'; }

    const compCard = document.getElementById('ghostComparisonCard');
    if (activeGhostData || isNewGhostBest) {
      const ghostBestScore = activeGhostData ? activeGhostData.score : finalScore;
      const delta = finalScore - ghostBestScore;

      compCard.style.display = 'block';
      compCard.innerHTML = `
        <div class="comp-row">
          <span style="color:var(--text-muted); font-family:'Orbitron';">YOUR SCORE</span>
          <span style="font-family:'Orbitron'; font-weight:bold; color:#fff;">${finalScore.toLocaleString()}</span>
        </div>
        <div class="comp-row">
          <span style="color:var(--text-muted); font-family:'Orbitron';">GHOST BEST</span>
          <span style="font-family:'Orbitron'; font-weight:bold; color:var(--cyan);">${ghostBestScore.toLocaleString()}</span>
        </div>
        <div class="comp-row" style="margin-top:4px;">
          <span style="color:var(--text-muted); font-family:'Orbitron';">RESULT</span>
          <span style="font-family:'Orbitron'; font-weight:bold; color:${delta >= 0 ? 'var(--green)' : '#ff4757'};">
            ${delta >= 0 ? `+${delta.toLocaleString()} — NEW BEST!` : `${delta.toLocaleString()}`}
          </span>
        </div>
      `;
    } else { compCard.style.display = 'none'; }

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

  // --- GARAGE & SIDE SHOWCASE PREVIEW STAGE ---
  function renderGarage() {
    const grid = document.getElementById('garageGrid');
    const showcase = document.getElementById('garageShowcasePanel');
    const bestScore = Storage.getBestScore();
    const activeCar = Storage.getSelectedCar();

    if (!CAR_SKINS.find(s => s.id === previewCarId)) previewCarId = activeCar;
    const previewCar = CAR_SKINS.find(s => s.id === previewCarId) || CAR_SKINS[0];

    const isPreviewUnlocked = bestScore >= previewCar.reqScore;
    const isPreviewEquipped = activeCar === previewCar.id;

    showcase.innerHTML = `
      <div class="turntable-stage">
        <div style="font-family:'Orbitron'; font-size:11px; color:var(--text-muted); position:absolute; top:12px; left:14px; letter-spacing:2px;">3D SIDE PREVIEW</div>
        <div style="width:80px; height:32px; background:#${previewCar.bodyColor.toString(16).padStart(6,'0')}; border:2px solid #${previewCar.specularColor.toString(16).padStart(6,'0')}; border-radius:6px; box-shadow:0 0 25px #${previewCar.specularColor.toString(16).padStart(6,'0')}; margin-top:20px;"></div>
        <div class="turntable-pedestal"></div>
      </div>

      <h3 style="font-family:'Orbitron'; font-size:22px; color:#fff; margin-bottom:4px;">${previewCar.name}</h3>
      <div style="font-size:12px; color:var(--yellow); font-family:'Orbitron'; margin-bottom:16px; letter-spacing:1px;">
        ${isPreviewEquipped ? 'STATUS: EQUIPPED' : isPreviewUnlocked ? 'STATUS: UNLOCKED' : `REQUIRES: ${previewCar.reqScore.toLocaleString()} PTS`}
      </div>

      <div style="width:100%; text-align:left; margin-bottom:20px; background:rgba(255,255,255,0.03); padding:14px; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
        <div class="stat-row">
          <span style="color:var(--text-muted); font-family:'Orbitron'; font-size:11px;">TOP SPEED</span>
          <span style="color:#fff; font-family:'Orbitron'; font-weight:bold;">160 KM/H</span>
        </div>
        <div class="stat-row">
          <span style="color:var(--text-muted); font-family:'Orbitron'; font-size:11px;">ACCELERATION</span>
          <div class="stat-bar-outer"><div class="stat-bar-fill" style="width:${80 + (CAR_SKINS.indexOf(previewCar) * 4)}%;"></div></div>
        </div>
        <div class="stat-row" style="margin:0;">
          <span style="color:var(--text-muted); font-family:'Orbitron'; font-size:11px;">HANDLING</span>
          <div class="stat-bar-outer"><div class="stat-bar-fill" style="width:${85 + (CAR_SKINS.indexOf(previewCar) * 3)}%;"></div></div>
        </div>
      </div>

      <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px; line-height:1.5;">${previewCar.desc}</p>

      ${isPreviewUnlocked
        ? `<button id="equipShowcaseBtn" class="btn-primary" style="width:100%; justify-content:center;">${isPreviewEquipped ? 'EQUIPPED' : 'EQUIP VEHICLE'}</button>`
        : `<button class="btn-secondary" disabled style="width:100%; opacity:0.5; cursor:not-allowed; justify-content:center;">LOCKED</button>`
      }
    `;

    if (isPreviewUnlocked && !isPreviewEquipped) {
      document.getElementById('equipShowcaseBtn')?.addEventListener('click', () => {
        Storage.setSelectedCar(previewCar.id);
        applySelectedCarSkin();
        renderGarage();
      });
    }

    grid.innerHTML = CAR_SKINS.map(skin => {
      const isUnlocked = bestScore >= skin.reqScore;
      const isEquipped = activeCar === skin.id;
      const isSelected = previewCarId === skin.id;

      return `
        <div class="car-card ${isSelected ? 'selected' : ''} ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}" data-id="${skin.id}">
          <div class="car-preview-box">
            <div style="width:45px; height:18px; background:#${skin.bodyColor.toString(16).padStart(6,'0')}; border:2px solid #${skin.specularColor.toString(16).padStart(6,'0')}; border-radius:4px; box-shadow:0 0 15px #${skin.specularColor.toString(16).padStart(6,'0')};"></div>
          </div>
          <div class="car-name">${skin.name}</div>
          <div class="car-condition">${isEquipped ? 'EQUIPPED' : isUnlocked ? 'UNLOCKED' : `${skin.reqScore.toLocaleString()} PTS`}</div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.car-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        previewCarId = id;
        applySelectedCarSkin(id);
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
    document.getElementById('settingWeather').checked = Storage.getWeatherSetting();
    document.getElementById('settingCrashReplay').checked = Storage.getCrashReplaySetting();
    document.getElementById('settingRival').checked = Storage.getRivalSetting();

    document.getElementById('settingSound').onchange = (e) => {
      cfg.sound = e.target.checked;
      audio.muted = !cfg.sound;
      Storage.setSettings(cfg);
    };

    document.getElementById('settingShake').onchange = (e) => {
      cfg.shake = e.target.checked;
      Storage.setSettings(cfg);
    };

    document.getElementById('settingWeather').onchange = (e) => {
      Storage.setWeatherSetting(e.target.checked);
    };

    document.getElementById('settingCrashReplay').onchange = (e) => {
      Storage.setCrashReplaySetting(e.target.checked);
    };

    document.getElementById('settingRival').onchange = (e) => {
      Storage.setRivalSetting(e.target.checked);
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
