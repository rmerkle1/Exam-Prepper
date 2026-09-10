// Quest 13: The Gargoyle's Keep
// Four-room layout. Gargoyle Elder guards the keep. Kill it and escape.

const W = 'wall';
const F = 'floor';
const V = 'void';
const DH = 'door_h';
const DV = 'door_v';
const ST = 'stair';

export const QUEST_13 = {
  id: 'quest_13',
  name: "The Gargoyle's Keep",
  description: "A Gargoyle Elder, ancient servant of the Witch Lord, commands a garrison of stone warriors and undead. Its destruction is the only way forward.",
  objective: 'Slay the Gargoyle Elder, then escape through the stairs.',
  boardWidth: 26,
  boardHeight: 19,

  victory: { type: 'kill_boss_and_stairs', bossId: 'gargoyle_elder' },

  // prettier-ignore
  tiles: [
    [V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V],
    [V,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,V],
    [V,W,F,F,F,F,W,F,F,F,F,W,F,F,F,F,F,F,F,W,F,F,F,F,W,V],
    [V,W,F,F,F,F,W,F,F,F,F,W,F,F,F,F,F,F,F,W,F,F,F,F,W,V],
    [V,W,F,F,F,F,DH,F,F,F,F,DH,F,F,F,F,F,F,F,DH,F,F,F,F,W,V],
    [V,W,F,F,F,F,W,F,F,F,F,W,F,F,F,F,F,F,F,W,F,F,F,F,W,V],
    [V,W,W,DV,W,W,W,W,DV,W,W,W,W,W,W,DV,W,W,W,W,W,DV,W,W,W,V],
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
    // Top rooms — gargoyles and warriors
    { type: 'gargoyle',     x: 3,  y: 3,  id: 'm1' },
    { type: 'chaosWarrior', x: 5,  y: 4,  id: 'm2' },
    { type: 'gargoyle',     x: 8,  y: 3,  id: 'm3' },
    { type: 'chaosWarrior', x: 10, y: 4,  id: 'm4' },
    { type: 'chaosWarrior', x: 14, y: 3,  id: 'm5' },
    { type: 'gargoyle',     x: 16, y: 4,  id: 'm6' },
    { type: 'chaosWarrior', x: 20, y: 3,  id: 'm7' },
    { type: 'chaosWarrior', x: 22, y: 4,  id: 'm8' },
    // Corridor
    { type: 'chaosWarrior', x: 10, y: 8,  id: 'm9' },
    { type: 'gargoyle',     x: 18, y: 8,  id: 'm10' },
    // Bottom large room
    { type: 'chaosWarrior', x: 4,  y: 12, id: 'm11' },
    { type: 'chaosWarrior', x: 7,  y: 14, id: 'm12' },
    { type: 'gargoyle',     x: 4,  y: 15, id: 'm13' },
    { type: 'chaosWarrior', x: 9,  y: 12, id: 'm14' },
    { type: 'chaosWarrior', x: 9,  y: 15, id: 'm15' },
    // Boss room — Gargoyle Elder + honor guard
    { type: 'gargoyle',     x: 16, y: 13, id: 'gargoyle_elder' },
    { type: 'chaosWarrior', x: 14, y: 12, id: 'm16' },
    { type: 'chaosWarrior', x: 18, y: 12, id: 'm17' },
    { type: 'chaosWarrior', x: 14, y: 15, id: 'm18' },
    // Stair room
    { type: 'chaosWarrior', x: 22, y: 13, id: 'm19' },
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
    { x: 4,  y: 5,  type: 'bookshelf' },
    { x: 23, y: 3,  type: 'rack'      },
    { x: 10, y: 15, type: 'table'     },
    { x: 22, y: 14, type: 'throne'    },
  ],

  secretDoors: [
    { x: 12, y: 11 }, // connects big left room to boss room
  ],

  wanderingMonsterType: 'gargoyle',
};
