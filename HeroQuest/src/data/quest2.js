// Quest 2: The Rescue of Sir Ragnar
// Objective: free Sir Ragnar from his cell, then reach the stairs.
// Based on the classic HeroQuest quest book layout.

const W = 'wall';
const F = 'floor';
const V = 'void';
const DH = 'door_h';
const DV = 'door_v';
const ST = 'stair';

export const QUEST_2 = {
  id: 'quest_2',
  name: 'The Rescue of Sir Ragnar',
  description: 'Sir Ragnar, a brave knight, has been captured by Zargon\'s minions. You must find him in the dungeon and lead him to freedom.',
  objective: 'Find Sir Ragnar and escape through the stairs.',
  boardWidth: 26,
  boardHeight: 19,

  victory: { type: 'rescue_and_stairs', npcId: 'sir_ragnar' },

  // prettier-ignore
  tiles: [
    [V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V],
    [V,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,V],
    [V,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,W,V],
    [V,W,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,ST,F,W,V],
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

  // NPC: Sir Ragnar in the bottom-right room
  npcs: [
    { id: 'sir_ragnar', name: 'Sir Ragnar', x: 21, y: 14, color: 0xdaa520, freed: false },
  ],

  monsters: [
    // Top-left room patrols
    { type: 'goblin',        x: 4,  y: 3,  id: 'm1' },
    { type: 'goblin',        x: 7,  y: 4,  id: 'm2' },
    // Top-right room
    { type: 'orc',           x: 14, y: 3,  id: 'm3' },
    { type: 'orc',           x: 18, y: 4,  id: 'm4' },
    { type: 'skeleton', x: 22, y: 5, id: 'm5' },
    // Corridor guards
    { type: 'chaosWarrior',  x: 12, y: 8,  id: 'm6' },
    // Bottom-left room
    { type: 'skeleton', x: 4, y: 13, id: 'm7' },
    { type: 'skeleton', x: 6, y: 15, id: 'm8' },
    // Bottom-center room
    { type: 'zombie',   x: 12, y: 14, id: 'm9' },
    // Bottom-right room — guarding Sir Ragnar
    { type: 'orc',           x: 19, y: 12, id: 'm10' },
    { type: 'orc',           x: 21, y: 16, id: 'm11' },
    { type: 'chaosWarrior',  x: 20, y: 14, id: 'm12' },
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

  wanderingMonsterType: 'goblin',
};
