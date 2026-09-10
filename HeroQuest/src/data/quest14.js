// Quest 14: Return of the Witch Lord
// The final confrontation. The Witch Lord awaits in his throne room.
// Slay him to end Zargon's reign of terror.

const W = 'wall';
const F = 'floor';
const V = 'void';
const DH = 'door_h';
const DV = 'door_v';
const ST = 'stair';

export const QUEST_14 = {
  id: 'quest_14',
  name: 'Return of the Witch Lord',
  description: "The moment of truth has arrived. Deep in the bowels of the dungeon, Zargon the Witch Lord awaits. His power grows with every passing hour. Destroy him now or all is lost.",
  objective: 'Defeat the Witch Lord and escape through the stairs.',
  boardWidth: 26,
  boardHeight: 19,

  victory: { type: 'kill_boss_and_stairs', bossId: 'witch_lord_final' },

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
    // Top-left chamber — elite guard
    { type: 'chaosWarrior', x: 4,  y: 3,  id: 'm1' },
    { type: 'gargoyle',     x: 7,  y: 4,  id: 'm2' },
    { type: 'abomination',  x: 5,  y: 5,  id: 'm3' },
    // Top-right chamber
    { type: 'gargoyle',     x: 15, y: 3,  id: 'm4' },
    { type: 'chaosWarrior', x: 20, y: 3,  id: 'm5' },
    { type: 'mummy',        x: 13, y: 4,  id: 'm6' },
    { type: 'abomination',  x: 18, y: 5,  id: 'm7' },
    // Corridor — hardened guards
    { type: 'gargoyle',     x: 9,  y: 8,  id: 'm8' },
    { type: 'chaosWarrior', x: 15, y: 8,  id: 'm9' },
    { type: 'gargoyle',     x: 21, y: 8,  id: 'm10' },
    // Bottom-left chamber
    { type: 'chaosWarrior', x: 4,  y: 12, id: 'm11' },
    { type: 'abomination',  x: 7,  y: 14, id: 'm12' },
    { type: 'mummy',        x: 4,  y: 15, id: 'm13' },
    // Bottom-right chamber — The Witch Lord's Throne Room
    { type: 'witchLord',    x: 18, y: 13, id: 'witch_lord_final' },
    { type: 'gargoyle',     x: 13, y: 12, id: 'm14' },
    { type: 'chaosWarrior', x: 13, y: 15, id: 'm15' },
    { type: 'gargoyle',     x: 22, y: 15, id: 'm16' },
    { type: 'chaosWarrior', x: 22, y: 12, id: 'm17' },
    { type: 'abomination',  x: 16, y: 15, id: 'm18' },
  ],

  treasureChests: [
    { x: 3,  y: 2  },
    { x: 22, y: 2  },
    { x: 3,  y: 16 },
    { x: 22, y: 16 },
  ],

  traps: [
    { x: 6,  y: 8,  type: 'arrow', damage: 2 },
    { x: 14, y: 8,  type: 'pit',   damage: 2 },
    { x: 17, y: 14, type: 'arrow', damage: 2 },
    { x: 7,  y: 15, type: 'pit',   damage: 1 },
  ],

  furniture: [
    { x: 3,  y: 5,  type: 'bookshelf' },
    { x: 21, y: 4,  type: 'rack'      },
    { x: 3,  y: 13, type: 'fireplace' },
    { x: 20, y: 14, type: 'throne'    },
  ],

  secretDoors: [
    { x: 10, y: 11 }, // connects bottom-left to throne room
  ],

  wanderingMonsterType: 'gargoyle',
};
