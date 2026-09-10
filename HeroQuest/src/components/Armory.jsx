import { useState } from 'react';
import { buyItem, getEffectiveAttack, getEffectiveDefend } from '../data/armory.js';

const CATEGORIES = ['weapon', 'armour', 'potion', 'tool', 'usable'];
const CAT_LABEL = { weapon: 'Weapons', armour: 'Armour', potion: 'Potions', tool: 'Tools', usable: 'Items' };

function HeroCard({ hero, onBuy, armoryItems }) {
  const colorHex = '#' + hero.color.toString(16).padStart(6, '0');
  const ownedIds = new Set((hero.equipment || []).map(e => e.id));

  return (
    <div style={{
      background: '#1a1a2e', border: `2px solid ${colorHex}`,
      borderRadius: 10, padding: 16, flex: '1 1 200px', minWidth: 200,
      boxShadow: `0 0 16px ${colorHex}44`,
    }}>
      {/* Hero header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: colorHex }} />
        <span style={{ color: colorHex, fontWeight: 'bold', fontSize: 15 }}>{hero.name}</span>
      </div>

      {/* Stats */}
      <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8, lineHeight: 1.8 }}>
        <div>Body: <span style={{ color: '#e74c3c' }}>{hero.maxBody}</span> &nbsp; Mind: <span style={{ color: '#9b59b6' }}>{hero.maxMind}</span></div>
        <div>Attack: <span style={{ color: '#e67e22' }}>{getEffectiveAttack(hero)} dice</span></div>
        <div>Defense: <span style={{ color: '#2ecc71' }}>{getEffectiveDefend(hero)} dice</span></div>
        <div style={{ color: '#f1c40f', marginTop: 4 }}>Gold: {hero.gold} gp</div>
      </div>

      {/* Equipment */}
      {hero.equipment?.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>EQUIPPED</div>
          {hero.equipment.map(e => (
            <div key={e.id} style={{ fontSize: 11, color: '#88aacc', lineHeight: 1.6 }}>
              {e.name} {e.attackBonus ? `(+${e.attackBonus}ATK)` : ''}{e.defendBonus ? `(+${e.defendBonus}DEF)` : ''}
            </div>
          ))}
        </div>
      )}

      {/* Buy buttons per category */}
      {CATEGORIES.map(cat => {
        const items = armoryItems.filter(i => i.category === cat);
        return (
          <div key={cat} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: '#444', letterSpacing: 1, marginBottom: 4 }}>{CAT_LABEL[cat].toUpperCase()}</div>
            {items.map(item => {
              const owned = ownedIds.has(item.id);
              const canAfford = hero.gold >= item.cost;
              const restricted = item.forbiddenHeroes?.includes(hero.heroId);
              const replacedByOwned = (() => {
                if (!item.replaces) return false;
                return ARMORY_ITEMS.some(better =>
                  better.slot === item.slot &&
                  (Array.isArray(better.replaces) ? better.replaces.includes(item.id) : better.replaces === item.id) &&
                  ownedIds.has(better.id)
                );
              })();
              const incompatible = item.incompatibleWith?.some(id => ownedIds.has(id)) ||
                (hero.equipment || []).some(e => e.incompatibleWith?.includes(item.id));
              const unavailable = owned || restricted || replacedByOwned || incompatible;

              return (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '4px 0', borderBottom: '1px solid #1e1e30',
                  opacity: unavailable ? 0.4 : 1,
                }}>
                  <div>
                    <span style={{ fontSize: 12, color: '#ccc' }}>{item.name}</span>
                    <span style={{ fontSize: 10, color: '#666', marginLeft: 6 }}>{item.desc}</span>
                  </div>
                  <button
                    disabled={unavailable || !canAfford}
                    onClick={() => onBuy(item)}
                    style={{
                      background: unavailable ? '#222' : canAfford ? '#1a3a1a' : '#2a1a1a',
                      color: unavailable ? '#444' : canAfford ? '#4caf50' : '#c0392b',
                      border: `1px solid ${unavailable ? '#333' : canAfford ? '#2e7d32' : '#7f1d1d'}`,
                      borderRadius: 4, padding: '3px 8px', fontSize: 11,
                      cursor: unavailable || !canAfford ? 'default' : 'pointer',
                      minWidth: 60, textAlign: 'right',
                    }}
                  >
                    {owned ? 'Owned' : restricted ? 'Restricted' : incompatible ? 'Incompatible' : replacedByOwned ? 'Outclassed' : `${item.cost} gp`}
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function Armory({ heroes, questName, nextQuestName, onContinue, armoryItems }) {
  const [localHeroes, setLocalHeroes] = useState(
    heroes.map(h => ({ ...h, body: h.maxBody, mind: h.maxMind })) // full heal between quests
  );
  const [errors, setErrors] = useState({});

  const handleBuy = (heroId, item) => {
    const hero = localHeroes.find(h => h.id === heroId);
    const { updatedHero, error } = buyItem(hero, item);
    if (error) {
      setErrors(e => ({ ...e, [heroId]: error }));
      setTimeout(() => setErrors(e => ({ ...e, [heroId]: null })), 2000);
      return;
    }
    setLocalHeroes(prev => prev.map(h => h.id === heroId ? updatedHero : h));
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0d0d1a', color: '#eee',
      fontFamily: 'sans-serif', padding: '32px 24px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: '#555', letterSpacing: 3, marginBottom: 8 }}>
          {questName} — COMPLETE
        </div>
        <h1 style={{ color: '#c0963c', fontSize: 36, margin: 0, letterSpacing: 3 }}>THE ARMORY</h1>
        <p style={{ color: '#666', margin: '8px 0 0' }}>
          Heroes rest and recover all Body and Mind Points.
          {nextQuestName && <> Next: <span style={{ color: '#aaa' }}>{nextQuestName}</span></>}
        </p>
      </div>

      {/* Hero cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
        {localHeroes.filter(h => !h.isDead).map(hero => (
          <div key={hero.id} style={{ position: 'relative' }}>
            <HeroCard hero={hero} onBuy={(item) => handleBuy(hero.id, item)} armoryItems={armoryItems} />
            {errors[hero.id] && (
              <div style={{
                position: 'absolute', bottom: -24, left: 0, right: 0,
                textAlign: 'center', fontSize: 11, color: '#e74c3c',
              }}>
                {errors[hero.id]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Continue */}
      <div style={{ textAlign: 'center' }}>
        <button onClick={() => onContinue(localHeroes)} style={{
          background: '#c0963c', color: '#111', border: 'none',
          borderRadius: 8, padding: '14px 48px', fontSize: 18,
          fontWeight: 'bold', cursor: 'pointer', letterSpacing: 2,
        }}>
          {nextQuestName ? `BEGIN: ${nextQuestName.toUpperCase()}` : 'COMPLETE CAMPAIGN'}
        </button>
      </div>
    </div>
  );
}
