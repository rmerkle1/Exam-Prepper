// Armory items — available for purchase between quests.
//
// Item properties:
// slot: 'weapon'|'ranged'|'armour'|'shield'|'helmet'|'bracers'|'cloak'|'boots'|'headband'|null
// attackBonus: adds to melee attack dice (slot:'ranged' items excluded from melee)
// defendBonus: adds to defend dice
// diagonal: hero attacks all 8 surrounding squares instead of 4
// ranged: bool — has ranged attack (LOS, same row/column)
// crossbow: bool — ranged only, cannot attack adjacent squares
// noShield: bool — shield defend bonus negated while this weapon is equipped
// movementDice: number — replace 2d6 movement with Nd6
// movementPenalty: number — subtract from movement roll
// movementBonus: number — permanent addition to movement roll
// forbiddenHeroes: heroId[] — heroes that cannot equip this item
// incompatibleWith: itemId[] — items that cannot be equipped simultaneously
// isHolyWater, isToolKit, throwable: special-use flags
// usable, healBody, healMind, buffKey: potion/consumable fields

// ─── Original Armory (from HeroQuest rulebook) ───────────────────────────────

export const ORIGINAL_ARMORY_ITEMS = [
  // ── Weapons ────────────────────────────────────────────────────────────────
  { id: 'dagger',      name: 'Dagger',      category: 'weapon', cost:  25, slot: 'weapon', attackBonus: 1, throwable: true,             desc: '+1 attack die. Can be thrown at any visible monster (lost after throw).' },
  { id: 'rapier',      name: 'Rapier',      category: 'weapon', cost: 250, slot: 'weapon', attackBonus: 2, diagonal: true,              desc: '+2 attack dice. May attack diagonally.', forbiddenHeroes: ['wizard'] },
  { id: 'shortsword',  name: 'Short Sword', category: 'weapon', cost: 150, slot: 'weapon', attackBonus: 2,                              desc: '+2 attack dice.', forbiddenHeroes: ['wizard'] },
  { id: 'broadsword',  name: 'Broad Sword', category: 'weapon', cost: 250, slot: 'weapon', attackBonus: 3,                              desc: '+3 attack dice.', forbiddenHeroes: ['wizard'] },
  { id: 'longsword',   name: 'Long Sword',  category: 'weapon', cost: 350, slot: 'weapon', attackBonus: 3, diagonal: true,              desc: '+3 attack dice. May attack diagonally.', forbiddenHeroes: ['wizard'] },
  { id: 'handaxe',     name: 'Hand Axe',    category: 'weapon', cost: 200, slot: 'weapon', attackBonus: 2, throwable: true,             desc: '+2 attack dice. Can be thrown at any visible monster (lost after throw).' },
  { id: 'battle_axe',  name: 'Battle Axe',  category: 'weapon', cost: 450, slot: 'weapon', attackBonus: 4, noShield: true,             desc: '+4 attack dice. Cannot use a shield.', forbiddenHeroes: ['wizard'] },
  { id: 'staff',       name: 'Staff',       category: 'weapon', cost: 100, slot: 'weapon', attackBonus: 1, diagonal: true, noShield: true, desc: '+1 attack die. May attack diagonally. Cannot use a shield.' },
  { id: 'armory_wand', name: 'Wand',        category: 'weapon', cost: 125, slot: 'ranged', attackBonus: 2, ranged: true,               desc: '+2 attack dice vs any visible monster.', forbiddenHeroes: ['barbarian', 'dwarf', 'elf'] },
  { id: 'crossbow',    name: 'Crossbow',    category: 'weapon', cost: 350, slot: 'ranged', attackBonus: 3, ranged: true, crossbow: true, desc: '+3 attack dice. Ranged — may not fire at adjacent monsters.', forbiddenHeroes: ['wizard'] },

  // ── Armour ─────────────────────────────────────────────────────────────────
  { id: 'helmet',     name: 'Helmet',    category: 'armour', cost: 125, slot: 'helmet',  defendBonus: 1,                          desc: '+1 defend die.', forbiddenHeroes: ['wizard'] },
  { id: 'shield',     name: 'Shield',    category: 'armour', cost: 150, slot: 'shield',  defendBonus: 1,                          desc: '+1 defend die. Cannot be used with Battle Axe or Staff.', forbiddenHeroes: ['wizard'] },
  { id: 'bracers',    name: 'Bracers',   category: 'armour', cost: 550, slot: 'bracers', defendBonus: 1,                          desc: '+1 defend die. May be combined with helmet and/or shield.' },
  { id: 'chain_mail', name: 'Chain Mail',category: 'armour', cost: 500, slot: 'armour',  defendBonus: 1,                          desc: '+1 defend die. May be combined with helmet and/or shield.', forbiddenHeroes: ['wizard'] },
  { id: 'plate_mail', name: 'Plate Mail',category: 'armour', cost: 850, slot: 'armour',  defendBonus: 2, movementDice: 1,         desc: '+2 defend dice. Movement reduced to 1 die. May be combined with helmet and/or shield.', forbiddenHeroes: ['wizard'], replaces: 'chain_mail' },

  // ── Other ───────────────────────────────────────────────────────────────────
  { id: 'holy_water', name: 'Holy Water', category: 'usable', cost: 400, slot: null, usable: true, isHolyWater: true, desc: 'Destroys one undead monster instantly (skeleton, zombie, mummy). Lost after use.' },
  { id: 'tool_kit',   name: 'Tool Kit',   category: 'tool',   cost: 250, slot: null, isToolKit: true,                 desc: 'Roll 1 combat die — if no skull, disarm a found trap. Any hero may use this.' },
];

