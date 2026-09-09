// Quest 3: Lair of the Orc Warlord
// Objective: slay the Orc Warlord, then escape through the stairs.

const W = 'wall';
const F = 'floor';
const V = 'void';
const DH = 'door_h';
const DV = 'door_v';
const ST = 'stair';

export const QUEST_3 = {
  id: 'quest_3',
  name: 'Lair of the Orc Warlord',
  description: 'A powerful Orc Warlord has taken command of Zargon\'s forces in this dungeon. Mentor has tasked you with ending his reign of terror.',
  objective: 'Slay the Orc Warlord, then escape through the stairs.',
  boardWidth: 26,
  boardHeight: 19,

  victory: { type: 'kill_boss_and_stairs', bossId: 'orc_warlord_boss' },

  // prettier-ignore
  tiles: [
    [V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V],
    [V,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,V],
    [V,W,F,F,F,F,W,F,F,F,F,W,F,F,F,F,F,W,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,W,F,F,F,F,W,F,F,F,F,F,W,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,DH,F,F,F,F,DH,F,F,F,F,F,DH,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,W,F,F,F,F,W,F,F,F,F,F,W,F,F,F,F,F,F,W,V],
    [V,W,W,DV,W,W,W,W,DV,W,W,W,W,W,DV,W,W,W,W,W,DV,W,W,W,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,W,W,DV,W,W,W,W,W,W,W,W,DV,W,W,W,W,W,W,DV,W,W,W,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,W,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,W,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,DH,F,F,F,F,F,F,F,DH,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,W,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,W,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,W,ST,F,F,W,V],
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
    // Top rooms — goblin guards
    { type: 'goblin',      x: 3,  y: 3,  id: 'm1' },
    { type: 'goblin',      x: 5,  y: 4,  id: 'm2' },
    { type: 'goblin',      x: 8,  y: 3,  id: 'm3' },
    { type: 'goblin',      x: 10, y: 4,  id: 'm4' },
    { type: 'orc',         x: 14, y: 3,  id: 'm5' },
    { type: 'orc',         x: 16, y: 4,  id: 'm6' },
    { type: 'orc',         x: 20, y: 3,  id: 'm7' },
    { type: 'chaosWarrior',x: 22, y: 4,  id: 'm8' },
    // Corridor guards
    { type: 'orc',         x: 10, y: 8,  id: 'm9' },
    { type: 'orc',         x: 18, y: 8,  id: 'm10' },
    // Left bottom room
    { type: 'orc',         x: 4,  y: 12, id: 'm11' },
    { type: 'orc',         x: 7,  y: 14, id: 'm12' },
    { type: 'orc',         x: 4,  y: 15, id: 'm13' },
    // Boss room — Orc Warlord and honor guard
    { type: 'orcWarlord',  x: 16, y: 13, id: 'orc_warlord_boss' },
    { type: 'orc',         x: 14, y: 12, id: 'm14' },
    { type: 'orc',         x: 18, y: 12, id: 'm15' },
    { type: 'orc',         x: 14, y: 15, id: 'm16' },
    { type: 'orc',         x: 18, y: 15, id: 'm17' },
    // Stair room guard
    { type: 'chaosWarrior',x: 22, y: 13, id: 'm18' },
  ],

  treasureChests: [
    { x: 4,  y: 2  },
    { x: 9,  y: 4  },
    { x: 21, y: 2  },
    { x: 6,  y: 15 },
    { x: 22, y: 15 },
  ],

  traps: [
    { x: 7,  y: 8,  type: 'arrow', damage: 2 },
    { x: 16, y: 9,  type: 'pit',   damage: 1 },
    { x: 14, y: 14, type: 'arrow', damage: 2 },
  ],

  wanderingMonsterType: 'orc',
};
