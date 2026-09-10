// Quest 12: Labyrinth of Bones
// Maze-like layout filled with undead. Mummies, skeletons, and zombies everywhere.

const W = 'wall';
const F = 'floor';
const V = 'void';
const DH = 'door_h';
const DV = 'door_v';
const ST = 'stair';

export const QUEST_12 = {
  id: 'quest_12',
  name: 'Labyrinth of Bones',
  description: "Deep below the crypt lies a labyrinthine ossuary where the restless dead patrol endless corridors. The necromantic power sustaining them must be destroyed.",
  objective: 'Destroy all undead and escape through the stairs.',
  boardWidth: 26,
  boardHeight: 19,

  victory: { type: 'kill_all_and_stairs' },

  // prettier-ignore
  tiles: [
    [V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V],
    [V,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,V],
    [V,W,F,F,F,W,F,F,F,W,F,F,F,F,F,W,F,F,F,W,F,F,F,F,W,V],
    [V,W,F,F,F,W,F,F,F,W,F,F,F,F,F,W,F,F,F,W,F,F,F,F,W,V],
    [V,W,F,F,F,DH,F,F,F,W,F,F,F,F,F,DH,F,F,F,W,F,F,F,F,W,V],
    [V,W,F,F,F,W,F,F,F,DH,F,F,F,F,F,W,F,F,F,DH,F,F,F,F,W,V],
    [V,W,W,DV,W,W,W,DV,W,W,W,W,DV,W,W,W,W,DV,W,W,W,DV,W,W,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,W,DV,W,W,W,DV,W,W,W,W,DV,W,W,W,W,DV,W,W,W,DV,W,W,W,V],
    [V,W,F,F,F,W,F,F,F,W,F,F,F,F,F,W,F,F,F,W,F,F,F,F,W,V],
    [V,W,F,F,F,W,F,F,F,W,F,F,F,F,F,W,F,F,F,W,F,F,F,F,W,V],
    [V,W,F,F,F,DH,F,F,F,W,F,F,F,F,F,DH,F,F,F,W,F,F,F,F,W,V],
    [V,W,F,F,F,W,F,F,F,DH,F,F,F,F,F,W,F,F,F,DH,F,F,F,F,W,V],
    [V,W,F,F,F,W,F,F,F,W,F,F,F,F,F,W,F,F,F,W,F,F,F,F,W,V],
    [V,W,F,F,F,W,F,F,F,W,F,F,F,F,F,W,F,F,F,W,ST,F,F,F,W,V],
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
    // Top rooms — all undead
    { type: 'zombie',   x: 3,  y: 3,  id: 'm1' },
    { type: 'skeleton', x: 7,  y: 3,  id: 'm2' },
    { type: 'skeleton', x: 8,  y: 4,  id: 'm3' },
    { type: 'mummy',    x: 12, y: 3,  id: 'm4' },
    { type: 'skeleton', x: 17, y: 3,  id: 'm5' },
    { type: 'zombie',   x: 19, y: 4,  id: 'm6' },
    { type: 'mummy',    x: 21, y: 3,  id: 'm7' },
    // Corridor roamers
    { type: 'skeleton', x: 11, y: 8,  id: 'm8' },
    { type: 'zombie',   x: 19, y: 8,  id: 'm9' },
    // Bottom rooms
    { type: 'skeleton', x: 3,  y: 12, id: 'm10' },
    { type: 'zombie',   x: 7,  y: 13, id: 'm11' },
    { type: 'mummy',    x: 12, y: 14, id: 'm12' },
    { type: 'skeleton', x: 17, y: 12, id: 'm13' },
    { type: 'mummy',    x: 21, y: 12, id: 'm14' },
    { type: 'mummy',    x: 22, y: 15, id: 'm15' },
    { type: 'zombie',   x: 22, y: 13, id: 'm16' },
  ],

  treasureChests: [
    { x: 3,  y: 2  },
    { x: 8,  y: 2  },
    { x: 21, y: 2  },
    { x: 4,  y: 15 },
    { x: 23, y: 11 },
  ],

  traps: [
    { x: 8,  y: 8,  type: 'pit',   damage: 1 },
    { x: 16, y: 9,  type: 'arrow', damage: 2 },
    { x: 13, y: 13, type: 'pit',   damage: 1 },
  ],

  furniture: [
    { x: 14, y: 2,  type: 'bookshelf' },
    { x: 23, y: 2,  type: 'rack'      },
    { x: 14, y: 16, type: 'table'     },
    { x: 23, y: 16, type: 'fireplace' },
  ],

  secretDoors: [
    { x: 5, y: 11 }, // connects lower-left rooms
  ],

  wanderingMonsterType: 'mummy',
};
