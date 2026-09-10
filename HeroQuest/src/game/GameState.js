import { HEROES } from '../data/heroes.js';
import { MONSTERS } from '../data/monsters.js';
import { getEffectiveAttack, getEffectiveDefend } from '../data/armory.js';

export const ACTIONS = {
  MOVE: 'move',
  ATTACK: 'attack',
  SEARCH_TREASURE: 'search_treasure',
  SEARCH_TRAPS: 'search_traps',
  SEARCH_SECRET: 'search_secret',
  DISARM_TRAP: 'disarm_trap',
  CAST_SPELL: 'cast_spell',
  USE_POTION: 'use_potion',
};

export const PHASE = {
  LOBBY: 'lobby',
  HERO_TURN: 'hero_turn',
  MONSTER_TURN: 'monster_turn',
  COMBAT: 'combat',
  QUEST_COMPLETE: 'quest_complete',
  GAME_OVER: 'game_over',
};

export function createHeroPiece(heroId, playerId, spawnX, spawnY) {
  const template = HEROES[heroId];
  return {
    id: `hero_${playerId}`,
    heroId,
    playerId,
    name: template.name,
    x: spawnX,
    y: spawnY,
    body: template.body,
    maxBody: template.body,
    mind: template.mind,
    maxMind: template.mind,
    attackDice: template.attackDice,
    defendDice: template.defendDice,
    movement: template.movement,
    color: template.color,
    spells: [...template.spells],
    gold: template.startingGold,
    equipment: [],
    isDead: false,
  };
}

export function createMonsterPiece(monsterData) {
  const template = MONSTERS[monsterData.type];
  return {
    id: monsterData.id,
    type: monsterData.type,
    name: template.name,
    x: monsterData.x,
    y: monsterData.y,
    body: template.body,
    maxBody: template.body,
    mind: template.mind,
    attackDice: template.attackDice,
    defendDice: template.defendDice,
    movement: template.movement,
    color: template.color,
    gold: template.gold,
    isDead: false,
  };
}

// ─── Dice ──────────────────────────────────────────────────────────────────

export function rollDice(count) {
  // HeroQuest combat die: 2 skulls, 2 white shields, 1 black shield, 1 helm
  const faces = ['skull', 'skull', 'white_shield', 'white_shield', 'black_shield', 'helm'];
  return Array.from({ length: count }, () => faces[Math.floor(Math.random() * 6)]);
}

export function rollMovement(diceCount = 2) {
  return Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1)
    .reduce((a, b) => a + b, 0);
}

export function resolveCombat(attackRolls, defendRolls) {
  const skulls = attackRolls.filter(r => r === 'skull').length;
  const shields = defendRolls.filter(r => r === 'black_shield').length;
  const damage = Math.max(0, skulls - shields);
  return { skulls, shields, damage };
}

// ─── Tile utilities ─────────────────────────────────────────────────────────

export function getAdjacentTiles(x, y) {
  return [
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 },
  ];
}

function isPassable(tile) {
  return tile && tile !== 'void' && tile !== 'wall';
}

export function isTileWalkable(quest, x, y, pieces) {
  if (x < 0 || y < 0 || x >= quest.boardWidth || y >= quest.boardHeight) return false;
  if (!isPassable(quest.tiles[y][x])) return false;
  return !pieces.some(p => !p.isDead && p.x === x && p.y === y);
}

export function getAdjacentPieces(x, y, pieces, diagonal = false) {
  const adj = diagonal
    ? [
        { x: x-1, y }, { x: x+1, y }, { x, y: y-1 }, { x, y: y+1 },
        { x: x-1, y: y-1 }, { x: x+1, y: y-1 }, { x: x-1, y: y+1 }, { x: x+1, y: y+1 },
      ]
    : getAdjacentTiles(x, y);
  return pieces.filter(p => !p.isDead && adj.some(a => a.x === p.x && a.y === p.y));
}

function hasLineOfSight(quest, x1, y1, x2, y2) {
  if (x1 === x2) {
    const minY = Math.min(y1, y2) + 1;
    const maxY = Math.max(y1, y2);
    for (let y = minY; y < maxY; y++) {
      if (!isPassable(quest.tiles[y]?.[x1])) return false;
    }
    return true;
  } else if (y1 === y2) {
    const minX = Math.min(x1, x2) + 1;
    const maxX = Math.max(x1, x2);
    for (let x = minX; x < maxX; x++) {
      if (!isPassable(quest.tiles[y1]?.[x])) return false;
    }
    return true;
  }
  return false;
}

export function getRangedTargets(quest, heroX, heroY, monsters, revealedTiles, crossbowMode = false) {
  return monsters.filter(m => {
    if (m.isDead) return false;
    if (!revealedTiles?.has(`${m.x},${m.y}`)) return false;
    if (m.x !== heroX && m.y !== heroY) return false;
    if (crossbowMode && Math.abs(m.x - heroX) + Math.abs(m.y - heroY) <= 1) return false;
    return hasLineOfSight(quest, heroX, heroY, m.x, m.y);
  });
}

