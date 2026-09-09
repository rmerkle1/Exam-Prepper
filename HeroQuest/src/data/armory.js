// Armory items — available for purchase between quests.
// Each hero can only own one of each item. Weapons/armors are "worn" (passive bonus).
// Potions are one-use consumables stored in equipment and used as an action.

export const ARMORY_ITEMS = [
  // ── Weapons ──────────────────────────────────────────────────────────
  {
    id: 'shortsword',
    name: 'Short Sword',
    category: 'weapon',
    cost: 50,
    attackBonus: 1,
    defendBonus: 0,
    desc: '+1 attack die',
    slot: 'weapon',
  },
  {
    id: 'longsword',
    name: 'Long Sword',
    category: 'weapon',
    cost: 150,
    attackBonus: 2,
    defendBonus: 0,
    desc: '+2 attack dice',
    slot: 'weapon',
    replaces: 'shortsword',
  },
  {
    id: 'broadsword',
    name: 'Broad Sword',
    category: 'weapon',
    cost: 300,
    attackBonus: 3,
    defendBonus: 0,
    desc: '+3 attack dice',
    slot: 'weapon',
    replaces: ['shortsword', 'longsword'],
  },
  {
    id: 'crossbow',
    name: 'Crossbow',
    category: 'weapon',
    cost: 150,
    attackBonus: 2,
    defendBonus: 0,
    desc: '+2 attack dice (ranged)',
    slot: 'ranged',
  },

  // ── Armour ───────────────────────────────────────────────────────────
  {
    id: 'chain_mail',
    name: 'Chain Mail',
    category: 'armour',
    cost: 100,
    attackBonus: 0,
    defendBonus: 1,
    desc: '+1 defense die',
    slot: 'armour',
  },
  {
    id: 'plate_mail',
    name: 'Plate Mail',
    category: 'armour',
    cost: 350,
    attackBonus: 0,
    defendBonus: 2,
    desc: '+2 defense dice',
    slot: 'armour',
    replaces: 'chain_mail',
  },
  {
    id: 'shield',
    name: 'Shield',
    category: 'armour',
    cost: 75,
    attackBonus: 0,
    defendBonus: 1,
    desc: '+1 defense die',
    slot: 'shield',
  },
  {
    id: 'helmet',
    name: 'Helmet',
    category: 'armour',
    cost: 50,
    attackBonus: 0,
    defendBonus: 1,
    desc: '+1 defense die',
    slot: 'helmet',
  },

  // ── Potions ───────────────────────────────────────────────────────────
  {
    id: 'healing_potion',
    name: 'Healing Potion',
    category: 'potion',
    cost: 100,
    usable: true,
    healBody: 4,
    desc: 'Restore 4 Body Points (use as action)',
    slot: null,   // stackable
  },
  {
    id: 'spirit_dram',
    name: 'Spirit Dram',
    category: 'potion',
    cost: 150,
    usable: true,
    healMind: 1,
    desc: 'Restore 1 Mind Point (use as action)',
    slot: null,
  },
];

export function getEffectiveAttack(hero) {
  return hero.attackDice + (hero.equipment || []).reduce((s, e) => s + (e.attackBonus || 0), 0);
}

export function getEffectiveDefend(hero) {
  return hero.defendDice + (hero.equipment || []).reduce((s, e) => s + (e.defendBonus || 0), 0);
}

// Buy an item for a hero. Returns { updatedHero, error }.
export function buyItem(hero, item) {
  if (hero.gold < item.cost) return { error: 'Not enough gold.' };

  // Check slot conflict for slotted items
  if (item.slot) {
    const hasSlot = (hero.equipment || []).some(e => e.slot === item.slot && !item.replaces?.includes?.(e.id) && item.replaces !== e.id);
    if (hasSlot) return { error: 'Already have an item in that slot.' };
  }

  // Check already owns this exact item
  if ((hero.equipment || []).some(e => e.id === item.id)) return { error: 'Already owned.' };

  // Remove items this one replaces
  const replaced = Array.isArray(item.replaces) ? item.replaces : item.replaces ? [item.replaces] : [];
  const filteredEquip = (hero.equipment || []).filter(e => !replaced.includes(e.id));

  return {
    updatedHero: {
      ...hero,
      gold: hero.gold - item.cost,
      equipment: [...filteredEquip, item],
    },
  };
}
