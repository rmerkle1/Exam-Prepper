import { useState, useCallback, useEffect, useRef } from 'react';
import GameBoard from './components/GameBoard.jsx';
import HeroPanel from './components/HeroPanel.jsx';
import CombatLog from './components/CombatLog.jsx';
import DiceRoller from './components/DiceRoller.jsx';
import TreasureCard from './components/TreasureCard.jsx';
import Armory from './components/Armory.jsx';
import { QUESTS } from './data/quests.js';
import { HEROES } from './data/heroes.js';
import { SPELLS } from './data/spells.js';
import { ORIGINAL_ARMORY_ITEMS, EXPANDED_ARMORY_ITEMS, getEffectiveRangedAttack } from './data/armory.js';
import { buildShuffledDeck } from './data/treasureDeck.js';
import {
  createHeroPiece,
  createMonsterPiece,
  rollDice,
  rollMovement,
  resolveCombat,
  getReachableTiles,
  getAdjacentPieces,
  getRangedTargets,
  revealFromTile,
  getInitialRevealedTiles,
  doMonsterTurn,
  bfsPath,
  getEffectiveAttack,
  getEffectiveDefend,
  getRegionKey,
  PHASE,
} from './game/GameState.js';

const HERO_ORDER = ['barbarian', 'dwarf', 'elf', 'wizard'];

// ─── Lobby ───────────────────────────────────────────────────────────────────

