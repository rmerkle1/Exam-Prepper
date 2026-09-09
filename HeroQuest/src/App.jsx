import { useState, useCallback, useRef } from 'react';
import GameBoard from './components/GameBoard.jsx';
import HeroPanel from './components/HeroPanel.jsx';
import CombatLog from './components/CombatLog.jsx';
import DiceRoller from './components/DiceRoller.jsx';
import TreasureCard from './components/TreasureCard.jsx';
import Armory from './components/Armory.jsx';
import { QUESTS } from './data/quests.js';
import { HEROES } from './data/heroes.js';
import { SPELLS } from './data/spells.js';
import { buildShuffledDeck } from './data/treasureDeck.js';
import {
  createHeroPiece,
  createMonsterPiece,
  rollDice,
  rollMovement,
  resolveCombat,
  getReachableTiles,
  getAdjacentPieces,
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
      <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
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
      <button onClick={() => onStart(selected)} style={{
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
  const [game, setGame] = useState(null);
  const [revealedTiles, setRevealedTiles] = useState(null);
  const [reachable, setReachable] = useState([]);
  const [attackable, setAttackable] = useState([]);
  const [diceResult, setDiceResult] = useState(null);
  const [treasureCard, setTreasureCard] = useState(null);
  const [planningFor, setPlanningFor] = useState(null);
  const [intents, setIntents] = useState({});
  const [targetingSpell, setTargetingSpell] = useState(null);
  const boardRef = useRef(null);

  const currentQuest = QUESTS[questIndex];
  const nextQuest = QUESTS[questIndex + 1];

  // ─── Campaign start ──────────────────────────────────────────────────

  const startCampaign = (heroIds) => {
    const heroes = heroIds.map((id, i) =>
      createHeroPiece(id, `p${i}`, QUESTS[0].heroSpawns[i].x, QUESTS[0].heroSpawns[i].y)
    );
    setCampaignHeroes(heroes);
    setQuestIndex(0);
    launchQuest(QUESTS[0], heroes);
  };

  const launchQuest = (quest, heroes) => {
    const g = initQuestGame(quest, heroes);
    setGame(g);
    setRevealedTiles(getInitialRevealedTiles(quest, quest.heroSpawns));
    setReachable([]); setAttackable([]);
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
    return false;
  };

  // ─── Helpers ─────────────────────────────────────────────────────────

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
    ];
    const path = bfsPath(currentQuest, hero.x, hero.y, destX, destY, others);
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
        const moveCost = Math.abs(tile.x - hero.x) + Math.abs(tile.y - hero.y);
        const newMovesLeft = Math.max(0, g.movesLeft - moveCost);
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

        const postMoveMonsters = updated.monsters.filter(m => !m.isDead);
        const postMoveAllOthers = [...newHeroes.filter(h => h.id !== hero.id && !h.isDead), ...postMoveMonsters];
        const newReachable = newMovesLeft > 0 ? getReachableTiles(currentQuest, tile.x, tile.y, newMovesLeft, postMoveMonsters, postMoveAllOthers) : [];
        setReachable(newReachable);
        setAttackable(getAdjacentPieces(tile.x, tile.y, updated.monsters.filter(m => !m.isDead)));
        return updated;
      }

      // Attack monster
      const target = attackable.find(m => m.x === tile.x && m.y === tile.y);
      if (target && !g.hasActed) {
        const attackRolls = rollDice(getEffectiveAttack(hero));
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
          hasActed: true,
          bossKilled: g.bossKilled || bossKilled,
          log: [...g.log, {
            text: `${hero.name} attacks ${target.name} — ${damage} damage${isDead ? ' (killed!)' : ''}${bossKilled ? ' THE WARLORD IS DEAD!' : ''}`,
            color: bossKilled ? '#f39c12' : isDead ? '#e74c3c' : '#eee',
            rolls: [...attackRolls, '|', ...defendRolls],
            time: Date.now(),
          }],
        };
      }
      return g;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachable, attackable, planningFor, targetingSpell, game, intents, questIndex]);

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
          damage = spell.noDefend ? skulls : Math.max(0, skulls - rollDice(target.defendDice).filter(r => r !== 'skull').length);
          setDiceResult({ attackRolls, defendRolls: [], damage });
          logEntry.text = `${hero.name} casts ${spell.name}! ${target.name} takes ${damage} damage.`;
        }
        const newBody = Math.max(0, target.body - damage);
        const isDead = newBody <= 0;
        if (isDead && target.id === currentQuest.victory?.bossId) bossKilled = true;
        if (isDead) logEntry.text += isDead ? ' (killed!)' : '';
        updatedMonsters = g.monsters.map(m => m.id === target.id ? { ...m, body: newBody, isDead } : m);
      } else if (spell.targeting === 'ally') {
        const target = g.heroes.find(h => h.x === tile.x && h.y === tile.y && !h.isDead);
        if (!target) return g;
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
        const swiftMonsters = g.monsters.filter(m => !m.isDead);
        const swiftAllOthers = [...g.heroes.filter(h => h.id !== hero.id && !h.isDead), ...swiftMonsters];
        setReachable(getReachableTiles(currentQuest, hero.x, hero.y, 12, swiftMonsters, swiftAllOthers));
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
      logEntry.text = `${hero.name} casts ${spell.name}.`;
      return { ...g, usedSpells: newUsed, hasActed: true, log: [...g.log, logEntry] };
    });
  };

  // ─── Roll movement ─────────────────────────────────────────────────────

  const handleRollMove = () => {
    setGame(g => {
      if (!g || g.hasRolledMove) return g;
      const hero = g.heroes[g.activeHeroIndex];
      const moves = rollMovement(hero.movement);
      const monsterBlockers = g.monsters.filter(m => !m.isDead);
      const allOthers = [...g.heroes.filter(h => h.id !== hero.id && !h.isDead), ...monsterBlockers];
      setReachable(getReachableTiles(currentQuest, hero.x, hero.y, moves, monsterBlockers, allOthers));
      setAttackable(getAdjacentPieces(hero.x, hero.y, g.monsters.filter(m => !m.isDead)));
      return {
        ...g, movesLeft: moves, hasRolledMove: true,
        log: [...g.log, { text: `${hero.name} rolls ${moves} movement.`, color: '#44aaff', time: Date.now() }],
      };
    });
  };

  // ─── Actions ──────────────────────────────────────────────────────────

  const handleAction = (action) => {
    if (action === 'end_turn') { endTurn(); return; }
    if (action === 'use_potion') { usePotion(); return; }

    setGame(g => {
      if (!g) return g;
      const hero = g.heroes[g.activeHeroIndex];

      if (action === 'disarm_trap') {
        if (g.hasActed) return g;
        const adjTrap = g.traps.find(t => t.revealed && !t.triggered &&
          Math.abs(t.x - hero.x) + Math.abs(t.y - hero.y) <= 1);
        if (!adjTrap) return g;
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
        // Each room can only be searched for treasure once
        if (g.searchedRooms.has(roomKey)) {
          return { ...g, hasActed: true, log: [...g.log, { text: `${hero.name} searches... this room has already been looted.`, color: '#555', time: Date.now() }] };
        }
        if (!g.treasureDeck.length) return { ...g, hasActed: true, log: [...g.log, { text: 'Treasure deck empty.', color: '#555', time: Date.now() }] };
        const [card, ...rest] = g.treasureDeck;
        let updatedHeroes = g.heroes, updatedMonsters = g.monsters;
        const newSearchedRooms = new Set(g.searchedRooms);
        newSearchedRooms.add(roomKey);

        if (card.type === 'gold') updatedHeroes = g.heroes.map(h => h.id === hero.id ? { ...h, gold: h.gold + card.gold } : h);
        else if (card.type === 'potion') {
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
          const candidates = [
            { x: hero.x + 1, y: hero.y }, { x: hero.x - 1, y: hero.y },
            { x: hero.x, y: hero.y + 1 }, { x: hero.x, y: hero.y - 1 },
          ].filter(t => {
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
        // Cannot search for secret doors while monsters are visible
        const monstersVisible = g.monsters.some(m => !m.isDead && revealedTiles?.has(`${m.x},${m.y}`));
        if (monstersVisible) {
          return { ...g, hasActed: true, log: [...g.log, { text: `${hero.name} cannot search with monsters nearby.`, color: '#e67e22', time: Date.now() }] };
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
      const potion = hero.equipment?.find(e => e.usable && (e.healBody || e.healMind));
      if (!potion) return g;
      const newEquip = (() => { const eq = [...(hero.equipment || [])]; const idx = eq.findIndex(e => e.id === potion.id); if (idx >= 0) eq.splice(idx, 1); return eq; })();
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
    setReachable([]); setAttackable([]); setTargetingSpell(null);
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
      const newBuffs = new Set([...(g.buffedHeroes || [])].filter(b => !b.endsWith(':rock_skin') && !b.endsWith(':veil_of_mist') && b !== 'tempest'));

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
  const hasPotion = activeHero?.equipment?.some(e => e.usable && (e.healBody || e.healMind));
  const canDisarmTrap = activeHero?.heroId === 'dwarf' && !game.hasActed &&
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
        </div>

        {/* Quest info */}
        <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 11, color: '#333' }}>
          Right-click drag to pan · Scroll to zoom
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 11, color: '#555', textAlign: 'right' }}>
          <div style={{ color: '#888' }}>{currentQuest?.name}</div>
          <div style={{ color: '#555', maxWidth: 220 }}>{currentQuest?.objective}</div>
          {game.bossKilled && <div style={{ color: '#f39c12', marginTop: 4 }}>Boss slain — reach the stairs!</div>}
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
            canDisarmTrap={i === game.activeHeroIndex && canDisarmTrap}
            isPlanningFor={planningFor === hero.id}
            onTogglePlan={i !== game.activeHeroIndex && !hero.isDead ? () => togglePlan(hero.id) : undefined}
            usedSpells={i === game.activeHeroIndex ? game.usedSpells : null}
            onCastSpell={i === game.activeHeroIndex ? handleCastSpell : undefined}
            targetingSpell={i === game.activeHeroIndex ? targetingSpell : null}
            onCancelSpell={() => setTargetingSpell(null)}
          />
        ))}

        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontSize: 10, color: '#333', marginBottom: 4 }}>QUEST LOG</div>
          <CombatLog entries={game.log} />
        </div>
      </div>

      <DiceRoller {...(diceResult || {})} visible={!!diceResult} onClose={() => setDiceResult(null)} />
      <TreasureCard card={treasureCard?.card} heroName={treasureCard?.heroName} visible={!!treasureCard} onClose={() => setTreasureCard(null)} />
    </div>
  );
}
