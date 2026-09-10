import { SPELLS } from '../data/spells.js';

export default function SpellPanel({ hero, usedSpells, canCast, onCastSpell, targetingSpell, onCancelSpell }) {
  if (!hero || hero.spells.length === 0) return null;

  const available = hero.spells.filter(id => !usedSpells.has(`${hero.id}:${id}`));
  if (available.length === 0) return null;

  return (
    <div style={{
      background: '#0d0d20',
      border: '1px solid #4a3080',
      borderRadius: 8, padding: '8px 10px',
      marginTop: 4,
    }}>
      <div style={{ fontSize: 10, color: '#7a50c0', letterSpacing: 1, marginBottom: 6 }}>
        SPELLS
      </div>

      {targetingSpell && (
        <div style={{ fontSize: 11, color: '#9b59b6', marginBottom: 6 }}>
          Click a target on the board
          <button onClick={onCancelSpell} style={{
            marginLeft: 8, background: 'none', border: '1px solid #555',
            color: '#aaa', borderRadius: 4, padding: '1px 6px', fontSize: 10, cursor: 'pointer',
          }}>
            Cancel
          </button>
        </div>
      )}

      {!canCast && (
        <div style={{ fontSize: 10, color: '#665', marginBottom: 4, fontStyle: 'italic' }}>
          Spells unavailable — already acted this turn.
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {available.map(id => {
          const spell = SPELLS[id];
          if (!spell) return null;
          const isActive = targetingSpell?.id === id;
          const blocked = !canCast && !isActive;
          return (
            <button
              key={id}
              onClick={() => onCastSpell(spell)}
              title={blocked ? 'Cannot cast — already acted this turn.' : spell.desc}
              disabled={blocked}
              style={{
                background: isActive ? '#4a3080' : '#1a1030',
                border: `1px solid ${isActive ? '#9b59b6' : '#3a2060'}`,
                borderRadius: 5, padding: '4px 8px',
                color: blocked ? '#555' : '#ddd', fontSize: 11,
                cursor: blocked ? 'default' : 'pointer',
                opacity: blocked ? 0.4 : 1,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <span>{spell.icon}</span>
              <span>{spell.name}</span>
            </button>
          );
        })}
      </div>

      {hero.spells.filter(id => usedSpells.has(`${hero.id}:${id}`)).length > 0 && (
        <div style={{ fontSize: 10, color: '#444', marginTop: 6 }}>
          Used: {hero.spells.filter(id => usedSpells.has(`${hero.id}:${id}`)).map(id => SPELLS[id]?.name).join(', ')}
        </div>
      )}
    </div>
  );
}
