import { useEffect, useRef } from 'react';

const DIE_ICONS = {
  skull: { symbol: '💀', color: '#e74c3c' },
  white_shield: { symbol: '🛡', color: '#ecf0f1' },
  black_shield: { symbol: '🛡', color: '#555' },
  helm: { symbol: '⛑', color: '#f39c12' },
};

export default function CombatLog({ entries }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  return (
    <div style={{
      background: '#0d0d1a',
      border: '1px solid #333',
      borderRadius: 8,
      padding: '8px 12px',
      height: 180,
      overflowY: 'auto',
      fontSize: 12,
      color: '#ccc',
    }}>
      {entries.length === 0 && (
        <div style={{ color: '#555', fontStyle: 'italic' }}>Quest log empty...</div>
      )}
      {entries.map((entry, i) => (
        <div key={i} style={{ marginBottom: 4, lineHeight: 1.5 }}>
          <span style={{ color: '#555', fontSize: 10, marginRight: 6 }}>
            {new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span style={{ color: entry.color || '#eee' }}>{entry.text}</span>
          {entry.rolls && (
            <span style={{ marginLeft: 8 }}>
              {entry.rolls.map((r, j) => {
                const die = DIE_ICONS[r] || { symbol: r, color: '#aaa' };
                return <span key={j} style={{ color: die.color, marginRight: 2 }}>{die.symbol}</span>;
              })}
            </span>
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
