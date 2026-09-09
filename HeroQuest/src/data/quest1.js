// Quest 1: The Trial
// Board is 26 cols x 19 rows (matching original HeroQuest)
// Tile types: 'floor', 'wall', 'void', 'door_h', 'door_v', 'stair'

const W = 'wall';
const F = 'floor';
const V = 'void';
const DH = 'door_h';  // door on horizontal wall (opens north/south)
const DV = 'door_v';  // door on vertical wall (opens east/west)
const ST = 'stair';

// 26 columns (x) x 19 rows (y)
// Row 0 = top of board
export const QUEST_1 = {
  id: 'quest_1',
  name: 'The Trial',
  description: 'Zargon the Witch Lord threatens the land. Mentor sends you into the dungeons beneath the old fortress to begin your training.',
  objective: 'Find and kill all of the monsters, then escape through the stairs.',
  boardWidth: 26,
  boardHeight: 19,

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
    [V,W,W,DV,W,W,W,W,DV,W,W,W,W,W,W,DV,W,W,W,W,W,DV,W,W,W,V],
    [V,W,F,F,F,F,W,F,F,F,F,W,F,F,F,F,F,F,F,W,F,F,F,F,W,V],
    [V,W,F,F,F,F,W,F,F,F,F,W,F,F,F,F,F,F,F,W,F,F,F,F,W,V],
    [V,W,F,F,F,F,DH,F,F,F,F,DH,F,F,F,F,F,F,F,DH,F,F,F,F,W,V],
    [V,W,F,F,F,F,W,F,F,F,F,W,F,F,F,F,F,F,F,W,F,F,F,F,W,V],
    [V,W,F,F,F,F,W,F,F,F,F,W,F,F,F,F,F,F,F,W,F,F,F,F,W,V],
    [V,W,F,F,F,F,W,F,F,F,F,W,F,F,F,F,F,F,F,W,ST,F,F,F,W,V],
    [V,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,V],
    [V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V],
  ],

  // Hero starting positions (top-left corridor entrance)
  heroSpawns: [
    { x: 2, y: 8 },
    { x: 2, y: 9 },
    { x: 3, y: 8 },
    { x: 3, y: 9 },
  ],

  // Monsters placed face-down until room is revealed
  monsters: [
    { type: 'goblin',         x: 9,  y: 3,  id: 'm1' },
    { type: 'goblin',         x: 10, y: 4,  id: 'm2' },
    { type: 'orc',            x: 22, y: 4,  id: 'm3' },
    { type: 'orc',            x: 22, y: 3,  id: 'm4' },
    { type: 'goblin',         x: 9,  y: 14, id: 'm5' },
    { type: 'goblin',         x: 10, y: 15, id: 'm6' },
    { type: 'skeleton',x: 22, y: 14, id: 'm7' },
    { type: 'skeleton',x: 22, y: 15, id: 'm8' },
    { type: 'chaosWarrior',   x: 14, y: 8,  id: 'm9' },
    { type: 'chaosWarrior',   x: 15, y: 9,  id: 'm10'},
  ],

  // Treasure chest locations
  treasureChests: [
    { x: 4,  y: 3  },
    { x: 4,  y: 14 },
    { x: 21, y: 3  },
    { x: 21, y: 14 },
  ],

  // Trap locations (hidden until stepped on or found)
  traps: [
    { x: 9,  y: 8,  type: 'pit',    damage: 1 },
    { x: 16, y: 9,  type: 'arrow',  damage: 2 },
  ],

  furniture: [
    { x: 3,  y: 2,  type: 'bookshelf' },
    { x: 23, y: 2,  type: 'rack'      },
    { x: 3,  y: 16, type: 'table'     },
    { x: 23, y: 16, type: 'fireplace' },
  ],

  // Hidden passages in walls. Heroes search adjacent walls to find them.
  secretDoors: [
    { x: 6, y: 2 }, // connects top-left room to top-center room
  ],

  wanderingMonsterType: 'goblin',
};
