// Quest 9: The Iron Bastion
// Asymmetric layout. Dread Warriors and orcs defending a fortified dungeon.

const W = 'wall';
const F = 'floor';
const V = 'void';
const DH = 'door_h';
const DV = 'door_v';
const ST = 'stair';

export const QUEST_9 = {
  id: 'quest_9',
  name: 'The Iron Bastion',
  description: "Zargon's elite Dread Warriors have fortified this dungeon and turned it into an impenetrable stronghold. Break through their defenses.",
  objective: 'Slay all of the warriors and escape through the stairs.',
  boardWidth: 26,
  boardHeight: 19,

  victory: { type: 'kill_all_and_stairs' },

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
    // Top rooms
    { type: 'orc',          x: 3,  y: 3,  id: 'm1' },
    { type: 'orc',          x: 5,  y: 4,  id: 'm2' },
    { type: 'chaosWarrior', x: 8,  y: 3,  id: 'm3' },
    { type: 'chaosWarrior', x: 10, y: 4,  id: 'm4' },
    { type: 'orc',          x: 14, y: 3,  id: 'm5' },
    { type: 'chaosWarrior', x: 16, y: 4,  id: 'm6' },
    { type: 'chaosWarrior', x: 20, y: 3,  id: 'm7' },
    { type: 'chaosWarrior', x: 22, y: 4,  id: 'm8' },
    // Corridor
    { type: 'orc',          x: 10, y: 8,  id: 'm9' },
    { type: 'chaosWarrior', x: 18, y: 8,  id: 'm10' },
    // Bottom big room
    { type: 'chaosWarrior', x: 4,  y: 12, id: 'm11' },
    { type: 'orc',          x: 7,  y: 14, id: 'm12' },
    { type: 'chaosWarrior', x: 4,  y: 15, id: 'm13' },
    { type: 'orc',          x: 9,  y: 12, id: 'm14' },
    { type: 'orc',          x: 9,  y: 15, id: 'm15' },
    // Bottom-right room
    { type: 'chaosWarrior', x: 15, y: 13, id: 'm16' },
    { type: 'chaosWarrior', x: 18, y: 15, id: 'm17' },
    // Stair room
    { type: 'chaosWarrior', x: 22, y: 13, id: 'm18' },
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

  furniture: [
    { x: 4,  y: 5,  type: 'rack'      },
    { x: 23, y: 3,  type: 'bookshelf' },
    { x: 10, y: 15, type: 'table'     },
    { x: 22, y: 14, type: 'fireplace' },
  ],

  secretDoors: [
    { x: 12, y: 11 }, // connects big left room to center-right room
  ],

  wanderingMonsterType: 'chaosWarrior',
};
