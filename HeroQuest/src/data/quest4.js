// Quest 4: Melar's Maze
// Objective: Navigate the labyrinthine chambers and escape through the stairs.
// Five small rooms above and below a central corridor, connected in a zigzag pattern.

const W = 'wall';
const F = 'floor';
const V = 'void';
const DH = 'door_h';
const DV = 'door_v';
const ST = 'stair';

export const QUEST_4 = {
  id: 'quest_4',
  name: "Melar's Maze",
  description: "Melar the sorcerer sealed his dungeon with an enchanted maze. Countless adventurers have perished within its twisting corridors. You must find the way through.",
  objective: 'Find your way through the maze and escape through the stairs.',
  boardWidth: 26,
  boardHeight: 19,

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
    // Top rooms — guards increase in danger left to right
    { type: 'goblin',         x: 3,  y: 3,  id: 'm1' },
    { type: 'orc',            x: 7,  y: 3,  id: 'm2' },
    { type: 'orc',            x: 12, y: 3,  id: 'm3' },
    { type: 'skeleton',x: 17, y: 3,  id: 'm4' },
    { type: 'chaosWarrior',   x: 21, y: 3,  id: 'm5' },
    // Corridor roamers
    { type: 'orc',            x: 11, y: 8,  id: 'm6' },
    { type: 'skeleton',x: 19, y: 8,  id: 'm7' },
    // Bottom rooms
    { type: 'skeleton',x: 3,  y: 12, id: 'm8' },
    { type: 'orc',            x: 7,  y: 13, id: 'm9' },
    { type: 'zombie',    x: 12, y: 14, id: 'm10'},
    { type: 'chaosWarrior',   x: 17, y: 12, id: 'm11'},
    { type: 'chaosWarrior',   x: 21, y: 12, id: 'm12'},
    { type: 'chaosWarrior',   x: 22, y: 15, id: 'm13'},
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

  wanderingMonsterType: 'skeleton',
};
