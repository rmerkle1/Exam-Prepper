import * as THREE from 'three';

const TILE_SIZE = 1;
const WALL_HEIGHT = 1.4;
const FLOOR_HEIGHT = 0.1;
const PIECE_HEIGHT = 0.8;
const FOG_FADE_MS = 600;

const COLORS = {
  floor: 0xc8b89a,
  floorAlt: 0xbfac8f,
  wall: 0x6b5a4e,
  wallTop: 0x8a7060,
  void: 0x1a1a2e,
  door: 0x8b4513,
  doorFrame: 0x5c3317,
  stair: 0xa0c0a0,
  reachable: 0x44aaff,
  attackable: 0xff4444,
  ranged: 0xff8800,
  fog: 0x0a0a18,
};

// ─── Procedural texture generators ─────────────────────────────────────────

function _rng(seed) {
  // Simple deterministic noise helper
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function makeFloorTex(baseHex, size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = _rng(baseHex);

  // Base colour
  const base = '#' + baseHex.toString(16).padStart(6, '0');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // Subtle stone noise
  for (let i = 0; i < 1800; i++) {
    const x = Math.floor(r() * size);
    const y = Math.floor(r() * size);
    const v = Math.floor(r() * 30) - 15;
    ctx.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${Math.abs(v) / 255})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Grout border
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, size - 3, size - 3);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeWallTex(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = _rng(0x6b5a4e);

  // Mortar background
  ctx.fillStyle = '#3d2e26';
  ctx.fillRect(0, 0, size, size);

  // Stone blocks — two rows, offset pattern
  const blockW = size / 4;
  const blockH = size / 3;
  const mortar = 4;

  for (let row = 0; row < 4; row++) {
    const offset = (row % 2) * (blockW / 2);
    for (let col = -1; col < 5; col++) {
      const bx = col * blockW + offset + mortar / 2;
      const by = row * blockH + mortar / 2;
      const bw = blockW - mortar;
      const bh = blockH - mortar;
      const shade = Math.floor(r() * 40);
      ctx.fillStyle = `rgb(${107 + shade},${90 + shade},${78 + shade})`;
      ctx.fillRect(bx, by, bw, bh);

      // Subtle surface texture lines within block
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let li = 1; li < 4; li++) {
        const lx = bx + (bw / 4) * li;
        ctx.beginPath();
        ctx.moveTo(lx, by);
        ctx.lineTo(lx + (r() * 6 - 3), by + bh);
        ctx.stroke();
      }
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeWallTopTex(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = _rng(0x8a7060);

  ctx.fillStyle = '#8a7060';
  ctx.fillRect(0, 0, size, size);

  // Flat stone crack lines
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(r() * size, r() * size);
    ctx.lineTo(r() * size, r() * size);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeDoorTex(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = _rng(0x8b4513);

  // Wood base
  ctx.fillStyle = '#6b340f';
  ctx.fillRect(0, 0, size, size);

  // Horizontal planks
  const numPlanks = 5;
  const plankH = size / numPlanks;
  for (let i = 0; i < numPlanks; i++) {
    const y = i * plankH;
    const shade = Math.floor(r() * 20) - 10;
    ctx.fillStyle = `rgb(${139 + shade},${69 + shade},${19 + shade})`;
    ctx.fillRect(0, y + 2, size, plankH - 3);

    // Grain lines (vertical within plank)
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1;
    for (let g = 0; g < 8; g++) {
      const gx = (g + 0.5) * (size / 8) + (r() * 6 - 3);
      ctx.beginPath();
      ctx.moveTo(gx, y + 2);
      ctx.lineTo(gx + (r() * 8 - 4), y + plankH - 2);
      ctx.stroke();
    }
  }

  // Iron nails
  ctx.fillStyle = '#333';
  [[8, 8], [size - 8, 8], [8, size - 8], [size - 8, size - 8]].forEach(([nx, ny]) => {
    ctx.beginPath();
    ctx.arc(nx, ny, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeStairTex(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#a0c0a0';
  ctx.fillRect(0, 0, size, size);

  // Step lines
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 6;
  const steps = 4;
  for (let i = 1; i <= steps; i++) {
    const y = (i / (steps + 1)) * size;
    ctx.beginPath();
    ctx.moveTo(size * 0.1, y);
    ctx.lineTo(size * 0.9, y);
    ctx.stroke();
  }

  // Arrow-like chevron showing direction
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(size * 0.35, size * 0.75);
  ctx.lineTo(size * 0.5, size * 0.55);
  ctx.lineTo(size * 0.65, size * 0.75);
  ctx.stroke();

  return new THREE.CanvasTexture(c);
}

function makeBookshelfTex(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = _rng(0x4a2c0a);

  // Dark wood background
  ctx.fillStyle = '#2d1a06';
  ctx.fillRect(0, 0, size, size);

  const shelfColors = ['#a03010', '#1a5090', '#207040', '#907030', '#603080', '#205060', '#a06020'];
  const shelfCount = 4;
  const shelfH = size / shelfCount;

  for (let shelf = 0; shelf < shelfCount; shelf++) {
    const sy = shelf * shelfH;

    // Shelf board
    ctx.fillStyle = '#4a2c0a';
    ctx.fillRect(0, sy + shelfH - 10, size, 10);

    // Books
    let bx = 4;
    while (bx < size - 8) {
      const bw = 14 + Math.floor(r() * 14);
      const bh = shelfH * (0.55 + r() * 0.3);
      const by = sy + (shelfH - bh - 10);
      ctx.fillStyle = shelfColors[Math.floor(r() * shelfColors.length)];
      ctx.fillRect(bx, by, bw - 2, bh);
      // Spine highlight
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(bx, by, 2, bh);
      bx += bw;
    }
  }

  return new THREE.CanvasTexture(c);
}

function makeWoodTex(baseR, baseG, baseB, size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = _rng(baseR * 65536 + baseG * 256 + baseB);

  ctx.fillStyle = `rgb(${baseR},${baseG},${baseB})`;
  ctx.fillRect(0, 0, size, size);

  // Wood grain lines
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  for (let i = 0; i < 16; i++) {
    ctx.lineWidth = 1 + r() * 2;
    const x = r() * size;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(
      x + (r() * 20 - 10), size * 0.33,
      x + (r() * 20 - 10), size * 0.66,
      x + (r() * 20 - 10), size
    );
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeFireplaceTex(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = _rng(0x3a2020);

  // Stone background
  ctx.fillStyle = '#3a2020';
  ctx.fillRect(0, 0, size, size);

  // Sooty center arch
  const grad = ctx.createRadialGradient(size / 2, size * 0.8, 10, size / 2, size * 0.5, size * 0.45);
  grad.addColorStop(0, 'rgba(0,0,0,0.9)');
  grad.addColorStop(0.6, 'rgba(20,8,0,0.7)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Ember glow
  const fireGrad = ctx.createRadialGradient(size / 2, size * 0.85, 0, size / 2, size * 0.8, size * 0.25);
  fireGrad.addColorStop(0, 'rgba(255,180,20,0.7)');
  fireGrad.addColorStop(0.5, 'rgba(200,60,0,0.4)');
  fireGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fireGrad;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(c);
}

function makeThroneTex(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  // Gold base
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#c8a020');
  grad.addColorStop(0.5, '#f0c840');
  grad.addColorStop(1, '#a07818');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Ornate cross pattern
  ctx.strokeStyle = 'rgba(80,40,0,0.35)';
  ctx.lineWidth = 6;
  ctx.strokeRect(size * 0.2, size * 0.2, size * 0.6, size * 0.6);
  ctx.beginPath();
  ctx.moveTo(size / 2, size * 0.1);
  ctx.lineTo(size / 2, size * 0.9);
  ctx.moveTo(size * 0.1, size / 2);
  ctx.lineTo(size * 0.9, size / 2);
  ctx.stroke();

  // Center jewel
  ctx.fillStyle = '#cc2020';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#800000';
  ctx.lineWidth = 2;
  ctx.stroke();

  return new THREE.CanvasTexture(c);
}

// ─── IsoScene ───────────────────────────────────────────────────────────────

export class IsoScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.tileObjects = new Map();   // "x,y" -> floor mesh (for raycasting)
    this.pieceMeshes = new Map();   // pieceId -> Group
    this.highlightMeshes = [];
    this.fogMeshes = new Map();     // "x,y" -> { mesh, fadingOut, startTime }
    this.furnitureMeshes = new Map(); // "x,y" -> mesh[]
    this.wallCapMeshes = new Map();   // "x,y" -> cap mesh (for secret door removal)
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this._onClickHandlers = [];
    this._onHoverHandlers = [];
    this._boardWidth = 26;
    this._boardHeight = 19;

    // Texture loading
    this._texLoader = new THREE.TextureLoader();
    this._texLib = new Map();   // name -> THREE.Texture

    this._initRenderer();
    this._initScene();
    this._initCamera();
    this._initLights();
    this._initTextures();
    this._bindEvents();
    this._animate();
  }

  // ─── Texture helpers ───────────────────────────────────────────────────

  /**
   * Get a texture by name, loading from public/assets/textures/<name>.png
   * and falling back to the provided procedural texture generator.
   */
  _tex(name, fallbackFn) {
    if (this._texLib.has(name)) return this._texLib.get(name);

    // Pre-built procedural fallback is inserted in _initTextures; this handles
    // on-demand lazy access if called before that (shouldn't happen normally).
    const fallback = fallbackFn ? fallbackFn() : null;
    if (fallback) this._texLib.set(name, fallback);

    // Kick off async PNG load and swap it in when ready
    this._texLoader.load(
      `/assets/textures/${name}.png`,
      (loaded) => {
        loaded.wrapS = loaded.wrapT = THREE.RepeatWrapping;
        this._texLib.set(name, loaded);
        // Swap material maps on any already-built meshes
        this.scene?.traverse(obj => {
          if (obj.isMesh && obj.material?.userData?.texName === name) {
            obj.material.map = loaded;
            obj.material.needsUpdate = true;
          }
        });
      },
      undefined,
      () => { /* 404 is expected until PNGs are added; fallback stays */ }
    );

    return this._texLib.get(name) || null;
  }

  /** Build all procedural textures up front so first frame is textured. */
  _initTextures() {
    this._texLib.set('floor',       makeFloorTex(COLORS.floor));
    this._texLib.set('floor_alt',   makeFloorTex(COLORS.floorAlt));
    this._texLib.set('wall',        makeWallTex());
    this._texLib.set('wall_top',    makeWallTopTex());
    this._texLib.set('door',        makeDoorTex());
    this._texLib.set('door_frame',  makeWoodTex(92, 51, 23));
    this._texLib.set('stair',       makeStairTex());
    this._texLib.set('bookshelf',   makeBookshelfTex());
    this._texLib.set('table',       makeWoodTex(139, 105, 20));
    this._texLib.set('rack',        makeWoodTex(107, 58, 26));
    this._texLib.set('fireplace',   makeFireplaceTex());
    this._texLib.set('throne',      makeThroneTex());
    this._texLib.set('furniture',   makeWoodTex(122, 90, 48)); // generic
  }

  /** Create a MeshLambertMaterial with texture + colour tint, tagging it for hot-swap. */
  _matWithTex(texName, color) {
    const tex = this._texLib.get(texName) || null;
    const mat = new THREE.MeshLambertMaterial({ color, map: tex });
    mat.userData.texName = texName;
    return mat;
  }

  // ─── Scene setup ───────────────────────────────────────────────────────

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(COLORS.void);
    this._resize();
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x1a1a2e, 30, 60);
  }

  _initCamera() {
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    const viewSize = 14;
    this.camera = new THREE.OrthographicCamera(
      -viewSize * aspect, viewSize * aspect,
      viewSize, -viewSize,
      0.1, 200
    );
    this.camera.position.set(20, 20, 20);
    this.camera.lookAt(0, 0, 0);
    this._cameraTarget = new THREE.Vector3(0, 0, 0);
    this._zoom = viewSize;
    this._isPanning = false;
    this._panStart = { x: 0, y: 0 };
    this._panCameraStart = new THREE.Vector3();
  }

  _initLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff5e0, 1.2);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 100;
    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0xaaccff, 0.3);
    fill.position.set(-10, 5, -10);
    this.scene.add(fill);
  }

  _resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.renderer.setSize(w, h, false);
    if (this.camera) {
      const aspect = w / h;
      const v = this._zoom || 14;
      this.camera.left = -v * aspect;
      this.camera.right = v * aspect;
      this.camera.top = v;
      this.camera.bottom = -v;
      this.camera.updateProjectionMatrix();
    }
  }

  _bindEvents() {
    window.addEventListener('resize', () => this._resize());

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 1 || e.button === 2) {
        this._isPanning = true;
        this._panStart = { x: e.clientX, y: e.clientY };
        this._panCameraStart.copy(this._cameraTarget);
        e.preventDefault();
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this._isPanning) {
        const dx = (e.clientX - this._panStart.x) * 0.04;
        const dy = (e.clientY - this._panStart.y) * 0.04;
        this._cameraTarget.set(
          this._panCameraStart.x - dx + dy,
          0,
          this._panCameraStart.z + dx + dy
        );
        this._updateCameraPosition();
      }
      this._updateMouse(e);
      const tile = this._getTileUnderMouse();
      this._onHoverHandlers.forEach(fn => fn(tile));
    });

    this.canvas.addEventListener('mouseup', () => { this._isPanning = false; });
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());

    this.canvas.addEventListener('wheel', (e) => {
      this._zoom = Math.max(6, Math.min(24, this._zoom + e.deltaY * 0.02));
      this._resize();
      e.preventDefault();
    }, { passive: false });

    this.canvas.addEventListener('click', (e) => {
      this._updateMouse(e);
      const tile = this._getTileUnderMouse();
      if (tile) this._onClickHandlers.forEach(fn => fn(tile));
    });
  }

  _updateMouse(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  _getTileUnderMouse() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const floorObjects = [...this.tileObjects.values()].filter(o => o.userData.isFloor);
    const hits = this.raycaster.intersectObjects(floorObjects, false);
    if (hits.length > 0) {
      const { tileX, tileY } = hits[0].object.userData;
      return { x: tileX, y: tileY };
    }
    return null;
  }

  _updateCameraPosition() {
    const t = this._cameraTarget;
    this.camera.position.set(t.x + 20, t.y + 20, t.z + 20);
    this.camera.lookAt(t);
  }

  _animate() {
    this._rafId = requestAnimationFrame(() => this._animate());
    this._tickFog();
    this.renderer.render(this.scene, this.camera);
  }

  _tickFog() {
    const now = performance.now();
    for (const [key, fogData] of this.fogMeshes) {
      if (!fogData.fadingOut) continue;
      const elapsed = now - fogData.startTime;
      const t = Math.min(elapsed / FOG_FADE_MS, 1);
      fogData.mesh.material.opacity = 0.92 * (1 - t);
      if (t >= 1) {
        this.scene.remove(fogData.mesh);
        fogData.mesh.geometry.dispose();
        fogData.mesh.material.dispose();
        this.fogMeshes.delete(key);
      }
    }
  }

  // ─── Public API ─────────────────────────────────────────────────────

  onTileClick(fn) { this._onClickHandlers.push(fn); }
  onTileHover(fn) { this._onHoverHandlers.push(fn); }

  _tileToWorld(col, row) {
    const offsetX = -(this._boardWidth * TILE_SIZE) / 2;
    const offsetZ = -(this._boardHeight * TILE_SIZE) / 2;
    return {
      wx: col * TILE_SIZE + offsetX + TILE_SIZE / 2,
      wz: row * TILE_SIZE + offsetZ + TILE_SIZE / 2,
    };
  }

  buildBoard(quest) {
    this.tileObjects.forEach(obj => this.scene.remove(obj));
    this.tileObjects.clear();
    this.fogMeshes.forEach(({ mesh }) => this.scene.remove(mesh));
    this.fogMeshes.clear();
    this.furnitureMeshes.forEach(meshes => meshes.forEach(m => this.scene.remove(m)));
    this.furnitureMeshes.clear();
    this.wallCapMeshes.forEach(m => this.scene.remove(m));
    this.wallCapMeshes.clear();

    this._boardWidth = quest.boardWidth;
    this._boardHeight = quest.boardHeight;

    const { tiles, boardWidth, boardHeight } = quest;

    for (let row = 0; row < boardHeight; row++) {
      for (let col = 0; col < boardWidth; col++) {
        const type = tiles[row][col];
        if (type === 'void') continue;
        const { wx, wz } = this._tileToWorld(col, row);
        if (type === 'wall') {
          this._makeWall(col, row, wx, wz);
        } else {
          this._makeFloor(col, row, type, wx, wz);
        }
      }
    }

    this._cameraTarget.set(0, 0, 0);
    this._updateCameraPosition();

    if (quest.furniture?.length) this._buildFurniture(quest.furniture);
  }

  _buildFurniture(furniture) {
    furniture.forEach(({ x, y, type }) => {
      const { wx, wz } = this._tileToWorld(x, y);
      const meshes = [];

      let h, color, w, d, texName;
      switch (type) {
        case 'bookshelf': h = 1.1;  color = 0x4a2c0a; w = 0.8; d = 0.25; texName = 'bookshelf'; break;
        case 'table':     h = 0.35; color = 0x8b6914; w = 0.75; d = 0.55; texName = 'table';     break;
        case 'rack':      h = 0.9;  color = 0x6b3a1a; w = 0.65; d = 0.2;  texName = 'rack';      break;
        case 'fireplace': h = 0.7;  color = 0x3a2020; w = 0.8;  d = 0.45; texName = 'fireplace'; break;
        case 'throne':    h = 1.2;  color = 0x7a6010; w = 0.5;  d = 0.5;  texName = 'throne';    break;
        default:          h = 0.5;  color = 0x7a5a30; w = 0.6;  d = 0.5;  texName = 'furniture';
      }

      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = this._matWithTex(texName, color);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(wx, h / 2, wz);
      mesh.castShadow = true;
      this.scene.add(mesh);
      meshes.push(mesh);

      // Cap for bookshelf / throne
      if (type === 'bookshelf' || type === 'throne') {
        const capGeo = new THREE.BoxGeometry(w + 0.05, 0.06, d + 0.05);
        const capMat = this._matWithTex('wall_top', 0x2a1a06);
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.set(wx, h + 0.03, wz);
        this.scene.add(cap);
        meshes.push(cap);
      }

      // Table legs
      if (type === 'table') {
        const legGeo = new THREE.BoxGeometry(0.06, h, 0.06);
        const legMat = this._matWithTex('rack', 0x6b5020);
        const legOffsets = [[-w * 0.35, -d * 0.4], [w * 0.35, -d * 0.4], [-w * 0.35, d * 0.4], [w * 0.35, d * 0.4]];
        legOffsets.forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(wx + lx, h / 2, wz + lz);
          leg.castShadow = true;
          this.scene.add(leg);
          meshes.push(leg);
        });
      }

      // Fireplace flame sprite
      if (type === 'fireplace') {
        const flameCanvas = document.createElement('canvas');
        flameCanvas.width = 64; flameCanvas.height = 96;
        const fCtx = flameCanvas.getContext('2d');
        const fg = fCtx.createLinearGradient(0, 96, 0, 0);
        fg.addColorStop(0, 'rgba(255,100,0,0.9)');
        fg.addColorStop(0.5, 'rgba(255,200,0,0.7)');
        fg.addColorStop(1, 'rgba(255,255,200,0)');
        fCtx.fillStyle = fg;
        fCtx.beginPath();
        fCtx.ellipse(32, 70, 20, 30, 0, 0, Math.PI * 2);
        fCtx.fill();
        const flameTex = new THREE.CanvasTexture(flameCanvas);
        const flameMat = new THREE.SpriteMaterial({ map: flameTex, transparent: true, depthWrite: false });
        const flame = new THREE.Sprite(flameMat);
        flame.scale.set(0.4, 0.55, 1);
        flame.position.set(wx, h * 0.5, wz);
        this.scene.add(flame);
        meshes.push(flame);
      }

      this.furnitureMeshes.set(`${x},${y}`, meshes);
    });
  }

  buildFog(quest) {
    this.fogMeshes.forEach(({ mesh }) => this.scene.remove(mesh));
    this.fogMeshes.clear();

    const { tiles, boardWidth, boardHeight } = quest;
    const fogGeo = new THREE.BoxGeometry(TILE_SIZE, WALL_HEIGHT + 0.5, TILE_SIZE);

    for (let row = 0; row < boardHeight; row++) {
      for (let col = 0; col < boardWidth; col++) {
        const type = tiles[row][col];
        if (type === 'void' || type === 'wall') continue;

        const { wx, wz } = this._tileToWorld(col, row);
        const mat = new THREE.MeshBasicMaterial({
          color: COLORS.fog,
          transparent: true,
          opacity: 0.92,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(fogGeo, mat);
        mesh.position.set(wx, WALL_HEIGHT / 2, wz);
        mesh.renderOrder = 10;
        this.scene.add(mesh);
        this.fogMeshes.set(`${col},${row}`, { mesh, fadingOut: false, startTime: 0 });
      }
    }
  }

  updateFog(revealedTiles) {
    const now = performance.now();
    for (const key of revealedTiles) {
      const fogData = this.fogMeshes.get(key);
      if (fogData && !fogData.fadingOut) {
        fogData.fadingOut = true;
        fogData.startTime = now;
      }
    }
  }

  _makeFloor(col, row, type, wx, wz) {
    let texName, color;
    if (type === 'stair') {
      texName = 'stair'; color = COLORS.stair;
    } else if (type === 'door_h' || type === 'door_v') {
      texName = 'door'; color = COLORS.door;
    } else if ((col + row) % 2 === 0) {
      texName = 'floor'; color = COLORS.floor;
    } else {
      texName = 'floor_alt'; color = COLORS.floorAlt;
    }

    const geo = new THREE.BoxGeometry(TILE_SIZE, FLOOR_HEIGHT, TILE_SIZE);
    const mat = this._matWithTex(texName, color);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(wx, -FLOOR_HEIGHT / 2, wz);
    mesh.receiveShadow = true;
    mesh.userData = { isFloor: true, tileX: col, tileY: row, tileType: type };
    this.scene.add(mesh);
    this.tileObjects.set(`${col},${row}`, mesh);

    // Grid lines
    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.15, transparent: true })
    );
    line.position.copy(mesh.position);
    this.scene.add(line);

    // Door frame (3D panel standing on door tile)
    if (type === 'door_h' || type === 'door_v') {
      const dGeo = new THREE.BoxGeometry(
        type === 'door_h' ? TILE_SIZE * 0.5 : TILE_SIZE * 0.15,
        WALL_HEIGHT * 0.7,
        type === 'door_v' ? TILE_SIZE * 0.5 : TILE_SIZE * 0.15
      );
      const dMat = this._matWithTex('door_frame', COLORS.doorFrame);
      const door = new THREE.Mesh(dGeo, dMat);
      door.position.set(wx, WALL_HEIGHT * 0.35 - FLOOR_HEIGHT / 2, wz);
      door.castShadow = true;
      this.scene.add(door);
    }

    // Stair treads
    if (type === 'stair') {
      const steps = 3;
      for (let s = 0; s < steps; s++) {
        const sGeo = new THREE.BoxGeometry(TILE_SIZE * 0.7, 0.04, TILE_SIZE * 0.15);
        const sMat = this._matWithTex('stair', 0x7aab7a);
        const step = new THREE.Mesh(sGeo, sMat);
        step.position.set(wx, 0.04 * s, wz - 0.2 + s * 0.15);
        this.scene.add(step);
      }
    }
  }

  _makeWall(col, row, wx, wz) {
    const geo = new THREE.BoxGeometry(TILE_SIZE, WALL_HEIGHT, TILE_SIZE);
    const mat = this._matWithTex('wall', COLORS.wall);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(wx, WALL_HEIGHT / 2 - FLOOR_HEIGHT / 2, wz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { isFloor: false, tileX: col, tileY: row, tileType: 'wall' };
    this.scene.add(mesh);
    this.tileObjects.set(`${col},${row}`, mesh);

    // Wall cap (tracked so secret door reveal can remove it)
    const capGeo = new THREE.BoxGeometry(TILE_SIZE, 0.05, TILE_SIZE);
    const capMat = this._matWithTex('wall_top', COLORS.wallTop);
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(wx, WALL_HEIGHT - FLOOR_HEIGHT / 2, wz);
    this.scene.add(cap);
    this.wallCapMeshes.set(`${col},${row}`, cap);
  }

  // ─── Pieces ──────────────────────────────────────────────────────────

  addPiece(piece) {
    const group = new THREE.Group();
    const { wx, wz } = this._tileToWorld(piece.x, piece.y);

    // Base disc
    const baseGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.1, 16);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.05;
    group.add(base);

    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.18, 0.22, PIECE_HEIGHT * 0.6, 16);
    const bodyMat = new THREE.MeshLambertMaterial({ color: piece.color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = PIECE_HEIGHT * 0.3 + 0.1;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.16, 16, 12);
    const headMat = new THREE.MeshLambertMaterial({ color: piece.color });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = PIECE_HEIGHT * 0.6 + 0.26;
    head.castShadow = true;
    group.add(head);

    // Floating name label
    const label = this._makeLabel(piece.name, piece.color);
    label.position.y = PIECE_HEIGHT + 0.3;
    group.add(label);

    group.position.set(wx, 0, wz);
    group.userData = { pieceId: piece.id };
    this.scene.add(group);
    this.pieceMeshes.set(piece.id, group);
  }

  _makeLabel(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#00000088';
    ctx.beginPath();
    ctx.roundRect(0, 4, 128, 24, 4);
    ctx.fill();
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 16);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.2, 0.3, 1);
    return sprite;
  }

  movePiece(pieceId, x, y) {
    const group = this.pieceMeshes.get(pieceId);
    if (!group) return;
    const { wx, wz } = this._tileToWorld(x, y);
    group.position.set(wx, 0, wz);
  }

  removePiece(pieceId) {
    const group = this.pieceMeshes.get(pieceId);
    if (group) {
      this.scene.remove(group);
      this.pieceMeshes.delete(pieceId);
    }
  }

  // ─── Highlights ──────────────────────────────────────────────────────

  setHighlights(tiles, mode = 'reachable') {
    const color = mode === 'reachable' ? COLORS.reachable : mode === 'ranged' ? COLORS.ranged : COLORS.attackable;

    tiles.forEach(({ x, y }) => {
      const { wx, wz } = this._tileToWorld(x, y);
      const geo = new THREE.BoxGeometry(TILE_SIZE * 0.88, 0.05, TILE_SIZE * 0.88);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(wx, 0.02, wz);
      mesh.renderOrder = 5;
      this.scene.add(mesh);
      this.highlightMeshes.push(mesh);
    });
  }

  clearHighlights() {
    this.highlightMeshes.forEach(m => {
      this.scene.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    });
    this.highlightMeshes = [];
  }

  // ─── Intent paths (planning overlay) ────────────────────────────────

  setIntentPath(heroId, path, destX, destY, heroColor) {
    this.clearIntentPath(heroId);
    if (!this.intentMeshes) this.intentMeshes = new Map();
    const meshes = [];

    path.forEach(({ x, y }, i) => {
      const { wx, wz } = this._tileToWorld(x, y);
      const isLast = i === path.length - 1;

      const geo = new THREE.BoxGeometry(
        isLast ? TILE_SIZE * 0.82 : TILE_SIZE * 0.28,
        0.06,
        isLast ? TILE_SIZE * 0.82 : TILE_SIZE * 0.28
      );
      const mat = new THREE.MeshBasicMaterial({
        color: heroColor, transparent: true,
        opacity: isLast ? 0.65 : 0.35, depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(wx, 0.04, wz);
      mesh.renderOrder = 6;
      this.scene.add(mesh);
      meshes.push(mesh);

      if (i < path.length - 1) {
        const next = path[i + 1];
        const { wx: nx, wz: nz } = this._tileToWorld(next.x, next.y);
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(wx, 0.05, wz),
          new THREE.Vector3(nx, 0.05, nz),
        ]);
        const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: heroColor, transparent: true, opacity: 0.5 }));
        line.renderOrder = 6;
        this.scene.add(line);
        meshes.push(line);
      }
    });

    if (path.length > 0) {
      const { wx, wz } = this._tileToWorld(destX, destY);
      const ringEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(TILE_SIZE * 0.94, 0.08, TILE_SIZE * 0.94));
      const ring = new THREE.LineSegments(ringEdges, new THREE.LineBasicMaterial({ color: heroColor }));
      ring.position.set(wx, 0.06, wz);
      ring.renderOrder = 7;
      this.scene.add(ring);
      meshes.push(ring);
    }

    this.intentMeshes.set(heroId, meshes);
  }

  clearIntentPath(heroId) {
    if (!this.intentMeshes) return;
    const meshes = this.intentMeshes.get(heroId) || [];
    meshes.forEach(m => { this.scene.remove(m); m.geometry?.dispose(); m.material?.dispose(); });
    this.intentMeshes.delete(heroId);
  }

  clearAllIntentPaths() {
    if (!this.intentMeshes) return;
    for (const id of [...this.intentMeshes.keys()]) this.clearIntentPath(id);
  }

  // ─── Trap markers ────────────────────────────────────────────────────

  addTrapMarker(trapId, x, y) {
    if (!this.markerMeshes) this.markerMeshes = new Map();
    if (this.markerMeshes.has(trapId)) return;
    const { wx, wz } = this._tileToWorld(x, y);
    const geo = new THREE.BoxGeometry(TILE_SIZE * 0.55, 0.08, TILE_SIZE * 0.55);
    const mat = new THREE.MeshBasicMaterial({ color: 0xe67e22, transparent: true, opacity: 0.85 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(wx, 0.05, wz);
    mesh.renderOrder = 6;
    this.scene.add(mesh);
    this.markerMeshes.set(trapId, mesh);
  }

  removeTrapMarker(trapId) {
    if (!this.markerMeshes) return;
    const m = this.markerMeshes.get(trapId);
    if (m) { this.scene.remove(m); m.geometry.dispose(); m.material.dispose(); this.markerMeshes.delete(trapId); }
  }

  // ─── Secret doors ────────────────────────────────────────────────────

  revealSecretDoor(x, y) {
    const key = `${x},${y}`;
    const wall = this.tileObjects.get(key);
    if (wall) {
      this.scene.remove(wall);
      wall.geometry?.dispose();
      wall.material?.dispose();
      this.tileObjects.delete(key);
    }
    const cap = this.wallCapMeshes.get(key);
    if (cap) {
      this.scene.remove(cap);
      cap.geometry?.dispose();
      cap.material?.dispose();
      this.wallCapMeshes.delete(key);
    }
    const { wx, wz } = this._tileToWorld(x, y);
    this._makeFloor(x, y, 'door_h', wx, wz);
  }

  destroy() {
    cancelAnimationFrame(this._rafId);
    this.renderer.dispose();
    window.removeEventListener('resize', this._resize);
  }
}