// traversalBlockers: pieces that physically block passage (monsters for heroes, all pieces for monsters).
// landingBlockers: pieces whose tile cannot be the final destination (defaults to traversalBlockers).
// extraPassable: set of "x,y" keys that are passable despite being walls (revealed secret doors).
// Heroes can walk THROUGH other heroes but cannot end on them.
// Returns {x, y, movesLeft} — movesLeft is remaining moves after reaching that tile.
export function getReachableTiles(quest, startX, startY, moves, traversalBlockers, landingBlockers = traversalBlockers, extraPassable = new Set()) {
  const visited = new Map();
  const queue = [{ x: startX, y: startY, movesLeft: moves }];
  visited.set(`${startX},${startY}`, moves);

  while (queue.length > 0) {
    const current = queue.shift();
    for (const neighbor of getAdjacentTiles(current.x, current.y)) {
      const nx = neighbor.x, ny = neighbor.y;
      const key = `${nx},${ny}`;
      const movesAfter = current.movesLeft - 1;
      if (movesAfter < 0) continue;
      if (nx < 0 || ny < 0 || nx >= quest.boardWidth || ny >= quest.boardHeight) continue;
      if (!isPassable(quest.tiles[ny][nx]) && !extraPassable.has(key)) continue;
      if (traversalBlockers.some(p => !p.isDead && p.x === nx && p.y === ny)) continue;
      if (visited.has(key) && visited.get(key) >= movesAfter) continue;
      visited.set(key, movesAfter);
      queue.push({ x: nx, y: ny, movesLeft: movesAfter });
    }
  }

  visited.delete(`${startX},${startY}`);
  const landingSet = new Set(landingBlockers.filter(p => !p.isDead).map(p => `${p.x},${p.y}`));
  return [...visited.keys()]
    .filter(k => {
      if (landingSet.has(k)) return false;
      const [x, y] = k.split(',').map(Number);
      return isPassable(quest.tiles[y]?.[x]); // cannot land on walls even if traversable via pass_through_rock
    })
    .map(k => {
      const [x, y] = k.split(',').map(Number);
      return { x, y, movesLeft: visited.get(k) };
    });
}

// ─── Fog of war ─────────────────────────────────────────────────────────────

// Flood-fill through floor/stair tiles only (stops at doors and walls).
// Mutates revealedSet in place.
function floodFillFloor(quest, startX, startY, revealedSet) {
  const startKey = `${startX},${startY}`;
  if (revealedSet.has(startKey)) return;

  const tile = quest.tiles[startY]?.[startX];
  if (tile !== 'floor' && tile !== 'stair') return;

  const queue = [{ x: startX, y: startY }];
  revealedSet.add(startKey);

  while (queue.length > 0) {
    const { x, y } = queue.shift();
    for (const { x: nx, y: ny } of getAdjacentTiles(x, y)) {
      const nk = `${nx},${ny}`;
      if (revealedSet.has(nk)) continue;
      const nt = quest.tiles[ny]?.[nx];
      // Only cross floor/stair — door tiles are boundaries between regions
      if (nt === 'floor' || nt === 'stair') {
        revealedSet.add(nk);
        queue.push({ x: nx, y: ny });
      }
    }
  }
}

// Returns a new Set extended by everything visible from (x, y).
// Landing on a door reveals the room(s) on both sides.
export function revealFromTile(quest, x, y, currentRevealed) {
  const newRevealed = new Set(currentRevealed);
  const tile = quest.tiles[y]?.[x];
  if (!isPassable(tile)) return newRevealed;

  newRevealed.add(`${x},${y}`);

  if (tile === 'door_h' || tile === 'door_v') {
    // Reveal all floor regions touching this door
    for (const { x: nx, y: ny } of getAdjacentTiles(x, y)) {
      floodFillFloor(quest, nx, ny, newRevealed);
    }
  } else {
    // Floor/stair: reveal connected region
    floodFillFloor(quest, x, y, newRevealed);
  }

  return newRevealed;
}

// Called once at game start to reveal hero spawn region (the starting corridor).
export function getInitialRevealedTiles(quest, heroSpawns) {
  const revealed = new Set();
  heroSpawns.forEach(({ x, y }) => floodFillFloor(quest, x, y, revealed));
  return revealed;
}

// Returns a canonical string identifying the floor region containing (x, y).
// Used to track which rooms have been searched for treasure.
export function getRegionKey(quest, x, y) {
  const tile = quest.tiles[y]?.[x];
  if (tile !== 'floor' && tile !== 'stair') return `${x},${y}`;
  const region = new Set();
  floodFillFloor(quest, x, y, region);
  let minX = Infinity, minY = Infinity;
  for (const key of region) {
    const [kx, ky] = key.split(',').map(Number);
    if (ky < minY || (ky === minY && kx < minX)) { minX = kx; minY = ky; }
  }
  return `${minX},${minY}`;
}

// ─── Pathfinding ─────────────────────────────────────────────────────────────