// ─── Expanded Armory (from expanded ruleset) ─────────────────────────────────

export const EXPANDED_ARMORY_ITEMS = [
  // ── Melee Weapons ──────────────────────────────────────────────────────────
  { id: 'dagger',       name: 'Dagger',       category: 'weapon', cost:  25, slot: 'weapon', attackBonus: 1, throwable: true,             desc: '+1 attack die. Can be thrown at any visible monster (lost after throw).' },
  { id: 'club',         name: 'Club',         category: 'weapon', cost: 150, slot: 'weapon', attackBonus: 2, noShield: true,             desc: '+2 attack dice. Cannot use a shield.' },
  { id: 'whip',         name: 'Whip',         category: 'weapon', cost: 125, slot: 'weapon', attackBonus: 1, diagonal: true, noShield: true, desc: '+1 attack die. May attack diagonally. Cannot use a shield.', forbiddenHeroes: ['wizard'] },
  { id: 'shortsword',   name: 'Short Sword',  category: 'weapon', cost: 200, slot: 'weapon', attackBonus: 2,                              desc: '+2 attack dice.', forbiddenHeroes: ['wizard'] },
  { id: 'staff',        name: 'Staff',        category: 'weapon', cost: 100, slot: 'weapon', attackBonus: 1, diagonal: true, noShield: true, desc: '+1 attack die. May attack diagonally. Cannot use a shield.', forbiddenHeroes: ['wizard'] },
  { id: 'spear',        name: 'Spear',        category: 'weapon', cost: 225, slot: 'weapon', attackBonus: 2, throwable: true, diagonal: true, desc: '+2 attack dice. May attack diagonally. Can be thrown (lost).' },
  { id: 'handaxe',      name: 'Hand Axe',     category: 'weapon', cost: 225, slot: 'weapon', attackBonus: 2, throwable: true,             desc: '+2 attack dice. Can be thrown at any visible monster (lost after throw).', forbiddenHeroes: ['wizard'] },
  { id: 'flail',        name: 'Flail',        category: 'weapon', cost: 250, slot: 'weapon', attackBonus: 2, diagonal: true, noShield: true, desc: '+2 attack dice. May attack diagonally. Cannot use a shield.', forbiddenHeroes: ['wizard'] },
  { id: 'mace',         name: 'Mace',         category: 'weapon', cost: 250, slot: 'weapon', attackBonus: 3, noShield: true,             desc: '+3 attack dice. Cannot use a shield.', forbiddenHeroes: ['wizard'] },
  { id: 'broadsword',   name: 'Broad Sword',  category: 'weapon', cost: 300, slot: 'weapon', attackBonus: 3,                              desc: '+3 attack dice.', forbiddenHeroes: ['wizard'] },
  { id: 'halberd',      name: 'Halberd',      category: 'weapon', cost: 350, slot: 'weapon', attackBonus: 3, diagonal: true, noShield: true, desc: '+3 attack dice. May attack diagonally. Cannot use a shield.', forbiddenHeroes: ['wizard'] },
  { id: 'longsword',    name: 'Long Sword',   category: 'weapon', cost: 375, slot: 'weapon', attackBonus: 3, diagonal: true,              desc: '+3 attack dice. May attack diagonally.', forbiddenHeroes: ['wizard'] },
  { id: 'battle_axe',   name: 'Battle Axe',   category: 'weapon', cost: 475, slot: 'weapon', attackBonus: 4, noShield: true,             desc: '+4 attack dice. Cannot use a shield.', forbiddenHeroes: ['wizard'] },
  { id: 'greatsword',   name: 'Greatsword',   category: 'weapon', cost: 550, slot: 'weapon', attackBonus: 4, diagonal: true, noShield: true, desc: '+4 attack dice. May attack diagonally. Cannot use a shield.', forbiddenHeroes: ['wizard'] },
  { id: 'war_hammer',   name: 'War Hammer',   category: 'weapon', cost: 750, slot: 'weapon', attackBonus: 4, noShield: true, movementPenalty: 1, desc: '+4 attack dice. Cannot use a shield. −1 to movement each turn.', forbiddenHeroes: ['wizard'] },
  { id: 'torch',        name: 'Torch',        category: 'weapon', cost: 100, slot: 'weapon', attackBonus: 2, throwable: true,             desc: '+2 attack dice. Can be thrown (lost). Undead cannot defend against fire.' },

  // ── Ranged Weapons ─────────────────────────────────────────────────────────
  { id: 'sling',         name: 'Sling',          category: 'weapon', cost: 150, slot: 'ranged', attackBonus: 1, ranged: true,              desc: '+1 attack die. Ranged — fire at any visible monster.', forbiddenHeroes: ['wizard'] },
  { id: 'shortbow',      name: 'Short Bow',       category: 'weapon', cost: 275, slot: 'ranged', attackBonus: 2, ranged: true,              desc: '+2 attack dice. Ranged — fire at any visible monster.', forbiddenHeroes: ['wizard'] },
  { id: 'crossbow',      name: 'Crossbow',        category: 'weapon', cost: 425, slot: 'ranged', attackBonus: 3, ranged: true, crossbow: true, desc: '+3 attack dice. Ranged — may not fire at adjacent monsters.', forbiddenHeroes: ['wizard'] },
  { id: 'longbow',       name: 'Long Bow',        category: 'weapon', cost: 550, slot: 'ranged', attackBonus: 3, ranged: true, crossbow: true, desc: '+3 attack dice. Ranged — long range, may not fire at adjacent monsters.', forbiddenHeroes: ['wizard'] },
  { id: 'horn_blasting', name: 'Horn of Blasting',category: 'weapon', cost: 350, slot: 'ranged', attackBonus: 2, ranged: true,              desc: '+2 attack dice. Ranged — fire at any visible monster.', forbiddenHeroes: ['wizard'] },

  // ── Armour ─────────────────────────────────────────────────────────────────
  { id: 'helmet',             name: 'Helmet',             category: 'armour', cost: 125, slot: 'helmet',   defendBonus: 1,                                        desc: '+1 defend die.', forbiddenHeroes: ['wizard'], incompatibleWith: ['headband_def'] },
  { id: 'headband_def',       name: 'Headband of Defense',category: 'armour', cost: 200, slot: 'headband', defendBonus: 1,                                        desc: '+1 defend die. Cannot be combined with Helmet.', incompatibleWith: ['helmet'] },
  { id: 'shield',             name: 'Shield',             category: 'armour', cost: 150, slot: 'shield',   defendBonus: 1,                                        desc: '+1 defend die. Cannot be used with Battle Axe, Staff, Greatsword, etc.', forbiddenHeroes: ['wizard'] },
  { id: 'chain_mail',         name: 'Chain Mail',         category: 'armour', cost: 500, slot: 'armour',   defendBonus: 1,                                        desc: '+1 defend die.', forbiddenHeroes: ['wizard'], incompatibleWith: ['cloak_protection'] },
  { id: 'plate_mail',         name: 'Plate Mail',         category: 'armour', cost: 800, slot: 'armour',   defendBonus: 2, movementPenalty: 1,                    desc: '+2 defend dice. −1 to movement each turn.', forbiddenHeroes: ['wizard'], replaces: 'chain_mail', incompatibleWith: ['cloak_protection'] },
  { id: 'cloak_protection',   name: 'Cloak of Protection',category: 'armour', cost: 550, slot: 'cloak',    defendBonus: 1,                                        desc: '+1 defend die. Cannot be combined with Chain Mail or Plate Mail.', forbiddenHeroes: ['wizard'], incompatibleWith: ['chain_mail', 'plate_mail'] },
  { id: 'boots_speed',        name: 'Boots of Speed',     category: 'armour', cost: 325, slot: 'boots',    movementBonus: 3,                                      desc: '+3 squares added to movement roll each turn.' },

  // ── Potions ─────────────────────────────────────────────────────────────────
  { id: 'pot_refreshment', name: 'Potion of Refreshment', category: 'potion', cost: 100, slot: null, usable: true, healBody: 1, healMind: 1, desc: 'Restore 1 Body Point and 1 Mind Point. (Free action)' },
  { id: 'pot_dexterity',   name: 'Potion of Dexterity',   category: 'potion', cost:  50, slot: null, usable: true, buffKey: 'dexterity',   desc: 'Add 6 squares to your movement this turn. (Free action)' },
  { id: 'pot_fire_rage',   name: 'Potion of Fire Rage',   category: 'potion', cost: 200, slot: null, usable: true, buffKey: 'fire_rage',   desc: '+2 attack dice for your next attack this turn. (Free action)' },
  { id: 'pot_frost_skin',  name: 'Potion of Frost Skin',  category: 'potion', cost: 100, slot: null, usable: true, buffKey: 'frost_skin',  desc: '+2 defend dice until end of this turn. (Free action)' },
  { id: 'pot_recall',      name: 'Potion of Recall',      category: 'potion', cost: 200, slot: null, usable: true, isWand: true,          desc: 'Restore one spent spell so it can be cast again. (Free action)' },

  // ── Other ───────────────────────────────────────────────────────────────────
  { id: 'tool_kit', name: 'Tool Kit', category: 'tool', cost: 200, slot: null, isToolKit: true, desc: 'Roll 1 combat die — if no skull, disarm a found trap. Any hero may use this.' },
];

