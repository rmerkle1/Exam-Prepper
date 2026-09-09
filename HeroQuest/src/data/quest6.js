// Quest 6: Legacy of the Witch Lord
// Objective: Free Brother Gnoblar from his prison, then escape through the stairs.
// Three wide chambers on each level. The prisoner is held deep in the right wing.

const W = 'wall';
const F = 'floor';
const V = 'void';
const DH = 'door_h';
const DV = 'door_v';
const ST = 'stair';

export const QUEST_6 = {
  id: 'quest_6',
  name: 'Legacy of the Witch Lord',
  description: "Brother Gnoblar, keeper of the sacred flame, has been taken prisoner by Zargon's forces. Mentor urges you to rescue him before the knowledge he carries is lost forever.",
  objective: 'Free Brother Gnoblar and escape through the stairs.',
  boardWidth: 26,
  boardHeight: 19,

  victory: { type: 'rescue_and_stairs', npcId: 'brother_gnoblar' },

  // prettier-ignore
  tiles: [
    [V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V],
    [V,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,V],
    [V,W,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,DH,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,DH,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,W,V],
    [V,W,W,W,DV,W,W,W,W,W,W,W,DV,W,W,W,W,W,W,W,DV,W,W,W,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,W,W,DV,W,W,W,W,W,W,W,DV,W,W,W,W,W,W,W,DV,W,W,W,W,V],
    [V,W,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,DH,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,DH,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,W,F,F,F,ST,F,F,W,V],
    [V,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,V],
    [V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V],
  ],

  heroSpawns: [
    { x: 2, y: 8 },
    { x: 3, y: 8 },
    { x: 2, y: 7 },
    { x: 3, y: 7 },
  ],

  npcs: [
    { id: 'brother_gnoblar', name: 'Brother Gnoblar', x: 22, y: 13, color: 0x66ccff, freed: false },
  ],

  monsters: [
    // Top-left chamber
    { type: 'chaosWarrior',   x: 4,  y: 3,  id: 'm1' },
    { type: 'skeleton',x: 6,  y: 4,  id: 'm2' },
    // Top-center chamber
    { type: 'chaosWarrior',   x: 12, y: 3,  id: 'm3' },
    { type: 'orc',            x: 15, y: 4,  id: 'm4' },
    // Top-right chamber
    { type: 'gargoyle',       x: 21, y: 3,  id: 'm5' },
    { type: 'chaosWarrior',   x: 20, y: 4,  id: 'm6' },
    // Corridor
    { type: 'chaosWarrior',   x: 9,  y: 8,  id: 'm7' },
    { type: 'skeleton',x: 17, y: 8,  id: 'm8' },
    // Bottom-left chamber
    { type: 'chaosWarrior',   x: 4,  y: 13, id: 'm9' },
    { type: 'zombie',    x: 5,  y: 15, id: 'm10'},
    // Bottom-center chamber
    { type: 'chaosWarrior',   x: 11, y: 13, id: 'm11'},
    { type: 'chaosWarrior',   x: 15, y: 13, id: 'm12'},
    // Bottom-right chamber — guards the prisoner
    { type: 'chaosWarrior',   x: 20, y: 12, id: 'm13'},
    { type: 'gargoyle',       x: 21, y: 14, id: 'm14'},
  ],

  treasureChests: [
    { x: 3,  y: 2  },
    { x: 16, y: 2  },
    { x: 23, y: 2  },
    { x: 3,  y: 16 },
    { x: 22, y: 16 },
  ],

  traps: [
    { x: 7,  y: 8,  type: 'pit',   damage: 1 },
    { x: 15, y: 8,  type: 'arrow', damage: 2 },
    { x: 19, y: 13, type: 'pit',   damage: 1 },
  ],

  furniture: [
    { x: 5,  y: 2,  type: 'table'     },
    { x: 10, y: 4,  type: 'bookshelf' },
    { x: 23, y: 5,  type: 'rack'      },
    { x: 3,  y: 16, type: 'fireplace' },
  ],

  secretDoors: [
    { x: 8, y: 11 }, // connects bottom-left room to bottom-center room
  ],

  wanderingMonsterType: 'gargoyle',
};
