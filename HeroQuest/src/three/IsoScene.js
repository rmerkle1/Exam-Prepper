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

    this._initRenderer();
    this._initScene();
    this._initCamera();
    this._initLights();
    this._bindEvents();
    this._animate();
  }

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

  // Fade out fog meshes that are being revealed
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
    // Clear old tile objects
    this.tileObjects.forEach(obj => this.scene.remove(obj));
    this.tileObjects.clear();
    // Clear old fog
    this.fogMeshes.forEach(({ mesh }) => this.scene.remove(mesh));
    this.fogMeshes.clear();
    // Clear old furniture
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

      let h, color, w, d;
      switch (type) {
        case 'bookshelf': h = 1.1;  color = 0x4a2c0a; w = 0.8; d = 0.25; break;
        case 'table':     h = 0.35; color = 0x8b6914; w = 0.75; d = 0.55; break;
        case 'rack':      h = 0.9;  color = 0x6b3a1a; w = 0.65; d = 0.2;  break;
        case 'fireplace': h = 0.7;  color = 0x3a2020; w = 0.8;  d = 0.45; break;
        case 'throne':    h = 1.2;  color = 0x7a6010; w = 0.5;  d = 0.5;  break;
        default:          h = 0.5;  color = 0x7a5a30; w = 0.6;  d = 0.5;
      }

      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshLambertMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(wx, h / 2, wz);
      mesh.castShadow = true;
      this.scene.add(mesh);
      meshes.push(mesh);

      // Small detail top cap for bookshelf / throne
      if (type === 'bookshelf' || type === 'throne') {
        const capGeo = new THREE.BoxGeometry(w + 0.05, 0.06, d + 0.05);
        const capMat = new THREE.MeshLambertMaterial({ color: 0x2a1a06 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.set(wx, h + 0.03, wz);
        this.scene.add(cap);
        meshes.push(cap);
      }

      this.furnitureMeshes.set(`${x},${y}`, meshes);
    });
  }

  // Build fog overlay for all non-wall/non-void tiles. Call after buildBoard.
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

  // Reveal tiles: fade out fog for any key in revealedTiles that still has fog.
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
    const color = type === 'stair' ? COLORS.stair
      : type === 'door_h' || type === 'door_v' ? COLORS.door
      : (col + row) % 2 === 0 ? COLORS.floor : COLORS.floorAlt;

    const geo = new THREE.BoxGeometry(TILE_SIZE, FLOOR_HEIGHT, TILE_SIZE);
    const mat = new THREE.MeshLambertMaterial({ color });
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

    // Door frame
    if (type === 'door_h' || type === 'door_v') {
      const dGeo = new THREE.BoxGeometry(
        type === 'door_h' ? TILE_SIZE * 0.5 : TILE_SIZE * 0.15,
        WALL_HEIGHT * 0.7,
        type === 'door_v' ? TILE_SIZE * 0.5 : TILE_SIZE * 0.15
      );
      const dMat = new THREE.MeshLambertMaterial({ color: COLORS.doorFrame });
      const door = new THREE.Mesh(dGeo, dMat);
      door.position.set(wx, WALL_HEIGHT * 0.35 - FLOOR_HEIGHT / 2, wz);
      door.castShadow = true;
      this.scene.add(door);
    }

    // Stair indicator
    if (type === 'stair') {
      const steps = 3;
      for (let s = 0; s < steps; s++) {
        const sGeo = new THREE.BoxGeometry(TILE_SIZE * 0.7, 0.04, TILE_SIZE * 0.15);
        const sMat = new THREE.MeshLambertMaterial({ color: 0x7aab7a });
        const step = new THREE.Mesh(sGeo, sMat);
        step.position.set(wx, 0.04 * s, wz - 0.2 + s * 0.15);
        this.scene.add(step);
      }
    }
  }

  _makeWall(col, row, wx, wz) {
    const geo = new THREE.BoxGeometry(TILE_SIZE, WALL_HEIGHT, TILE_SIZE);
    const mat = new THREE.MeshLambertMaterial({ color: COLORS.wall });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(wx, WALL_HEIGHT / 2 - FLOOR_HEIGHT / 2, wz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { isFloor: false, tileX: col, tileY: row, tileType: 'wall' };
    this.scene.add(mesh);
    this.tileObjects.set(`${col},${row}`, mesh);

    // Wall cap (tracked so secret door reveal can remove it)
    const capGeo = new THREE.BoxGeometry(TILE_SIZE, 0.05, TILE_SIZE);
    const capMat = new THREE.MeshLambertMaterial({ color: COLORS.wallTop });
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

      // Tile marker (larger at destination)
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

      // Line to next tile
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

    // Destination outline ring
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
    // Remove wall body
    const wall = this.tileObjects.get(key);
    if (wall) {
      this.scene.remove(wall);
      wall.geometry?.dispose();
      wall.material?.dispose();
      this.tileObjects.delete(key);
    }
    // Remove wall cap
    const cap = this.wallCapMeshes.get(key);
    if (cap) {
      this.scene.remove(cap);
      cap.geometry?.dispose();
      cap.material?.dispose();
      this.wallCapMeshes.delete(key);
    }
    // Add a door frame in its place
    const { wx, wz } = this._tileToWorld(x, y);
    this._makeFloor(x, y, 'door_h', wx, wz);
  }

  destroy() {
    cancelAnimationFrame(this._rafId);
    this.renderer.dispose();
    window.removeEventListener('resize', this._resize);
  }
}
