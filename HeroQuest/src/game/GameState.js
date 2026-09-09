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
  const shields = defendRolls.filter(r => r === 'white_shield' || r === 'black_shield').length;
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

export function getAdjacentPieces(x, y, pieces) {
  const adj = getAdjacentTiles(x, y);
  return pieces.filter(p => !p.isDead && adj.some(a => a.x === p.x && a.y === p.y));
}

export function getReachableTiles(quest, startX, startY, moves, pieces) {
  const visited = new Map();
  const queue = [{ x: startX, y: startY, movesLeft: moves }];
  visited.set(`${startX},${startY}`, moves);

  while (queue.length > 0) {
    const current = queue.shift();
    for (const neighbor of getAdjacentTiles(current.x, current.y)) {
      const key = `${neighbor.x},${neighbor.y}`;
      const movesAfter = current.movesLeft - 1;
      if (movesAfter < 0) continue;
      if (!isTileWalkable(quest, neighbor.x, neighbor.y, pieces)) continue;
      if (visited.has(key) && visited.get(key) >= movesAfter) continue;
      visited.set(key, movesAfter);
      queue.push({ x: neighbor.x, y: neighbor.y, movesLeft: movesAfter });
    }
  }

  visited.delete(`${startX},${startY}`);
  return [...visited.keys()].map(k => {
    const [x, y] = k.split(',').map(Number);
    return { x, y };
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

// ─── Pathfinding ─────────────────────────────────────────────────────────────

// BFS path from start to target. Returns array of steps NOT including start,
// including the target tile. Returns [] if unreachable.
// blockingPieces: pieces that cannot be entered (target piece is allowed).
export function bfsPath(quest, startX, startY, targetX, targetY, blockingPieces) {
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
      if (!isPassable(tile)) continue;
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
      const defendRolls = rollDice(getEffectiveDefend(target));
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
        h.id === target.id ? { ...h, body: newBody, isDead } : h
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
