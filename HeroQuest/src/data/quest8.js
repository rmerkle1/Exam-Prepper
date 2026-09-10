// Quest 8: Prisoners of Zargon
// Three rooms per level with staggered connections. Rescue Captain Theron.

const W = 'wall';
const F = 'floor';
const V = 'void';
const DH = 'door_h';
const DV = 'door_v';
const ST = 'stair';

export const QUEST_8 = {
  id: 'quest_8',
  name: 'Prisoners of Zargon',
  description: "Zargon has captured Captain Theron, hero of the northern campaign. His knowledge of the fortress defenses could doom the kingdom. You must free him.",
  objective: 'Rescue Captain Theron and escape through the stairs.',
  boardWidth: 26,
  boardHeight: 19,

  victory: { type: 'rescue_and_stairs', npcId: 'captain_theron' },

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
    { id: 'captain_theron', name: 'Cpt. Theron', x: 21, y: 14, color: 0x4488ff, freed: false },
  ],

  monsters: [
    // Top-left room
    { type: 'orc',          x: 4,  y: 3,  id: 'm1' },
    { type: 'orc',          x: 6,  y: 5,  id: 'm2' },
    // Top-center room
    { type: 'chaosWarrior', x: 11, y: 3,  id: 'm3' },
    { type: 'orc',          x: 14, y: 5,  id: 'm4' },
    // Top-right room
    { type: 'chaosWarrior', x: 20, y: 3,  id: 'm5' },
    { type: 'chaosWarrior', x: 22, y: 5,  id: 'm6' },
    // Corridor
    { type: 'orc',          x: 8,  y: 8,  id: 'm7' },
    { type: 'chaosWarrior', x: 17, y: 8,  id: 'm8' },
    // Bottom-left room
    { type: 'orc',          x: 4,  y: 12, id: 'm9' },
    { type: 'orc',          x: 6,  y: 15, id: 'm10' },
    // Bottom-center room
    { type: 'chaosWarrior', x: 11, y: 13, id: 'm11' },
    { type: 'orc',          x: 14, y: 15, id: 'm12' },
    // Bottom-right room — Captain Theron's cell
    { type: 'chaosWarrior', x: 20, y: 12, id: 'm13' },
    { type: 'chaosWarrior', x: 22, y: 15, id: 'm14' },
  ],

  treasureChests: [
    { x: 3,  y: 2  },
    { x: 23, y: 2  },
    { x: 3,  y: 16 },
    { x: 23, y: 16 },
  ],

  traps: [
    { x: 7,  y: 8,  type: 'pit',   damage: 1 },
    { x: 16, y: 9,  type: 'arrow', damage: 2 },
    { x: 12, y: 14, type: 'pit',   damage: 1 },
  ],

  furniture: [
    { x: 5,  y: 4,  type: 'table'     },
    { x: 23, y: 3,  type: 'bookshelf' },
    { x: 5,  y: 14, type: 'rack'      },
    { x: 22, y: 13, type: 'fireplace' },
  ],

  secretDoors: [
    { x: 17, y: 11 }, // connects bottom-center to bottom-right
  ],

  wanderingMonsterType: 'orc',
};