function Lobby({ onStart }) {
  const [selected, setSelected] = useState(['barbarian']);
  const [armoryMode, setArmoryMode] = useState('original');
  const toggle = (id) =>
    setSelected(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(h => h !== id) : prev
        : prev.length < 4 ? [...prev, id] : prev
    );

  return (
    <div style={{
      minHeight: '100vh', background: '#0d0d1a', color: '#eee',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Georgia, serif',
    }}>
      <h1 style={{ color: '#c0963c', fontSize: 48, marginBottom: 8, letterSpacing: 4 }}>HEROIC QUEST</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>A cooperative dungeon adventure</p>
      <p style={{ color: '#aaa', marginBottom: 16 }}>Choose your heroes (1–4):</p>
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        {HERO_ORDER.map(id => {
          const h = HEROES[id];
          const active = selected.includes(id);
          const hex = '#' + h.color.toString(16).padStart(6, '0');
          return (
            <button key={id} onClick={() => toggle(id)} style={{
              background: active ? '#1c1c2e' : '#0d0d1a',
              border: `2px solid ${active ? hex : '#333'}`,
              borderRadius: 10, padding: '16px 20px', cursor: 'pointer',
              color: '#eee', width: 155, textAlign: 'left',
              boxShadow: active ? `0 0 12px ${hex}66` : 'none',
              transition: 'all 0.2s',
            }}>
              <div style={{ color: hex, fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>{h.name}</div>
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>
                Body: {h.body} &nbsp; Mind: {h.mind}<br />
                Attack: {h.attackDice} dice &nbsp; Defense: {h.defendDice} dice
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: '#aaa', marginBottom: 10, textAlign: 'center' }}>Armory ruleset:</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {[['original', 'Original Armory'], ['expanded', 'Expanded Armory']].map(([mode, label]) => (
            <button key={mode} onClick={() => setArmoryMode(mode)} style={{
              background: armoryMode === mode ? '#1c1c2e' : '#0d0d1a',
              border: `2px solid ${armoryMode === mode ? '#c0963c' : '#333'}`,
              borderRadius: 8, padding: '10px 20px', cursor: 'pointer',
              color: armoryMode === mode ? '#c0963c' : '#888', fontSize: 13,
              boxShadow: armoryMode === mode ? '0 0 10px #c0963c44' : 'none',
              transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>
      </div>
      <button onClick={() => onStart(selected, armoryMode)} style={{
        background: '#c0963c', color: '#1a1a1a', border: 'none',
        borderRadius: 8, padding: '14px 40px', fontSize: 18,
        fontWeight: 'bold', cursor: 'pointer', letterSpacing: 2,
      }}>BEGIN CAMPAIGN</button>
      <p style={{ color: '#333', marginTop: 16, fontSize: 12 }}>{QUESTS.length} quests available</p>
    </div>
  );
}

// ─── Game init ────────────────────────────────────────────────────────────────

function initQuestGame(quest, campaignHeroes) {
  const heroes = campaignHeroes.map((ch, i) => ({
    ...ch,
    x: quest.heroSpawns[i]?.x ?? 2,
    y: quest.heroSpawns[i]?.y ?? 8,
  }));
  const monsters = quest.monsters.map(m => createMonsterPiece(m));
  const traps = quest.traps.map((t, i) => ({ ...t, id: `trap_${i}`, revealed: false, triggered: false }));
  const npcs = (quest.npcs || []).map(n => ({ ...n }));
  return {
    phase: PHASE.HERO_TURN,
    heroes, monsters, traps, npcs,
    activeHeroIndex: 0,
    treasureDeck: buildShuffledDeck(),
    usedSpells: new Set(),
    buffedHeroes: new Set(),
    searchedRooms: new Set(),
    revealedSecretDoors: new Set(),
    bossKilled: false,
    log: [
      { text: `Quest: ${quest.name}`, color: '#c0963c', time: Date.now() - 1 },
      { text: quest.objective, color: '#888', time: Date.now() },
    ],
    movesLeft: 0,
    hasRolledMove: false,
    hasActed: false,
  };
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('lobby');          // 'lobby'|'game'|'armory'|'campaign_complete'
  const [questIndex, setQuestIndex] = useState(0);
  const [campaignHeroes, setCampaignHeroes] = useState(null); // persists across quests
  const [campaignArmoryMode, setCampaignArmoryMode] = useState('original'); // 'original'|'expanded'
  const [game, setGame] = useState(null);
  const [revealedTiles, setRevealedTiles] = useState(null);
  const [reachable, setReachable] = useState([]);
  const [attackable, setAttackable] = useState([]);
  const [rangedAttackable, setRangedAttackable] = useState([]);
  const [diceResult, setDiceResult] = useState(null);
  const [treasureCard, setTreasureCard] = useState(null);
  const [planningFor, setPlanningFor] = useState(null);
  const [intents, setIntents] = useState({});
  const [targetingSpell, setTargetingSpell] = useState(null);
  const [targetingItem, setTargetingItem] = useState(null);    // 'holy_water' | 'throw' | null
  const [throwingWeapon, setThrowingWeapon] = useState(null);
  const [geniePendingHeroId, setGeniePendingHeroId] = useState(null);
  const [wandPickerHeroId, setWandPickerHeroId] = useState(null);
  const boardRef = useRef(null);

  const currentQuest = QUESTS[questIndex];
  const nextQuest = QUESTS[questIndex + 1];

  // ─── Campaign start ──────────────────────────────────────────────────

  const startCampaign = (heroIds, armoryMode) => {
    const heroes = heroIds.map((id, i) =>
      createHeroPiece(id, `p${i}`, QUESTS[0].heroSpawns[i].x, QUESTS[0].heroSpawns[i].y)
    );
    setCampaignHeroes(heroes);
    setCampaignArmoryMode(armoryMode || 'original');
    setQuestIndex(0);
    launchQuest(QUESTS[0], heroes);
  };

  const launchQuest = (quest, heroes) => {
    const g = initQuestGame(quest, heroes);
    setGame(g);
    setRevealedTiles(getInitialRevealedTiles(quest, quest.heroSpawns));
    setReachable([]); setAttackable([]); setRangedAttackable([]);
    setDiceResult(null); setTreasureCard(null);
    setPlanningFor(null); setIntents({});
    setTargetingSpell(null);
    boardRef.current?.clearAllIntentPaths?.();
    setScreen('game');
  };

  const handleQuestComplete = () => {
    if (nextQuest) {
      setScreen('armory');
    } else {
      setScreen('campaign_complete');
    }
  };

  const handleArmoryComplete = (updatedHeroes) => {
    const next = QUESTS[questIndex + 1];
    setQuestIndex(i => i + 1);
    setCampaignHeroes(updatedHeroes);
    launchQuest(next, updatedHeroes);
  };

  // ─── Victory condition check ─────────────────────────────────────────

  const checkVictory = (g, quest, tileX, tileY) => {
    const v = quest.victory;
    if (!v || v.type === 'stairs') {
      return QUESTS[questIndex]?.tiles[tileY]?.[tileX] === 'stair';
    }
    if (v.type === 'rescue_and_stairs') {
      const freed = g.npcs?.some(n => n.id === v.npcId && n.freed);
      return freed && currentQuest.tiles[tileY]?.[tileX] === 'stair';
    }
    if (v.type === 'kill_boss_and_stairs') {
      return g.bossKilled && currentQuest.tiles[tileY]?.[tileX] === 'stair';
    }
    if (v.type === 'kill_all_and_stairs') {
      const allDead = g.monsters.every(m => m.isDead);
      return allDead && currentQuest.tiles[tileY]?.[tileX] === 'stair';
    }
    return false;
  };

  // ─── Helpers ─────────────────────────────────────────────────────────

  // True if any visible monster occupies the same connected floor region as (x,y).
  const roomHasMonster = (g, x, y, revealed) => {
    const roomKey = getRegionKey(currentQuest, x, y);
    return g.monsters.some(m =>
      !m.isDead &&
      revealed?.has(`${m.x},${m.y}`) &&
      getRegionKey(currentQuest, m.x, m.y) === roomKey
    );
  };

  // Furniture positions for the current quest (treated as permanent traversal blockers).
  const furnitureBlockers = (currentQuest?.furniture || []).map(f => ({ x: f.x, y: f.y, isDead: false }));

  const activeArmoryItems = campaignArmoryMode === 'expanded' ? EXPANDED_ARMORY_ITEMS : ORIGINAL_ARMORY_ITEMS;

  // Returns the hero's equipped melee weapon (if any).
  const getHeroDiagonal = (hero) => (hero.equipment || []).some(e => e.diagonal && e.slot === 'weapon');
  const getHeroRangedWeapon = (hero) => (hero.equipment || []).find(e => e.ranged && e.slot === 'ranged');

  // Compute melee + ranged attackable after movement/roll. Updates both state vars.
  const computeAttackable = (hero, liveMonsters, revTiles) => {
    const diagonal = getHeroDiagonal(hero);
    setAttackable(getAdjacentPieces(hero.x, hero.y, liveMonsters, diagonal));
    const rangedWeapon = getHeroRangedWeapon(hero);
    setRangedAttackable(rangedWeapon
      ? getRangedTargets(currentQuest, hero.x, hero.y, liveMonsters, revTiles, rangedWeapon.crossbow)
      : []);
  };

  // Populate attackable at the start of each hero turn so heroes can attack before rolling movement.
  useEffect(() => {
    if (!game || game.phase !== PHASE.HERO_TURN || !revealedTiles) return;
    const hero = game.heroes[game.activeHeroIndex];
    if (!hero || hero.isDead) return;
    computeAttackable(hero, game.monsters.filter(m => !m.isDead), revealedTiles);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.activeHeroIndex, game?.phase]);

  // All wall tile positions as a Set of "x,y" strings (used by Pass Through Rock).
  const getAllWallTiles = (quest) => {
    const walls = new Set();
    quest.tiles.forEach((row, y) => row.forEach((cell, x) => { if (cell === 'wall') walls.add(`${x},${y}`); }));
    return walls;
  };

  const visibleMonsters = (g, revealed) =>
    g ? g.monsters.filter(m => !m.isDead && revealed?.has(`${m.x},${m.y}`)) : [];

  const visibleNpcs = (g, revealed) =>
    g ? (g.npcs || []).filter(n => !n.freed && revealed?.has(`${n.x},${n.y}`)) : [];

  const allPieces = game
    ? [...game.heroes, ...visibleMonsters(game, revealedTiles), ...visibleNpcs(game, revealedTiles)]
    : [];

  const activeHero = game?.heroes[game.activeHeroIndex];

  // ─── Trap helpers ─────────────────────────────────────────────────────

  const triggerTrap = (g, trap, heroId) => {
    const hero = g.heroes.find(h => h.id === heroId);
    if (!hero) return g;
    const dmg = trap.damage;
    const newBody = Math.max(0, hero.body - dmg);
    boardRef.current?.removeTrapMarker(trap.id);
    return {
      ...g,
      traps: g.traps.map(t => t.id === trap.id ? { ...t, triggered: true, revealed: true } : t),
      heroes: g.heroes.map(h => h.id === heroId ? { ...h, body: newBody, isDead: newBody <= 0, gold: newBody <= 0 ? 0 : h.gold } : h),
      log: [...g.log, {
        text: `${hero.name} triggered a ${trap.type} trap! −${dmg} Body Point${dmg !== 1 ? 's' : ''}${newBody <= 0 ? ' (down!)' : ''}`,
        color: '#e67e22', time: Date.now(),
      }],
    };
  };

  // ─── Intent planning ──────────────────────────────────────────────────

  const togglePlan = (heroId) => {
    setPlanningFor(prev => prev === heroId ? null : heroId);
    setTargetingSpell(null);
  };

  const setHeroIntent = (hero, destX, destY) => {
    const others = [
      ...((game?.heroes) || []).filter(h => h.id !== hero.id && !h.isDead),
      ...((game?.monsters) || []).filter(m => !m.isDead),
      ...furnitureBlockers,
    ];
    const path = bfsPath(currentQuest, hero.x, hero.y, destX, destY, others, game?.revealedSecretDoors || new Set());
    if (!path.length) return;
    setIntents(prev => ({ ...prev, [hero.id]: { destX, destY, path } }));
    boardRef.current?.setIntentPath(hero.id, path, destX, destY, hero.color);
    setPlanningFor(null);
  };

  const clearHeroIntent = (heroId) => {
    setIntents(prev => { const n = { ...prev }; delete n[heroId]; return n; });
    boardRef.current?.clearIntentPath(heroId);
  };

  // ─── Tile click ───────────────────────────────────────────────────────

  const handleTileClick = useCallback((tile) => {
    if (planningFor) {
      const hero = game?.heroes.find(h => h.id === planningFor);
      if (hero && !hero.isDead) setHeroIntent(hero, tile.x, tile.y);
      return;
    }
    if (targetingSpell) { handleSpellTarget(tile); return; }
    if (targetingItem === 'holy_water') { handleHolyWaterTarget(tile); return; }
    if (targetingItem === 'throw') { handleThrowTarget(tile); return; }

    setGame(g => {
      if (!g || g.phase !== PHASE.HERO_TURN) return g;
      const hero = g.heroes[g.activeHeroIndex];
      if (!hero || hero.isDead) return g;

      // Move
      if (reachable.some(t => t.x === tile.x && t.y === tile.y)) {
        let updated = { ...g };

        // Trap check — Dwarf automatically disarms traps without taking damage
        const trap = g.traps.find(t => t.x === tile.x && t.y === tile.y && !t.triggered && !t.revealed);
        if (trap) {
          if (hero.heroId === 'dwarf') {
            boardRef.current?.removeTrapMarker(trap.id);
            updated = {
              ...updated,
              traps: updated.traps.map(t => t.id === trap.id ? { ...t, triggered: true, revealed: true } : t),
              log: [...updated.log, { text: `${hero.name} disarms the ${trap.type} trap!`, color: '#2ecc71', time: Date.now() }],
            };
          } else {
            updated = triggerTrap(updated, trap, hero.id);
          }
        }

        // Free NPC
        let npcs = updated.npcs || [];
        const npcHere = npcs.find(n => n.x === tile.x && n.y === tile.y && !n.freed);
        if (npcHere) {
          npcs = npcs.map(n => n.id === npcHere.id ? { ...n, freed: true } : n);
          updated = {
            ...updated, npcs,
            log: [...updated.log, { text: `${hero.name} found ${npcHere.name}!`, color: '#daa520', time: Date.now() }],
          };
        }

        const newHero = { ...updated.heroes.find(h => h.id === hero.id), x: tile.x, y: tile.y };
        const newHeroes = updated.heroes.map(h => h.id === hero.id ? newHero : h);
        // Use the BFS-computed movesLeft for this tile (actual path cost, not Manhattan distance)
        const reachableTile = reachable.find(t => t.x === tile.x && t.y === tile.y);
        const newMovesLeft = reachableTile?.movesLeft ?? 0;
        updated = { ...updated, heroes: newHeroes, movesLeft: newMovesLeft };

        setRevealedTiles(prev => revealFromTile(currentQuest, tile.x, tile.y, prev));
        clearHeroIntent(hero.id);

        // Victory check
        if (checkVictory(updated, currentQuest, tile.x, tile.y)) {
          setReachable([]); setAttackable([]);
          setTimeout(handleQuestComplete, 800);
          return {
            ...updated, phase: PHASE.QUEST_COMPLETE,
            log: [...updated.log, { text: 'Quest complete! Heroes escape the dungeon!', color: '#f39c12', time: Date.now() }],
          };
        }

        const postMoveMonsters = [...updated.monsters.filter(m => !m.isDead), ...furnitureBlockers];
        const postMoveAllOthers = [...newHeroes.filter(h => h.id !== hero.id && !h.isDead), ...postMoveMonsters];
        const hasPassThroughPost = updated.buffedHeroes?.has(hero.id + ':pass_through_rock');
        const postMoveExtra = hasPassThroughPost
          ? new Set([...updated.revealedSecretDoors, ...getAllWallTiles(currentQuest)])
          : updated.revealedSecretDoors;
        const newReachable = newMovesLeft > 0 ? getReachableTiles(currentQuest, tile.x, tile.y, newMovesLeft, postMoveMonsters, postMoveAllOthers, postMoveExtra) : [];
        setReachable(newReachable);
        const postMoveLiveMonsters = updated.monsters.filter(m => !m.isDead);
        computeAttackable(newHero, postMoveLiveMonsters, revealedTiles);
        return updated;
      }

      // Attack monster — melee or ranged
      const meleeTarget = attackable.find(m => m.x === tile.x && m.y === tile.y);
      const rangedTarget = !meleeTarget ? rangedAttackable.find(m => m.x === tile.x && m.y === tile.y) : null;
      const target = meleeTarget || rangedTarget;
      if (target && !g.hasActed) {
        const fireRageBonus = g.buffedHeroes?.has(hero.id + ':fire_rage') ? 2 : 0;
        const isRangedAttack = !!rangedTarget;
        const baseDice = isRangedAttack ? getEffectiveRangedAttack(hero) : getEffectiveAttack(hero);
        const attackRolls = rollDice(baseDice + fireRageBonus);
        const defendRolls = rollDice(target.defendDice);
        const { damage } = resolveCombat(attackRolls, defendRolls);
        setDiceResult({ attackRolls, defendRolls, damage });

        const newBody = Math.max(0, target.body - damage);
        const isDead = newBody <= 0;
        const bossKilled = isDead && target.id === currentQuest.victory?.bossId;
        setAttackable(prev => prev.filter(m => m.id !== target.id));

        return {
          ...g,
          monsters: g.monsters.map(m => m.id === target.id ? { ...m, body: newBody, isDead } : m),
          heroes: isDead
            ? g.heroes.map(h => h.id === hero.id ? { ...h, gold: h.gold + (target.gold || 0) } : h)
            : g.heroes,
          hasActed: true,
          bossKilled: g.bossKilled || bossKilled,
          log: [...g.log, {
            text: `${hero.name} attacks ${target.name} — ${damage} damage${isDead ? ` (killed! +${target.gold || 0}gp)` : ''}${bossKilled ? ' THE WARLORD IS DEAD!' : ''}`,
            color: bossKilled ? '#f39c12' : isDead ? '#e74c3c' : '#eee',
            rolls: [...attackRolls, '|', ...defendRolls],
            time: Date.now(),
          }],
        };
      }
      return g;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachable, attackable, rangedAttackable, planningFor, targetingSpell, targetingItem, throwingWeapon, game, intents, questIndex]);

  // ─── Spells ───────────────────────────────────────────────────────────

  const handleCastSpell = (spell) => {
    if (targetingSpell?.id === spell.id) { setTargetingSpell(null); return; }
    if (spell.targeting === 'none' || spell.targeting === 'self') {
      applySpell(spell);
    } else {
      setTargetingSpell(spell);
    }
  };

  const handleSpellTarget = (tile) => {
    if (!targetingSpell) return;
    const spell = targetingSpell;
    setTargetingSpell(null);
    setGame(g => {
      if (!g) return g;
      const hero = g.heroes[g.activeHeroIndex];
      const newUsed = new Set(g.usedSpells);
      newUsed.add(`${hero.id}:${spell.id}`);
      let updatedMonsters = g.monsters, updatedHeroes = g.heroes;
      let bossKilled = g.bossKilled;
      const logEntry = { time: Date.now(), color: '#9b59b6' };

      if (spell.targeting === 'enemy') {
        if (spell.areaRoom) {
          // Attack all monsters in the same floor region as the clicked tile
          const regionKey = getRegionKey(currentQuest, tile.x, tile.y);
          const targets = g.monsters.filter(m => !m.isDead && getRegionKey(currentQuest, m.x, m.y) === regionKey);
          if (!targets.length) return g;
          let goldEarned = 0;
          updatedMonsters = g.monsters;
          const kills = [];
          targets.forEach(target => {
            const attackRolls = rollDice(spell.attackDice);
            const skulls = attackRolls.filter(r => r === 'skull').length;
            const defendRolls = rollDice(target.defendDice);
            const shields = defendRolls.filter(r => r === 'black_shield').length;
            const dmg = Math.max(0, skulls - shields);
            const newBody = Math.max(0, target.body - dmg);
            const dead = newBody <= 0;
            if (dead) { goldEarned += target.gold || 0; kills.push(target.name); }
            if (dead && target.id === currentQuest.victory?.bossId) bossKilled = true;
            updatedMonsters = updatedMonsters.map(m => m.id === target.id ? { ...m, body: newBody, isDead: dead } : m);
          });
          if (goldEarned > 0) updatedHeroes = updatedHeroes.map(h => h.id === hero.id ? { ...h, gold: h.gold + goldEarned } : h);
          logEntry.text = `${hero.name} casts ${spell.name}! Hits ${targets.length} monster${targets.length > 1 ? 's' : ''}${kills.length ? ` (${kills.join(', ')} killed! +${goldEarned}gp)` : ''}.`;
        } else {
          const target = g.monsters.find(m => m.x === tile.x && m.y === tile.y && !m.isDead);
          if (!target) return g;
          let damage = 0;
          let attackRolls = [];
          if (spell.directDamage) {
            damage = spell.directDamage;
            logEntry.text = `${hero.name} casts ${spell.name}! ${target.name} takes ${damage} damage.`;
          } else if (spell.attackDice) {
            attackRolls = rollDice(spell.attackDice);
            const skulls = attackRolls.filter(r => r === 'skull').length;
            damage = spell.noDefend ? skulls : Math.max(0, skulls - rollDice(target.defendDice).filter(r => r === 'black_shield').length);
            setDiceResult({ attackRolls, defendRolls: [], damage });
            logEntry.text = `${hero.name} casts ${spell.name}! ${target.name} takes ${damage} damage.`;
          }
          const newBody = Math.max(0, target.body - damage);
          const isDead = newBody <= 0;
          if (isDead && target.id === currentQuest.victory?.bossId) bossKilled = true;
          if (isDead) {
            logEntry.text += ` (killed! +${target.gold || 0}gp)`;
            updatedHeroes = updatedHeroes.map(h => h.id === hero.id ? { ...h, gold: h.gold + (target.gold || 0) } : h);
          }
          updatedMonsters = g.monsters.map(m => m.id === target.id ? { ...m, body: newBody, isDead } : m);
        }
      } else if (spell.targeting === 'ally') {
        const target = g.heroes.find(h => h.x === tile.x && h.y === tile.y && !h.isDead);
        if (!target) return g;
        if (spell.range) {
          const dist = Math.abs(target.x - hero.x) + Math.abs(target.y - hero.y);
          if (dist > spell.range) {
            return { ...g, log: [...g.log, { text: `${target.name} is out of range (max ${spell.range} squares).`, color: '#e67e22', time: Date.now() }] };
          }
        }
        if (spell.healMind) {
          updatedHeroes = g.heroes.map(h => h.id === target.id ? { ...h, mind: Math.min(h.maxMind, h.mind + spell.healMind) } : h);
          logEntry.text = `${hero.name} casts ${spell.name} on ${target.name}. +${spell.healMind} Mind.`;
        }
      }
      return { ...g, heroes: updatedHeroes, monsters: updatedMonsters, usedSpells: newUsed, hasActed: true, bossKilled, log: [...g.log, logEntry] };
    });
  };

  const applySpell = (spell) => {
    setGame(g => {
      if (!g) return g;
      const hero = g.heroes[g.activeHeroIndex];
      const newUsed = new Set(g.usedSpells);
      newUsed.add(`${hero.id}:${spell.id}`);
      const logEntry = { time: Date.now(), color: '#9b59b6' };

      if (spell.id === 'swift_wind') {
        const swiftMonsters = [...g.monsters.filter(m => !m.isDead), ...furnitureBlockers];
        const swiftAllOthers = [...g.heroes.filter(h => h.id !== hero.id && !h.isDead), ...swiftMonsters];
        setReachable(getReachableTiles(currentQuest, hero.x, hero.y, 12, swiftMonsters, swiftAllOthers, g.revealedSecretDoors));
        setAttackable(getAdjacentPieces(hero.x, hero.y, g.monsters.filter(m => !m.isDead)));
        logEntry.text = `${hero.name} casts Swift Wind! Move up to 12 squares.`;
        return { ...g, movesLeft: 12, hasRolledMove: true, usedSpells: newUsed, log: [...g.log, logEntry] };
      }
      if (spell.id === 'rock_skin') {
        const b = new Set(g.buffedHeroes); b.add(hero.id + ':rock_skin');
        logEntry.text = `${hero.name} casts Rock Skin! +2 defense dice this turn.`;
        return { ...g, usedSpells: newUsed, buffedHeroes: b, log: [...g.log, logEntry] };
      }
      if (spell.id === 'veil_of_mist') {
        const b = new Set(g.buffedHeroes); b.add(hero.id + ':veil_of_mist');
        logEntry.text = `${hero.name} casts Veil of Mist! Monsters skip you this turn.`;
        return { ...g, usedSpells: newUsed, buffedHeroes: b, log: [...g.log, logEntry] };
      }
      if (spell.id === 'tempest') {
        const b = new Set(g.buffedHeroes); b.add('tempest');
        logEntry.text = `${hero.name} casts Tempest! All monsters stunned for one turn.`;
        return { ...g, usedSpells: newUsed, buffedHeroes: b, hasActed: true, log: [...g.log, logEntry] };
      }
      if (spell.id === 'pass_through_rock') {
        const b = new Set(g.buffedHeroes); b.add(hero.id + ':pass_through_rock');
        logEntry.text = `${hero.name} casts Pass Through Rock! Walk through walls this turn.`;
        // If movement already rolled, immediately recompute reachable with walls passable
        if (g.hasRolledMove && g.movesLeft > 0) {
          const ptMonsters = [...g.monsters.filter(m => !m.isDead), ...furnitureBlockers];
          const ptOthers = [...g.heroes.filter(h => h.id !== hero.id && !h.isDead), ...ptMonsters];
          const ptExtra = new Set([...g.revealedSecretDoors, ...getAllWallTiles(currentQuest)]);
          setReachable(getReachableTiles(currentQuest, hero.x, hero.y, g.movesLeft, ptMonsters, ptOthers, ptExtra));
        }
        return { ...g, usedSpells: newUsed, buffedHeroes: b, log: [...g.log, logEntry] };
      }
      if (spell.id === 'genie') {
        logEntry.text = `${hero.name} casts Genie! Choose a free item from the Armory.`;
        setGeniePendingHeroId(hero.id);
        return { ...g, usedSpells: newUsed, hasActed: true, log: [...g.log, logEntry] };
      }
      logEntry.text = `${hero.name} casts ${spell.name}.`;
      return { ...g, usedSpells: newUsed, hasActed: true, log: [...g.log, logEntry] };
    });
  };

  // ─── Holy water targeting ──────────────────────────────────────────────

  const UNDEAD_TYPES = new Set(['skeleton', 'zombie', 'mummy']);

  const handleHolyWaterTarget = (tile) => {
    setTargetingItem(null);
    setGame(g => {
      if (!g) return g;
      const hero = g.heroes[g.activeHeroIndex];
      const target = g.monsters.find(m => m.x === tile.x && m.y === tile.y && !m.isDead);
      if (!target || !UNDEAD_TYPES.has(target.type)) {
        return { ...g, log: [...g.log, { text: 'Holy Water only works on undead (skeleton, zombie, mummy).', color: '#e67e22', time: Date.now() }] };
      }
      const waterIdx = (hero.equipment || []).findIndex(e => e.isHolyWater);
      const newEquip = [...(hero.equipment || [])];
      newEquip.splice(waterIdx, 1);
      const goldGained = target.gold || 0;
      const bossKilled = target.id === currentQuest.victory?.bossId;
      return {
        ...g,
        monsters: g.monsters.map(m => m.id === target.id ? { ...m, body: 0, isDead: true } : m),
        heroes: g.heroes.map(h => h.id === hero.id ? { ...h, equipment: newEquip, gold: h.gold + goldGained } : h),
        hasActed: true,
        bossKilled: g.bossKilled || bossKilled,
        log: [...g.log, { text: `${hero.name} uses Holy Water on ${target.name}! Destroyed instantly! +${goldGained}gp`, color: '#aaffaa', time: Date.now() }],
      };
    });
  };

  // ─── Throw weapon ─────────────────────────────────────────────────────

  const handleThrowTarget = (tile) => {
    const weapon = throwingWeapon;
    setThrowingWeapon(null);
    setTargetingItem(null);
    setRangedAttackable([]);
    setGame(g => {
      if (!g || g.hasActed) return g;
      const hero = g.heroes[g.activeHeroIndex];
      const target = g.monsters.find(m => m.x === tile.x && m.y === tile.y && !m.isDead && revealedTiles?.has(`${m.x},${m.y}`));
      if (!target) return g;
      const attackDice = hero.attackDice + (weapon.attackBonus || 0);
      const attackRolls = rollDice(attackDice);
      const defendRolls = rollDice(target.defendDice);
      const { damage } = resolveCombat(attackRolls, defendRolls);
      setDiceResult({ attackRolls, defendRolls, damage });
      const newBody = Math.max(0, target.body - damage);
      const isDead = newBody <= 0;
      const bossKilled = isDead && target.id === currentQuest.victory?.bossId;
      const newEquip = (hero.equipment || []).filter(e => e.id !== weapon.id);
      return {
        ...g,
        monsters: g.monsters.map(m => m.id === target.id ? { ...m, body: newBody, isDead } : m),
        heroes: g.heroes.map(h => h.id === hero.id ? {
          ...h, equipment: newEquip, gold: isDead ? h.gold + (target.gold || 0) : h.gold,
        } : h),
        hasActed: true,
        bossKilled: g.bossKilled || bossKilled,
        log: [...g.log, {
          text: `${hero.name} throws ${weapon.name} at ${target.name} — ${damage} damage${isDead ? ` (killed! +${target.gold || 0}gp)` : ''}. Weapon lost.`,
          color: isDead ? '#e74c3c' : '#eee',
          rolls: [...attackRolls, '|', ...defendRolls],
          time: Date.now(),
        }],
      };
    });
  };

  // ─── Genie item selection ──────────────────────────────────────────────

  const handleGenieSelect = (item) => {
    setGame(g => {
      if (!g) return g;
      const hero = g.heroes.find(h => h.id === geniePendingHeroId);
      if (!hero) return g;
      const replaced = Array.isArray(item.replaces) ? item.replaces : item.replaces ? [item.replaces] : [];
      const filteredEquip = (hero.equipment || []).filter(e => !replaced.includes(e.id));
      return {
        ...g,
        heroes: g.heroes.map(h => h.id === hero.id ? { ...h, equipment: [...filteredEquip, item] } : h),
        log: [...g.log, { text: `${hero.name} receives ${item.name} from the Genie!`, color: '#9b59b6', time: Date.now() }],
      };
    });
    setGeniePendingHeroId(null);
  };

  // ─── Wand selection ────────────────────────────────────────────────────

  const handleWandSelect = (spellKey) => {
    setGame(g => {
      if (!g) return g;
      const hero = g.heroes.find(h => h.id === wandPickerHeroId);
      if (!hero) return g;
      const newUsed = new Set(g.usedSpells);
      newUsed.delete(`${hero.id}:${spellKey}`);
      const wandIdx = (hero.equipment || []).findIndex(e => e.isWand);
      const newEquip = [...(hero.equipment || [])];
      newEquip.splice(wandIdx, 1);
      return {
        ...g,
        heroes: g.heroes.map(h => h.id === hero.id ? { ...h, equipment: newEquip } : h),
        usedSpells: newUsed,
        hasActed: true,
        log: [...g.log, { text: `${hero.name} uses the Wand of Magic! ${SPELLS[spellKey]?.name} can be cast again.`, color: '#9b59b6', time: Date.now() }],
      };
    });
    setWandPickerHeroId(null);
  };

  // ─── Roll movement ─────────────────────────────────────────────────────

  const handleRollMove = () => {
    setGame(g => {
      if (!g || g.hasRolledMove) return g;
      const hero = g.heroes[g.activeHeroIndex];
      const movementDiceCount = (hero.equipment || []).reduce((min, e) => e.movementDice ? Math.min(min, e.movementDice) : min, 2);
      const movementPenalty = (hero.equipment || []).reduce((sum, e) => sum + (e.movementPenalty || 0), 0);
      const movementBonus = (hero.equipment || []).reduce((sum, e) => sum + (e.movementBonus || 0), 0)
        + (g.buffedHeroes?.has(hero.id + ':dexterity') ? 6 : 0);
      const moves = Math.max(1, rollMovement(movementDiceCount) - movementPenalty + movementBonus);
      const monsterBlockers = [...g.monsters.filter(m => !m.isDead), ...furnitureBlockers];
      const allOthers = [...g.heroes.filter(h => h.id !== hero.id && !h.isDead), ...monsterBlockers];
      const hasPassThrough = g.buffedHeroes?.has(hero.id + ':pass_through_rock');
      const extraPassable = hasPassThrough
        ? new Set([...g.revealedSecretDoors, ...getAllWallTiles(currentQuest)])
        : g.revealedSecretDoors;
      setReachable(getReachableTiles(currentQuest, hero.x, hero.y, moves, monsterBlockers, allOthers, extraPassable));
      computeAttackable(hero, g.monsters.filter(m => !m.isDead), revealedTiles);
      return {
        ...g, movesLeft: moves, hasRolledMove: true,
        log: [...g.log, { text: `${hero.name} rolls ${moves} movement${movementBonus > 0 ? ` (+${movementBonus})` : ''}.`, color: '#44aaff', time: Date.now() }],
      };
    });
  };

  // ─── Actions ──────────────────────────────────────────────────────────

  const handleAction = (action) => {
    if (action === 'end_turn') { endTurn(); return; }
    if (action === 'use_potion') { usePotion(); return; }
    if (action === 'use_holy_water') { setTargetingItem('holy_water'); return; }
    if (action === 'rest') {
      setGame(g => {
        if (!g || g.hasActed) return g;
        const hero = g.heroes[g.activeHeroIndex];
        if (hero.body >= hero.maxBody) return { ...g, log: [...g.log, { text: `${hero.name} is already at full health.`, color: '#555', time: Date.now() }] };
        return {
          ...g,
          heroes: g.heroes.map(h => h.id === hero.id ? { ...h, body: Math.min(h.maxBody, h.body + 1) } : h),
          hasActed: true,
          log: [...g.log, { text: `${hero.name} rests and recovers 1 Body Point.`, color: '#2ecc71', time: Date.now() }],
        };
      });
      return;
    }
    if (action.startsWith('throw:')) {
      if (game?.hasActed) return;
      const hero = game?.heroes[game.activeHeroIndex];
      const weaponId = action.slice(6);
      const weapon = hero?.equipment?.find(e => e.id === weaponId);
      if (!weapon) return;
      setThrowingWeapon(weapon);
      setTargetingItem('throw');
      const liveVisible = (game?.monsters || []).filter(m => !m.isDead && revealedTiles?.has(`${m.x},${m.y}`));
      setRangedAttackable(liveVisible);
      return;
    }
    if (action === 'use_wand') {
      const hero = game?.heroes[game.activeHeroIndex];
      if (hero) setWandPickerHeroId(hero.id);
      return;
    }

    setGame(g => {
      if (!g) return g;
      const hero = g.heroes[g.activeHeroIndex];

      if (action === 'disarm_trap') {
        if (g.hasActed) return g;
        const adjTrap = g.traps.find(t => t.revealed && !t.triggered &&
          Math.abs(t.x - hero.x) + Math.abs(t.y - hero.y) <= 1);
        if (!adjTrap) return g;
        // Dwarf disarms automatically; Tool Kit has 50% chance (roll 1 die, skull = fail)
        const hasToolKit = hero.equipment?.some(e => e.isToolKit);
        if (hasToolKit && hero.heroId !== 'dwarf') {
          const roll = rollDice(1);
          const success = roll[0] !== 'skull';
          if (success) {
            boardRef.current?.removeTrapMarker(adjTrap.id);
            return {
              ...g,
              traps: g.traps.map(t => t.id === adjTrap.id ? { ...t, triggered: true } : t),
              hasActed: true,
              log: [...g.log, { text: `${hero.name} uses Tool Kit — success! Trap disarmed.`, color: '#2ecc71', time: Date.now() }],
            };
          } else {
            return {
              ...g,
              hasActed: true,
              log: [...g.log, { text: `${hero.name} uses Tool Kit — failed! (rolled ${roll[0]})`, color: '#e67e22', time: Date.now() }],
            };
          }
        }
        boardRef.current?.removeTrapMarker(adjTrap.id);
        return {
          ...g,
          traps: g.traps.map(t => t.id === adjTrap.id ? { ...t, triggered: true } : t),
          hasActed: true,
          log: [...g.log, { text: `${hero.name} disarms the ${adjTrap.type} trap!`, color: '#2ecc71', time: Date.now() }],
        };
      }

      if (action === 'search_treasure') {
        if (g.hasActed) return g;
        // Treasure can only be searched in a room, not in the starting corridor
        const corridorKey = getRegionKey(currentQuest, currentQuest.heroSpawns[0].x, currentQuest.heroSpawns[0].y);
        const roomKey = getRegionKey(currentQuest, hero.x, hero.y);
        if (roomKey === corridorKey) {
          return { ...g, hasActed: true, log: [...g.log, { text: `${hero.name} must be in a room to search for treasure.`, color: '#555', time: Date.now() }] };
        }
        // Cannot search while monsters are in the same room
        if (roomHasMonster(g, hero.x, hero.y, revealedTiles)) {
          return { ...g, hasActed: true, log: [...g.log, { text: `${hero.name} cannot search with monsters in the room.`, color: '#e67e22', time: Date.now() }] };
        }
        // Each room can only be searched for treasure once
        if (g.searchedRooms.has(roomKey)) {
          return { ...g, hasActed: true, log: [...g.log, { text: `${hero.name} searches... this room has already been looted.`, color: '#555', time: Date.now() }] };
        }
        if (!g.treasureDeck.length) return { ...g, hasActed: true, log: [...g.log, { text: 'Treasure deck empty.', color: '#555', time: Date.now() }] };
        const [card, ...rest] = g.treasureDeck;
        let updatedHeroes = g.heroes, updatedMonsters = g.monsters;
        const newSearchedRooms = new Set(g.searchedRooms);
        newSearchedRooms.add(roomKey);

        const TREASURE_ITEM_MAP = {
          holy_water: { id: 'holy_water', name: 'Holy Water', category: 'usable', usable: true, slot: null, desc: 'Destroys one undead monster instantly.', isHolyWater: true },
          wand: { id: 'wand', name: 'Wand of Magic', category: 'usable', usable: true, slot: null, desc: 'Cast any one spell you know once more.', isWand: true },
        };
        if (card.type === 'gold') updatedHeroes = g.heroes.map(h => h.id === hero.id ? { ...h, gold: h.gold + card.gold } : h);
        else if (card.type === 'item') {
          const itemObj = TREASURE_ITEM_MAP[card.id];
          if (itemObj && !(hero.equipment || []).some(e => e.id === itemObj.id)) {
            updatedHeroes = g.heroes.map(h => h.id === hero.id ? { ...h, equipment: [...(h.equipment || []), itemObj] } : h);
          }
        } else if (card.type === 'potion') {
          updatedHeroes = g.heroes.map(h => h.id === hero.id ? {
            ...h,
            body: card.healType === 'body' ? Math.min(h.maxBody, h.body + card.heal) : h.body,
            mind: card.healType === 'mind' ? Math.min(h.maxMind, h.mind + card.heal) : h.mind,
          } : h);
        } else if (card.type === 'trap') {
          updatedHeroes = g.heroes.map(h => h.id === hero.id ? { ...h, body: Math.max(0, h.body - card.damage), isDead: h.body - card.damage <= 0, gold: h.body - card.damage <= 0 ? 0 : h.gold } : h);
        } else if (card.type === 'monster') {
          const wanderType = currentQuest.wanderingMonsterType;
          const allPiecePositions = [...g.heroes.filter(h => !h.isDead), ...g.monsters.filter(m => !m.isDead)];
          // Spawn near the hero entry corridor (heroSpawns), not next to the searching hero.
          const spawnOffsets = [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
          const candidates = (currentQuest.heroSpawns || []).flatMap(s =>
            spawnOffsets.map(o => ({ x: s.x + o.dx, y: s.y + o.dy }))
          ).filter(t => {
            const tileType = currentQuest.tiles[t.y]?.[t.x];
            if (!tileType || tileType === 'void' || tileType === 'wall') return false;
            return !allPiecePositions.some(p => p.x === t.x && p.y === t.y);
          });
          if (candidates.length) {
            const spawn = candidates[Math.floor(Math.random() * candidates.length)];
            updatedMonsters = [...g.monsters, createMonsterPiece({ type: wanderType, x: spawn.x, y: spawn.y, id: `w_${Date.now()}` })];
            setRevealedTiles(prev => { const n = new Set(prev); n.add(`${spawn.x},${spawn.y}`); return n; });
          }
        }
        setTreasureCard({ card, heroName: hero.name });
        return { ...g, heroes: updatedHeroes, monsters: updatedMonsters, treasureDeck: rest, searchedRooms: newSearchedRooms, hasActed: true, log: [...g.log, { text: `${hero.name} searches for treasure...`, color: '#f1c40f', time: Date.now() }] };
      }

      if (action === 'search_traps') {
        if (g.hasActed) return g;
        // Cannot search while monsters are in the same room
        if (roomHasMonster(g, hero.x, hero.y, revealedTiles)) {
          return { ...g, hasActed: true, log: [...g.log, { text: `${hero.name} cannot search with monsters in the room.`, color: '#e67e22', time: Date.now() }] };
        }
        // Only reveal traps in the same connected floor region as the hero
        const heroRoomKey = getRegionKey(currentQuest, hero.x, hero.y);
        let found = 0;
        const newTraps = g.traps.map(t => {
          if (!t.revealed && !t.triggered) {
            const trapRoomKey = getRegionKey(currentQuest, t.x, t.y);
            if (trapRoomKey === heroRoomKey) {
              found++;
              boardRef.current?.addTrapMarker(t.id, t.x, t.y);
              return { ...t, revealed: true };
            }
          }
          return t;
        });
        const msg = found > 0 ? `${hero.name} found ${found} trap${found > 1 ? 's' : ''}!` : `${hero.name} searches for traps... clear.`;
        return { ...g, traps: newTraps, hasActed: true, log: [...g.log, { text: msg, color: found > 0 ? '#e67e22' : '#666', time: Date.now() }] };
      }

      if (action === 'search_secret') {
        if (g.hasActed) return g;
        // Cannot search while monsters are in the same room
        if (roomHasMonster(g, hero.x, hero.y, revealedTiles)) {
          return { ...g, hasActed: true, log: [...g.log, { text: `${hero.name} cannot search with monsters in the room.`, color: '#e67e22', time: Date.now() }] };
        }
        // Check for an unrevealed secret door in an adjacent wall
        const secretDoors = currentQuest.secretDoors || [];
        const found = secretDoors.find(sd =>
          !g.revealedSecretDoors.has(`${sd.x},${sd.y}`) &&
          Math.abs(sd.x - hero.x) + Math.abs(sd.y - hero.y) === 1
        );
        if (found) {
          const newRevealedDoors = new Set(g.revealedSecretDoors);
          newRevealedDoors.add(`${found.x},${found.y}`);
          boardRef.current?.revealSecretDoor(found.x, found.y);
          setRevealedTiles(prev => {
            let next = new Set(prev);
            [[found.x+1,found.y],[found.x-1,found.y],[found.x,found.y+1],[found.x,found.y-1]].forEach(([nx,ny]) => {
              const t = currentQuest.tiles[ny]?.[nx];
              if (t === 'floor' || t === 'stair') next = revealFromTile(currentQuest, nx, ny, next);
            });
            return next;
          });
          return { ...g, revealedSecretDoors: newRevealedDoors, hasActed: true, log: [...g.log, { text: `${hero.name} discovers a secret door!`, color: '#f39c12', time: Date.now() }] };
        }
        return { ...g, hasActed: true, log: [...g.log, { text: `${hero.name} searches for secret doors... none found.`, color: '#666', time: Date.now() }] };
      }

      return g;
    });
  };

  const usePotion = () => {
    setGame(g => {
      if (!g) return g;
      const hero = g.heroes[g.activeHeroIndex];
      const potion = hero.equipment?.find(e => e.usable && (e.healBody || e.healMind || e.buffKey || e.isWand));
      if (!potion) return g;
      const removePotion = (equip) => { const eq = [...equip]; const idx = eq.findIndex(e => e.id === potion.id); if (idx >= 0) eq.splice(idx, 1); return eq; };

      // Wand of Magic — open the wand picker instead
      if (potion.isWand) {
        setWandPickerHeroId(hero.id);
        return { ...g, heroes: g.heroes.map(h => h.id === hero.id ? { ...h, equipment: removePotion(h.equipment || []) } : h) };
      }

      // Buff potion (dexterity, fire_rage, frost_skin)
      if (potion.buffKey) {
        const newBuffs = new Set(g.buffedHeroes || []);
        newBuffs.add(`${hero.id}:${potion.buffKey}`);
        let logText = `${hero.name} drinks ${potion.name}!`;
        if (potion.buffKey === 'dexterity') logText += ' +6 movement this turn.';
        else if (potion.buffKey === 'fire_rage') logText += ' +2 attack dice this turn.';
        else if (potion.buffKey === 'frost_skin') logText += ' +2 defense dice this turn.';
        return {
          ...g,
          heroes: g.heroes.map(h => h.id === hero.id ? { ...h, equipment: removePotion(h.equipment || []) } : h),
          buffedHeroes: newBuffs,
          log: [...g.log, { text: logText, color: '#2ecc71', time: Date.now() }],
        };
      }

      // Healing potion (body, mind, or both)
      const newEquip = removePotion(hero.equipment || []);
      const newBody = potion.healBody ? Math.min(hero.maxBody, hero.body + potion.healBody) : hero.body;
      const newMind = potion.healMind ? Math.min(hero.maxMind, hero.mind + potion.healMind) : hero.mind;
      return {
        ...g,
        heroes: g.heroes.map(h => h.id === hero.id ? { ...h, body: newBody, mind: newMind, equipment: newEquip } : h),
        log: [...g.log, { text: `${hero.name} drinks ${potion.name}.${potion.healBody ? ` +${potion.healBody} Body.` : ''}${potion.healMind ? ` +${potion.healMind} Mind.` : ''} (free action)`, color: '#2ecc71', time: Date.now() }],
      };
    });
  };

  // ─── End turn / monster AI ─────────────────────────────────────────────

  const endTurn = () => {
    setReachable([]); setAttackable([]); setRangedAttackable([]); setTargetingSpell(null); setTargetingItem(null); setThrowingWeapon(null);
    setGame(g => {
      if (!g) return g;
      const stunned = g.buffedHeroes?.has('tempest');
      const { updatedMonsters, updatedHeroes, logs } = stunned
        ? { updatedMonsters: g.monsters, updatedHeroes: g.heroes, logs: [{ text: 'Monsters stunned by Tempest!', color: '#9b59b6', time: Date.now() }] }
        : doMonsterTurn(currentQuest, g.monsters, g.heroes, revealedTiles || new Set(), g.buffedHeroes || new Set());

      const aliveHeroes = updatedHeroes.filter(h => !h.isDead);
      const allDown = aliveHeroes.length === 0;
      const cur = g.heroes[g.activeHeroIndex];
      const curIdx = aliveHeroes.findIndex(h => h.id === cur?.id);
      const next = aliveHeroes[(curIdx + 1) % Math.max(1, aliveHeroes.length)];
      const nextIdx = updatedHeroes.findIndex(h => h.id === next?.id);
      const newBuffs = new Set([...(g.buffedHeroes || [])].filter(b =>
        !b.endsWith(':rock_skin') && !b.endsWith(':veil_of_mist') && !b.endsWith(':pass_through_rock') &&
        !b.endsWith(':fire_rage') && !b.endsWith(':frost_skin') && !b.endsWith(':dexterity') &&
        b !== 'tempest'
      ));

      return {
        ...g, heroes: updatedHeroes, monsters: updatedMonsters, buffedHeroes: newBuffs,
        activeHeroIndex: nextIdx >= 0 ? nextIdx : 0,
        hasRolledMove: false, hasActed: false, movesLeft: 0,
        phase: allDown ? PHASE.GAME_OVER : PHASE.HERO_TURN,
        log: [...g.log, ...logs, { text: `--- ${next?.name || '?'}'s turn ---`, color: '#f39c12', time: Date.now() + 1 }],
      };
    });
  };

  // ─── Screens ──────────────────────────────────────────────────────────

  if (screen === 'lobby') return <Lobby onStart={startCampaign} />;

  if (screen === 'armory') {
    return (
      <Armory
        heroes={game?.heroes.filter(h => !h.isDead) || campaignHeroes}
        questName={currentQuest?.name}
        nextQuestName={nextQuest?.name}
        onContinue={handleArmoryComplete}
        armoryItems={activeArmoryItems}
      />
    );
  }

  if (screen === 'campaign_complete') {
    return (
      <div style={{
        minHeight: '100vh', background: '#0d0d1a', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#eee',
      }}>
        <h1 style={{ color: '#c0963c', fontSize: 40, marginBottom: 16 }}>Campaign Complete!</h1>
        <p style={{ color: '#888', marginBottom: 32 }}>The heroes have defeated Zargon's forces and saved the land.</p>
        <button onClick={() => { setScreen('lobby'); setQuestIndex(0); setCampaignHeroes(null); setGame(null); }} style={{
          background: '#c0963c', color: '#111', border: 'none',
          borderRadius: 8, padding: '14px 40px', fontSize: 18, cursor: 'pointer', fontWeight: 'bold',
        }}>Play Again</button>
      </div>
    );
  }

  if (!game) return null;
  const isQuestOver = game.phase === PHASE.QUEST_COMPLETE || game.phase === PHASE.GAME_OVER;
  const hasPotion = activeHero?.equipment?.some(e => e.usable && (e.healBody || e.healMind || e.buffKey || e.isWand));
  const canRest = !game.hasActed && activeHero?.body < activeHero?.maxBody;
  const throwableWeapons = !game.hasActed ? (activeHero?.equipment?.filter(e => e.throwable) || []) : [];
  const canDisarmTrap = !game.hasActed &&
    (activeHero?.heroId === 'dwarf' || activeHero?.equipment?.some(e => e.isToolKit)) &&
    game.traps?.some(t => t.revealed && !t.triggered &&
      Math.abs(t.x - activeHero.x) + Math.abs(t.y - activeHero.y) <= 1);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0d0d1a', fontFamily: 'sans-serif', overflow: 'hidden' }}>

      {/* Board */}
      <div style={{ flex: 1, position: 'relative' }}>
        <GameBoard
          ref={boardRef}
          quest={currentQuest}
          pieces={allPieces}
          revealedTiles={revealedTiles}
          reachableTiles={reachable}
          attackablePieces={attackable}
          rangedAttackablePieces={rangedAttackable}
          onTileClick={handleTileClick}
        />

        {/* Bottom bar */}
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10, alignItems: 'center' }}>
          {!game.hasRolledMove && game.phase === PHASE.HERO_TURN && !planningFor && !targetingSpell && (
            <button onClick={handleRollMove} style={{
              background: '#2980b9', color: '#fff', border: 'none',
              borderRadius: 8, padding: '10px 28px', fontSize: 15,
              cursor: 'pointer', fontWeight: 'bold', letterSpacing: 1, boxShadow: '0 0 14px #2980b988',
            }}>
              Roll Movement — {activeHero?.name}
            </button>
          )}
          {planningFor && (
            <div style={{ background: '#2a1a4a', border: '1px solid #8866cc', borderRadius: 8, padding: '10px 20px', color: '#cc99ff', fontSize: 14 }}>
              Planning for {game.heroes.find(h => h.id === planningFor)?.name} — click a destination
              <button onClick={() => setPlanningFor(null)} style={{ marginLeft: 12, background: 'none', border: '1px solid #555', borderRadius: 4, color: '#aaa', padding: '2px 8px', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
            </div>
          )}
          {targetingSpell && (
            <div style={{ background: '#1a0a2e', border: '1px solid #9b59b6', borderRadius: 8, padding: '10px 20px', color: '#cc99ff', fontSize: 14 }}>
              {targetingSpell.icon} {targetingSpell.name} — click a target
              <button onClick={() => setTargetingSpell(null)} style={{ marginLeft: 12, background: 'none', border: '1px solid #555', borderRadius: 4, color: '#aaa', padding: '2px 8px', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
            </div>
          )}
          {targetingItem === 'holy_water' && (
            <div style={{ background: '#0a1a0a', border: '1px solid #2ecc71', borderRadius: 8, padding: '10px 20px', color: '#aaffaa', fontSize: 14 }}>
              Holy Water — click an undead monster (skeleton, zombie, mummy)
              <button onClick={() => setTargetingItem(null)} style={{ marginLeft: 12, background: 'none', border: '1px solid #555', borderRadius: 4, color: '#aaa', padding: '2px 8px', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
            </div>
          )}
          {targetingItem === 'throw' && throwingWeapon && (
            <div style={{ background: '#1a1000', border: '1px solid #ff8800', borderRadius: 8, padding: '10px 20px', color: '#ffcc88', fontSize: 14 }}>
              Throwing {throwingWeapon.name} — click any visible monster (weapon lost after throw)
              <button onClick={() => { setTargetingItem(null); setThrowingWeapon(null); setRangedAttackable([]); }} style={{ marginLeft: 12, background: 'none', border: '1px solid #555', borderRadius: 4, color: '#aaa', padding: '2px 8px', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
            </div>
          )}
        </div>

        {/* Quest info */}
        <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 11, color: '#333' }}>
          Right-click drag to pan · Scroll to zoom
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 11, color: '#555', textAlign: 'right' }}>
          <div style={{ color: '#888' }}>{currentQuest?.name}</div>
          <div style={{ color: '#555', maxWidth: 220 }}>{currentQuest?.objective}</div>
          {game.bossKilled && <div style={{ color: '#f39c12', marginTop: 4 }}>Boss slain — reach the stairs!</div>}
          {currentQuest?.victory?.type === 'kill_all_and_stairs' && game.monsters.every(m => m.isDead) && <div style={{ color: '#f39c12', marginTop: 4 }}>All monsters slain — reach the stairs!</div>}
          {game.npcs?.some(n => n.freed) && <div style={{ color: '#daa520', marginTop: 4 }}>{game.npcs.find(n => n.freed)?.name} freed — reach the stairs!</div>}
        </div>

        {isQuestOver && (
          <div style={{
            position: 'absolute', inset: 0, background: '#000000cc',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#eee',
          }}>
            <h2 style={{ color: game.phase === PHASE.QUEST_COMPLETE ? '#f39c12' : '#e74c3c', fontSize: 36, marginBottom: 12 }}>
              {game.phase === PHASE.QUEST_COMPLETE ? 'Quest Complete!' : 'All Heroes Fallen...'}
            </h2>
            {game.phase === PHASE.GAME_OVER && (
              <button onClick={() => { setScreen('lobby'); setQuestIndex(0); setCampaignHeroes(null); setGame(null); }} style={{
                background: '#7f1d1d', color: '#eee', border: '1px solid #e74c3c',
                borderRadius: 8, padding: '12px 32px', fontSize: 16, cursor: 'pointer', fontWeight: 'bold',
              }}>Return to Lobby</button>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div style={{
        width: 270, display: 'flex', flexDirection: 'column', gap: 8,
        padding: 12, overflowY: 'auto', background: '#12121f', borderLeft: '1px solid #1e1e30',
      }}>
        <div style={{ color: '#c0963c', fontWeight: 'bold', fontSize: 13, letterSpacing: 2 }}>HEROIC QUEST</div>
        <div style={{ fontSize: 10, color: '#444', marginBottom: 2 }}>
          Quest {questIndex + 1}/{QUESTS.length}: {currentQuest?.name}
        </div>

        {game.heroes.map((hero, i) => (
          <HeroPanel
            key={hero.id}
            hero={hero}
            isActive={i === game.activeHeroIndex && game.phase === PHASE.HERO_TURN}
            isMyHero={i === game.activeHeroIndex}
            movesLeft={game.movesLeft}
            onAction={handleAction}
            hasPotion={i === game.activeHeroIndex && hasPotion}
            canRest={i === game.activeHeroIndex && canRest}
            throwableWeapons={i === game.activeHeroIndex ? throwableWeapons : []}
            canDisarmTrap={i === game.activeHeroIndex && canDisarmTrap}
            isPlanningFor={planningFor === hero.id}
            onTogglePlan={!hero.isDead ? () => togglePlan(hero.id) : undefined}
            usedSpells={i === game.activeHeroIndex ? game.usedSpells : null}
            onCastSpell={i === game.activeHeroIndex ? handleCastSpell : undefined}
            targetingSpell={i === game.activeHeroIndex ? targetingSpell : null}
            onCancelSpell={() => setTargetingSpell(null)}
            targetingItem={i === game.activeHeroIndex ? targetingItem : null}
          />
        ))}

        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontSize: 10, color: '#333', marginBottom: 4 }}>QUEST LOG</div>
          <CombatLog entries={game.log} />
        </div>
      </div>

      <DiceRoller {...(diceResult || {})} visible={!!diceResult} onClose={() => setDiceResult(null)} />
      <TreasureCard card={treasureCard?.card} heroName={treasureCard?.heroName} visible={!!treasureCard} onClose={() => setTreasureCard(null)} />

      {/* Genie spell overlay */}
      {geniePendingHeroId && (
        <div style={{ position: 'fixed', inset: 0, background: '#000b', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: '#1a1a2e', border: '2px solid #9b59b6', borderRadius: 12, padding: 24, maxWidth: 360, width: '90%', color: '#eee' }}>
            <div style={{ color: '#9b59b6', fontWeight: 'bold', fontSize: 16, marginBottom: 16 }}>Genie — Choose a Free Item</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
              {activeArmoryItems.map(item => (
                <button key={item.id} onClick={() => handleGenieSelect(item)} style={{
                  background: '#0d0d1a', border: '1px solid #333', borderRadius: 6,
                  padding: '8px 12px', color: '#ccc', cursor: 'pointer', textAlign: 'left', fontSize: 12,
                }}>
                  <strong style={{ color: '#c0963c' }}>{item.name}</strong>
                  <span style={{ color: '#666', marginLeft: 8 }}>{item.desc}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setGeniePendingHeroId(null)} style={{ marginTop: 12, background: 'none', border: '1px solid #444', borderRadius: 6, padding: '6px 16px', color: '#888', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Wand overlay — pick a used spell to re-enable */}
      {wandPickerHeroId && (() => {
        const wandHero = game.heroes.find(h => h.id === wandPickerHeroId);
        const usedHeroSpells = wandHero
          ? Object.values(SPELLS).filter(s => game.usedSpells.has(`${wandHero.id}:${s.id}`))
          : [];
        return (
          <div style={{ position: 'fixed', inset: 0, background: '#000b', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
            <div style={{ background: '#1a1a2e', border: '2px solid #9b59b6', borderRadius: 12, padding: 24, maxWidth: 340, width: '90%', color: '#eee' }}>
              <div style={{ color: '#9b59b6', fontWeight: 'bold', fontSize: 16, marginBottom: 16 }}>Wand of Magic — Restore a Spell</div>
              {usedHeroSpells.length === 0
                ? <div style={{ color: '#666', fontSize: 12 }}>No spells have been used yet.</div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {usedHeroSpells.map(s => (
                      <button key={s.id} onClick={() => handleWandSelect(s.id)} style={{
                        background: '#0d0d1a', border: '1px solid #333', borderRadius: 6,
                        padding: '8px 12px', color: '#ccc', cursor: 'pointer', textAlign: 'left', fontSize: 12,
                      }}>
                        {s.icon} <strong style={{ color: '#cc99ff' }}>{s.name}</strong>
                        <span style={{ color: '#666', marginLeft: 8 }}>{s.desc}</span>
                      </button>
                    ))}
                  </div>
              }
              <button onClick={() => setWandPickerHeroId(null)} style={{ marginTop: 12, background: 'none', border: '1px solid #444', borderRadius: 6, padding: '6px 16px', color: '#888', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
