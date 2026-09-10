// Quest 10: War of Chaos
// Two large top chambers, two large bottom chambers plus boss room.
// Kill the Chaos Champion to proceed.

const W = 'wall';
const F = 'floor';
const V = 'void';
const DH = 'door_h';
const DV = 'door_v';
const ST = 'stair';

export const QUEST_10 = {
  id: 'quest_10',
  name: 'War of Chaos',
  description: "A fearsome Chaos Champion commands Zargon's legions. He must be cut down before he can rally a full assault on the free lands.",
  objective: 'Slay the Chaos Champion, then escape through the stairs.',
  boardWidth: 26,
  boardHeight: 19,

  victory: { type: 'kill_boss_and_stairs', bossId: 'chaos_champion' },

  // prettier-ignore
  tiles: [
    [V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V],
    [V,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,V],
    [V,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,DH,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,W,W,DV,W,W,W,W,W,W,W,W,W,W,W,W,W,W,DV,W,W,W,W,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,W,W,DV,W,W,W,W,W,W,W,W,W,W,W,W,W,W,DV,W,W,W,W,W,V],
    [V,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,DH,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,ST,F,F,F,F,W,V],
    [V,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,V],
    [V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V],
  ],

  heroSpawns: [
    { x: 2, y: 8 },
    { x: 3, y: 8 },
    { x: 2, y: 7 },
    { x: 3, y: 7 },
  ],

  npcs: [],

  monsters: [
    // Top-left chamber
    { type: 'orc',          x: 4,  y: 3,  id: 'm1' },
    { type: 'chaosWarrior', x: 7,  y: 4,  id: 'm2' },
    // Top-right chamber
    { type: 'chaosWarrior', x: 15, y: 3,  id: 'm3' },
    { type: 'chaosWarrior', x: 20, y: 3,  id: 'm4' },
    { type: 'orc',          x: 13, y: 4,  id: 'm5' },
    // Corridor
    { type: 'orc',          x: 9,  y: 8,  id: 'm6' },
    { type: 'chaosWarrior', x: 15, y: 8,  id: 'm7' },
    // Bottom-left chamber
    { type: 'chaosWarrior', x: 4,  y: 12, id: 'm8' },
    { type: 'orc',          x: 7,  y: 14, id: 'm9' },
    // Bottom-right chamber — Chaos Champion + honor guard
    { type: 'orcWarlord',   x: 18, y: 13, id: 'chaos_champion' },
    { type: 'orc',          x: 13, y: 12, id: 'm10' },
    { type: 'chaosWarrior', x: 13, y: 15, id: 'm11' },
    { type: 'chaosWarrior', x: 22, y: 15, id: 'm12' },
    { type: 'orc',          x: 22, y: 12, id: 'm13' },
  ],

  treasureChests: [
    { x: 3,  y: 2  },
    { x: 22, y: 2  },
    { x: 3,  y: 16 },
    { x: 22, y: 16 },
  ],

  traps: [
    { x: 6,  y: 8,  type: 'pit',   damage: 1 },
    { x: 14, y: 8,  type: 'arrow', damage: 2 },
    { x: 17, y: 14, type: 'pit',   damage: 1 },
  ],

  furniture: [
    { x: 3,  y: 5,  type: 'table'     },
    { x: 21, y: 4,  type: 'bookshelf' },
    { x: 3,  y: 13, type: 'rack'      },
    { x: 21, y: 14, type: 'throne'    },
  ],

  secretDoors: [
    { x: 10, y: 11 }, // connects bottom-left to bottom-right
  ],

  wanderingMonsterType: 'chaosWarrior',
};
