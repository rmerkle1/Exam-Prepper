// Quest 11: The Lost Wizard
// Asymmetric layout. Rescue Wizard Valdrin from the gargoyle-guarded prison.

const W = 'wall';
const F = 'floor';
const V = 'void';
const DH = 'door_h';
const DV = 'door_v';
const ST = 'stair';

export const QUEST_11 = {
  id: 'quest_11',
  name: 'The Lost Wizard',
  description: "Wizard Valdrin, one of Mentor's oldest companions, has been captured. Without his knowledge the heroes cannot hope to breach the Witch Lord's inner sanctum.",
  objective: 'Find Wizard Valdrin and escape through the stairs.',
  boardWidth: 26,
  boardHeight: 19,

  victory: { type: 'rescue_and_stairs', npcId: 'wizard_valdrin' },

  // prettier-ignore
  tiles: [
    [V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V],
    [V,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,V],
    [V,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,ST,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,DH,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,W,DV,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,DV,W,W,W,W,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,W,DV,W,W,W,W,W,DV,W,W,W,W,W,W,DV,W,W,W,W,DV,W,W,W,V],
    [V,W,F,F,F,F,F,F,F,W,F,F,F,F,F,F,W,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,W,F,F,F,F,F,F,W,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,DH,F,F,F,F,F,F,DH,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,W,F,F,F,F,F,F,W,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,W,F,F,F,F,F,F,W,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,W,F,F,F,F,F,F,W,F,F,F,F,F,F,F,W,V],
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
    { id: 'wizard_valdrin', name: 'Wiz. Valdrin', x: 21, y: 14, color: 0xcc88ff, freed: false },
  ],

  monsters: [
    // Top-left room
    { type: 'abomination',  x: 4,  y: 3,  id: 'm1' },
    { type: 'skeleton',     x: 7,  y: 4,  id: 'm2' },
    // Top-right room
    { type: 'gargoyle',     x: 14, y: 3,  id: 'm3' },
    { type: 'chaosWarrior', x: 18, y: 4,  id: 'm4' },
    { type: 'skeleton',     x: 22, y: 5,  id: 'm5' },
    // Corridor guard
    { type: 'chaosWarrior', x: 12, y: 8,  id: 'm6' },
    // Bottom-left room
    { type: 'skeleton',     x: 4,  y: 13, id: 'm7' },
    { type: 'mummy',        x: 6,  y: 15, id: 'm8' },
    // Bottom-center room
    { type: 'abomination',  x: 12, y: 14, id: 'm9' },
    // Bottom-right room — guarding Wizard Valdrin
    { type: 'gargoyle',     x: 19, y: 12, id: 'm10' },
    { type: 'gargoyle',     x: 21, y: 16, id: 'm11' },
    { type: 'chaosWarrior', x: 20, y: 14, id: 'm12' },
  ],

  treasureChests: [
    { x: 7,  y: 2  },
    { x: 14, y: 5  },
    { x: 5,  y: 15 },
    { x: 23, y: 12 },
  ],

  traps: [
    { x: 5,  y: 8,  type: 'pit',   damage: 1 },
    { x: 18, y: 9,  type: 'arrow', damage: 2 },
    { x: 12, y: 14, type: 'pit',   damage: 1 },
  ],

  furniture: [
    { x: 3,  y: 4,  type: 'bookshelf' },
    { x: 21, y: 4,  type: 'table'     },
    { x: 7,  y: 16, type: 'rack'      },
    { x: 13, y: 11, type: 'fireplace' },
  ],

  secretDoors: [
    { x: 9, y: 11 }, // connects bottom-left to bottom-center
  ],

  wanderingMonsterType: 'skeleton',
};