// ─── Effective stats ─────────────────────────────────────────────────────────

export function getEffectiveAttack(hero) {
  // Melee attack: excludes ranged-slot weapons
  return hero.attackDice + (hero.equipment || [])
    .filter(e => e.slot !== 'ranged')
    .reduce((s, e) => s + (e.attackBonus || 0), 0);
}

export function getEffectiveRangedAttack(hero) {
  const rangedWeapon = (hero.equipment || []).find(e => e.slot === 'ranged' && e.ranged);
  if (!rangedWeapon) return 0;
  return hero.attackDice + (rangedWeapon.attackBonus || 0);
}

export function getEffectiveDefend(hero) {
  const weaponNoShield = (hero.equipment || []).some(e => e.noShield && (e.slot === 'weapon'));
  return hero.defendDice + (hero.equipment || []).reduce((s, e) => {
    if (e.slot === 'shield' && weaponNoShield) return s; // shield negated by current weapon
    return s + (e.defendBonus || 0);
  }, 0);
}

// ─── Buy ─────────────────────────────────────────────────────────────────────

export function buyItem(hero, item) {
  if (hero.gold < item.cost) return { error: 'Not enough gold.' };
  if (item.forbiddenHeroes?.includes(hero.heroId)) return { error: `${hero.name} cannot use this item.` };

  const owned = hero.equipment || [];

  // Slot conflict
  if (item.slot) {
    const replaced = Array.isArray(item.replaces) ? item.replaces : item.replaces ? [item.replaces] : [];
    const hasSlot = owned.some(e => e.slot === item.slot && !replaced.includes(e.id));
    if (hasSlot) return { error: 'Already have an item in that slot.' };
  }

  // Already owned
  if (owned.some(e => e.id === item.id)) return { error: 'Already owned.' };

  // Incompatibility check (bidirectional)
  if (item.incompatibleWith?.some(id => owned.some(e => e.id === id))) {
    return { error: `Cannot combine with existing equipment.` };
  }
  for (const e of owned) {
    if (e.incompatibleWith?.includes(item.id)) return { error: `Cannot combine with ${e.name}.` };
  }

  const replaced = Array.isArray(item.replaces) ? item.replaces : item.replaces ? [item.replaces] : [];
  const filteredEquip = owned.filter(e => !replaced.includes(e.id));

  return {
    updatedHero: {
      ...hero,
      gold: hero.gold - item.cost,
      equipment: [...filteredEquip, item],
    },
  };
}
