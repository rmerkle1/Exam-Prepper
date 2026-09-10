// Spells available to Elf and Wizard.
// Each spell is one-use per quest (tracked in game state via usedSpells Set).
// 'targeting' values: 'none' | 'enemy' | 'ally' | 'tile' | 'self'

export const SPELLS = {
  // ── Air Spells (Elf + Wizard) ────────────────────────────────────────
  swift_wind: {
    id: 'swift_wind',
    name: 'Swift Wind',
    school: 'air',
    targeting: 'self',
    desc: 'Move up to 12 squares this turn instead of rolling.',
    icon: '💨',
  },
  veil_of_mist: {
    id: 'veil_of_mist',
    name: 'Veil of Mist',
    school: 'air',
    targeting: 'self',
    desc: 'Until your next turn, monsters cannot attack you.',
    icon: '🌫️',
  },
  courage: {
    id: 'courage',
    name: 'Courage',
    school: 'air',
    targeting: 'ally',
    desc: 'Restore 1 Mind Point to a hero within 5 squares.',
    icon: '✨',
    healMind: 1,
    range: 5,
  },
  pass_through_rock: {
    id: 'pass_through_rock',
    name: 'Pass Through Rock',
    school: 'air',
    targeting: 'self',
    desc: 'Walk through walls until the end of your turn.',
    icon: '🪨',
  },

  // ── Fire Spells (Wizard only) ────────────────────────────────────────
  ball_of_flame: {
    id: 'ball_of_flame',
    name: 'Ball of Flame',
    school: 'fire',
    targeting: 'enemy',
    desc: 'Attack one visible monster with 4 combat dice (no defense roll).',
    icon: '🔥',
    attackDice: 4,
    noDefend: true,
  },
  fire_of_wrath: {
    id: 'fire_of_wrath',
    name: 'Fire of Wrath',
    school: 'fire',
    targeting: 'enemy',
    desc: 'Attack all monsters in one room with 2 dice each.',
    icon: '🌋',
    attackDice: 2,
    areaRoom: true,
  },
  rock_skin: {
    id: 'rock_skin',
    name: 'Rock Skin',
    school: 'earth',
    targeting: 'self',
    desc: 'Add 2 defense dice for the rest of this turn.',
    icon: '🛡️',
    bonusDefend: 2,
  },
  genie: {
    id: 'genie',
    name: 'Genie',
    school: 'earth',
    targeting: 'self',
    desc: 'Wish for any one item from the Armory for free.',
    icon: '🧞',
  },
  tempest: {
    id: 'tempest',
    name: 'Tempest',
    school: 'air',
    targeting: 'none',
    desc: 'All monsters in the dungeon are stunned for 1 turn.',
    icon: '⛈️',
  },
  cloud_of_chaos: {
    id: 'cloud_of_chaos',
    name: 'Cloud of Chaos',
    school: 'air',
    targeting: 'enemy',
    desc: 'One monster loses 2 Body Points with no defense roll.',
    icon: '💜',
    directDamage: 2,
  },
};
