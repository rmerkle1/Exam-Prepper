// HeroQuest treasure deck — drawn when a hero successfully searches for treasure.
// Wandering monster card makes Zargon place a monster; we spawn one at a random corridor tile.

export const TREASURE_CARDS = [
  // Gold
  { id: 'gold_10_a',   type: 'gold',     label: '10 Gold Coins',     gold: 10,  count: 3 },
  { id: 'gold_20_a',   type: 'gold',     label: '20 Gold Coins',     gold: 20,  count: 2 },
  { id: 'gold_50_a',   type: 'gold',     label: '50 Gold Coins',     gold: 50,  count: 1 },
  // Potions
  { id: 'healing_a',   type: 'potion',   label: 'Healing Potion',    heal: 4,   healType: 'body',  count: 2 },
  { id: 'healing_b',   type: 'potion',   label: 'Healing Potion',    heal: 4,   healType: 'body',  count: 2 },
  { id: 'spirit_a',    type: 'potion',   label: 'Spirit Dram',       heal: 1,   healType: 'mind',  count: 1 },
  // Equipment
  { id: 'holy_water',  type: 'item',     label: 'Holy Water',        desc: 'Destroys one undead monster instantly.', count: 1 },
  { id: 'wand',        type: 'item',     label: 'Wand of Magic',     desc: 'Cast any one spell you know once more.', count: 1 },
  // Wandering monster
  { id: 'wandering_a', type: 'monster',  label: 'Wandering Monster!', count: 2 },
  { id: 'wandering_b', type: 'monster',  label: 'Wandering Monster!', count: 1 },
  // Traps inside treasure
  { id: 'trap_dart',   type: 'trap',     label: 'Dart Trap!',        damage: 1, count: 1 },
  { id: 'trap_rock',   type: 'trap',     label: 'Rockfall!',         damage: 2, count: 1 },
];

export function buildShuffledDeck() {
  const deck = [];
  for (const card of TREASURE_CARDS) {
    for (let i = 0; i < card.count; i++) {
      deck.push({ ...card });
    }
  }
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