// BFS path from start to target. Returns array of steps NOT including start,
// including the target tile. Returns [] if unreachable.
// blockingPieces: pieces that cannot be entered (target piece is allowed).
// extraPassable: set of "x,y" keys passable despite being walls (revealed secret doors).
export function bfsPath(quest, startX, startY, targetX, targetY, blockingPieces, extraPassable = new Set()) {
  const targetKey = `${targetX},${targetY}`;
  const parent = new Map();
  parent.set(`${startX},${startY}`, null);
  const queue = [{ x: startX, y: startY }];

  while (queue.length > 0) {
    const curr = queue.shift();
    const currKey = `${curr.x},${curr.y}`;

    if (currKey === targetKey) {
      const path = [];
      let key = currKey;
      while (parent.get(key) !== null) {
        const [px, py] = key.split(',').map(Number);
        path.unshift({ x: px, y: py });
        key = parent.get(key);
      }
      return path;
    }

    for (const { x: nx, y: ny } of getAdjacentTiles(curr.x, curr.y)) {
      const nk = `${nx},${ny}`;
      if (parent.has(nk)) continue;
      const tile = quest.tiles[ny]?.[nx];
      if (!isPassable(tile) && !extraPassable.has(nk)) continue;
      const isTarget = nx === targetX && ny === targetY;
      if (!isTarget && blockingPieces.some(p => !p.isDead && p.x === nx && p.y === ny)) continue;
      parent.set(nk, currKey);
      queue.push({ x: nx, y: ny });
    }
  }

  return [];
}

// ─── Monster AI ──────────────────────────────────────────────────────────────

export { getEffectiveAttack, getEffectiveDefend };

// Run a full monster turn. Returns { updatedMonsters, updatedHeroes, logs }.
export function doMonsterTurn(quest, monsters, heroes, revealedTiles, buffedHeroes = new Set()) {
  let updatedMonsters = monsters.map(m => ({ ...m }));
  let updatedHeroes = heroes.map(h => ({ ...h }));
  const logs = [];

  for (let i = 0; i < updatedMonsters.length; i++) {
    const monster = updatedMonsters[i];
    // Only act if visible (tile revealed) and alive
    if (monster.isDead) continue;
    if (!revealedTiles.has(`${monster.x},${monster.y}`)) continue;

    const aliveHeroes = updatedHeroes.filter(h => !h.isDead);
    if (aliveHeroes.length === 0) break;

    const adjHeroes = getAdjacentPieces(monster.x, monster.y, aliveHeroes);

    if (adjHeroes.length > 0) {
      // Attack — target the hero with fewest Body Points, skip veiled heroes
      const attackableHeroes = adjHeroes.filter(h => !buffedHeroes.has(h.id + ':veil_of_mist'));
      if (attackableHeroes.length === 0) continue;
      const target = attackableHeroes.reduce((a, b) => a.body < b.body ? a : b);
      const attackRolls = rollDice(monster.attackDice);
      const bonusDefend = (buffedHeroes.has(target.id + ':rock_skin') ? 2 : 0) + (buffedHeroes.has(target.id + ':frost_skin') ? 2 : 0);
      const defendRolls = rollDice(getEffectiveDefend(target) + bonusDefend);
      const { damage } = resolveCombat(attackRolls, defendRolls);
      const newBody = Math.max(0, target.body - damage);
      const isDead = newBody <= 0;

      logs.push({
        text: `${monster.name} attacks ${target.name} — ${damage} damage${isDead ? ' (down!)' : ''}`,
        color: isDead ? '#c0392b' : '#e67e22',
        rolls: [...attackRolls, '|', ...defendRolls],
        time: Date.now() + i,
      });

      updatedHeroes = updatedHeroes.map(h =>
        h.id === target.id ? { ...h, body: newBody, isDead, gold: isDead ? 0 : h.gold } : h
      );
    } else {
      // Move toward nearest hero via BFS
      const blockingPieces = [
        ...updatedHeroes.filter(h => !h.isDead),
        ...updatedMonsters.filter((m, j) => j !== i && !m.isDead),
      ];

      let bestPath = null;
      let bestHero = null;

      for (const hero of aliveHeroes) {
        const path = bfsPath(quest, monster.x, monster.y, hero.x, hero.y, blockingPieces);
        if (path.length > 0 && (!bestPath || path.length < bestPath.length)) {
          bestPath = path;
          bestHero = hero;
        }
      }

      if (bestPath && bestPath.length > 1) {
        // Don't enter the hero's tile; stop one tile short.
        // Monsters move a fixed number of squares (not a dice roll).
        const moves = monster.movement;
        const stepsToTake = Math.min(moves, bestPath.length - 1);
        if (stepsToTake > 0) {
          const dest = bestPath[stepsToTake - 1];
          updatedMonsters[i] = { ...monster, x: dest.x, y: dest.y };
          logs.push({
            text: `${monster.name} moves toward ${bestHero.name}.`,
            color: '#888',
            time: Date.now() + i + 0.5,
          });
        }
      } else if (bestPath && bestPath.length === 1) {
        // Already adjacent (path is just [heroTile]) — attack next turn
      }
    }
  }

  return { updatedMonsters, updatedHeroes, logs };
}
