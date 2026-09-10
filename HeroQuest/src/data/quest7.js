// Quest 7: Tomb of the Undead King
// Two large top rooms, four bottom rooms. All-undead dungeon escalating in danger.

const W = 'wall';
const F = 'floor';
const V = 'void';
const DH = 'door_h';
const DV = 'door_v';
const ST = 'stair';

export const QUEST_7 = {
  id: 'quest_7',
  name: 'Tomb of the Undead King',
  description: 'An ancient necromancer has raised an army of the dead deep beneath the earth. The dead must be put to rest before they march on the surface.',
  objective: 'Slay all of the undead and escape through the stairs.',
  boardWidth: 26,
  boardHeight: 19,

  victory: { type: 'kill_all_and_stairs' },

  // prettier-ignore
  tiles: [
    [V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V],
    [V,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,DH,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,W,W,W,DV,W,W,W,W,W,W,W,W,W,W,W,W,W,DV,W,W,W,W,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,W,DV,W,W,W,W,W,DV,W,W,W,W,W,DV,W,W,W,W,W,DV,W,W,W,V],
    [V,W,F,F,F,F,F,F,W,F,F,F,F,W,F,F,F,F,F,W,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,W,F,F,F,F,W,F,F,F,F,F,W,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,DH,F,F,F,F,DH,F,F,F,F,F,DH,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,W,F,F,F,F,W,F,F,F,F,F,W,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,W,F,F,F,F,W,F,F,F,F,F,W,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,W,F,F,F,F,W,F,F,F,F,F,W,ST,F,F,F,W,V],
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
    // Top-left room
    { type: 'skeleton', x: 4,  y: 3,  id: 'm1' },
    { type: 'skeleton', x: 8,  y: 4,  id: 'm2' },
    { type: 'mummy',    x: 6,  y: 3,  id: 'm3' },
    // Top-right room
    { type: 'zombie',   x: 15, y: 3,  id: 'm4' },
    { type: 'zombie',   x: 19, y: 4,  id: 'm5' },
    { type: 'skeleton', x: 22, y: 3,  id: 'm6' },
    { type: 'mummy',    x: 17, y: 4,  id: 'm7' },
    // Corridor
    { type: 'skeleton', x: 11, y: 8,  id: 'm8' },
    { type: 'zombie',   x: 18, y: 8,  id: 'm9' },
    // Bottom room 1
    { type: 'mummy',    x: 4,  y: 13, id: 'm10' },
    { type: 'skeleton', x: 6,  y: 15, id: 'm11' },
    // Bottom room 2
    { type: 'zombie',   x: 10, y: 12, id: 'm12' },
    { type: 'skeleton', x: 11, y: 15, id: 'm13' },
    // Bottom room 3
    { type: 'mummy',    x: 16, y: 14, id: 'm14' },
    { type: 'skeleton', x: 17, y: 12, id: 'm15' },
    // Bottom room 4 — stair room
    { type: 'mummy',    x: 21, y: 12, id: 'm16' },
    { type: 'mummy',    x: 22, y: 15, id: 'm17' },
  ],

  treasureChests: [
    { x: 3,  y: 2  },
    { x: 21, y: 2  },
    { x: 4,  y: 16 },
    { x: 23, y: 16 },
  ],

  traps: [
    { x: 9,  y: 8,  type: 'pit',   damage: 1 },
    { x: 15, y: 9,  type: 'arrow', damage: 2 },
    { x: 10, y: 14, type: 'pit',   damage: 1 },
  ],

  furniture: [
    { x: 10, y: 2,  type: 'bookshelf' },
    { x: 14, y: 4,  type: 'rack'      },
    { x: 3,  y: 15, type: 'table'     },
    { x: 22, y: 13, type: 'throne'    },
  ],

  secretDoors: [
    { x: 12, y: 2 }, // connects top-left to top-right room
  ],

  wanderingMonsterType: 'zombie',
};
