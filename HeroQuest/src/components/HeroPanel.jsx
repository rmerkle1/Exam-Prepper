import SpellPanel from './SpellPanel.jsx';

function StatBar({ value, max, color }) {
  return (
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {Array.from({ length: max }, (_, i) => (
        <div key={i} style={{
          width: 13, height: 13, borderRadius: 3,
          background: i < value ? color : '#2a2a2a',
          border: '1px solid #444',
          transition: 'background 0.2s',
        }} />
      ))}
    </div>
  );
}

export default function HeroPanel({
  hero,
  isActive,
  isMyHero,
  movesLeft,
  onAction,
  hasPotion,
  canRest,
  throwableWeapons,
  isPlanningFor,
  onTogglePlan,
  usedSpells,
  onCastSpell,
  targetingSpell,
  onCancelSpell,
  canDisarmTrap,
  targetingItem,
}) {
  if (!hero) return null;
  const colorHex = '#' + hero.color.toString(16).padStart(6, '0');
  const isDead = hero.isDead;

  return (
    <div style={{
      background: isDead ? '#0d0d0d' : '#1c1c2e',
      border: `2px solid ${isActive ? colorHex : isPlanningFor ? '#8866cc' : '#2a2a3a'}`,
      borderRadius: 8, padding: '10px 12px', color: isDead ? '#444' : '#eee',
      opacity: isDead ? 0.5 : 1,
      boxShadow: isActive ? `0 0 12px ${colorHex}66` : isPlanningFor ? '0 0 10px #8866cc55' : 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: colorHex, flexShrink: 0 }} />
        <strong style={{ color: isDead ? '#555' : colorHex, fontSize: 13 }}>{hero.name}</strong>
        {isDead && <span style={{ fontSize: 10, color: '#555', marginLeft: 'auto' }}>FALLEN</span>}
        {isActive && !isDead && (
          <span style={{ fontSize: 10, color: '#aaa', marginLeft: 'auto' }}>
            {isMyHero ? '← YOUR TURN' : 'ACTIVE'}
          </span>
        )}
        {!isDead && onTogglePlan && (
          <button onClick={onTogglePlan} style={{
            marginLeft: 'auto', background: isPlanningFor ? '#4a2a80' : '#1a1a2e',
            border: `1px solid ${isPlanningFor ? '#8866cc' : '#333'}`,
            borderRadius: 4, padding: '2px 7px', fontSize: 10, color: '#aaa', cursor: 'pointer',
          }}>
            {isPlanningFor ? 'Planning...' : 'Plan'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ marginBottom: 5 }}>
        <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>
          BODY {hero.body}/{hero.maxBody}
          {hero.gold > 0 && <span style={{ marginLeft: 10, color: '#c0963c' }}>🪙 {hero.gold}</span>}
        </div>
        <StatBar value={hero.body} max={hero.maxBody} color="#e74c3c" />
      </div>

      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>MIND {hero.mind}/{hero.maxMind}</div>
        <StatBar value={hero.mind} max={hero.maxMind} color="#9b59b6" />
      </div>

      {/* Equipment */}
      {hero.equipment.length > 0 && (
        <div style={{ fontSize: 10, color: '#888', marginBottom: 6 }}>
          {hero.equipment.map(e => e.name).join(', ')}
        </div>
      )}

      {/* Intent display for any planning hero */}
      {isPlanningFor && (
        <div style={{ fontSize: 10, color: '#8866cc', marginBottom: 4 }}>
          Click a tile on the board to set route plan.
        </div>
      )}

      {/* Active hero actions */}
      {isActive && isMyHero && !isDead && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {movesLeft > 0 && (
            <div style={{ fontSize: 11, color: '#44aaff' }}>
              Moves remaining: {movesLeft}
            </div>
          )}
          {targetingItem === 'holy_water' && (
            <div style={{ fontSize: 10, color: '#aaffaa' }}>Click an undead monster to destroy it.</div>
          )}

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <ActionBtn onClick={() => onAction('search_treasure')} label="Search Treasure" icon="📦" />
            <ActionBtn onClick={() => onAction('search_traps')}    label="Search Traps"    icon="🔍" />
            <ActionBtn onClick={() => onAction('search_secret')}   label="Secret Door"     icon="🚪" />
            {canDisarmTrap && (
              <ActionBtn onClick={() => onAction('disarm_trap')} label="Disarm Trap" icon="🔧" />
            )}
            {canRest && (
              <ActionBtn onClick={() => onAction('rest')} label="Rest (+1 Body)" icon="💤" />
            )}
            {throwableWeapons?.map(w => (
              <ActionBtn key={w.id} onClick={() => onAction(`throw:${w.id}`)} label={`Throw ${w.name}`} icon="🎯" />
            ))}
            {hasPotion && (
              <ActionBtn onClick={() => onAction('use_potion')} label="Drink Potion" icon="🧪" />
            )}
            {hero.equipment?.some(e => e.isHolyWater) && (
              <ActionBtn onClick={() => onAction('use_holy_water')} label="Holy Water" icon="💧" />
            )}
            {hero.equipment?.some(e => e.isWand) && (
              <ActionBtn onClick={() => onAction('use_wand')} label="Wand of Magic" icon="🪄" />
            )}
            <ActionBtn onClick={() => onAction('end_turn')} label="End Turn" danger />
          </div>

          {/* Spells */}
          {usedSpells && onCastSpell && (
            <SpellPanel
              hero={hero}
              usedSpells={usedSpells}
              onCastSpell={onCastSpell}
              targetingSpell={targetingSpell}
              onCancelSpell={onCancelSpell}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ onClick, label, icon, danger }) {
  return (
    <button onClick={onClick} style={{
      background: danger ? '#3a0a0a' : '#1e1e32',
      color: danger ? '#e74c3c' : '#ccc',
      border: `1px solid ${danger ? '#5a1010' : '#333'}`,
      borderRadius: 5, padding: '4px 8px', fontSize: 11, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 3,
    }}>
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}
