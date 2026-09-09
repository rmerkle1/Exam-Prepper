const TYPE_STYLES = {
  gold:    { color: '#f1c40f', icon: '🪙', bg: '#2a2200' },
  potion:  { color: '#2ecc71', icon: '🧪', bg: '#002a14' },
  item:    { color: '#9b59b6', icon: '📦', bg: '#1a0028' },
  monster: { color: '#e74c3c', icon: '💀', bg: '#2a0000' },
  trap:    { color: '#e67e22', icon: '⚠️', bg: '#2a1000' },
};

export default function TreasureCard({ card, heroName, visible, onClose }) {
  if (!visible || !card) return null;

  const style = TYPE_STYLES[card.type] || TYPE_STYLES.item;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000000bb',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200,
    }} onClick={onClose}>
      <div style={{
        background: style.bg,
        border: `2px solid ${style.color}`,
        borderRadius: 14, padding: '32px 40px',
        minWidth: 280, textAlign: 'center', color: '#eee',
        boxShadow: `0 0 40px ${style.color}55`,
      }} onClick={e => e.stopPropagation()}>

        <div style={{ fontSize: 11, color: '#666', letterSpacing: 2, marginBottom: 12 }}>
          TREASURE CARD
        </div>

        <div style={{ fontSize: 60, marginBottom: 12 }}>{style.icon}</div>

        <div style={{ fontSize: 22, fontWeight: 'bold', color: style.color, marginBottom: 8 }}>
          {card.label}
        </div>

        {card.type === 'gold' && (
          <div style={{ fontSize: 14, color: '#aaa', marginBottom: 16 }}>
            {heroName} gains {card.gold} gold coins.
          </div>
        )}

        {card.type === 'potion' && (
          <div style={{ fontSize: 14, color: '#aaa', marginBottom: 16 }}>
            {heroName} restores {card.heal} {card.healType === 'mind' ? 'Mind' : 'Body'} Point{card.heal !== 1 ? 's' : ''}.
          </div>
        )}

        {card.type === 'item' && (
          <div style={{ fontSize: 14, color: '#aaa', marginBottom: 16 }}>
            {card.desc}
          </div>
        )}

        {card.type === 'monster' && (
          <div style={{ fontSize: 14, color: '#e74c3c', marginBottom: 16 }}>
            A wandering monster has entered the dungeon!
          </div>
        )}

        {card.type === 'trap' && (
          <div style={{ fontSize: 14, color: '#e67e22', marginBottom: 16 }}>
            {heroName} takes {card.damage} Body Point{card.damage !== 1 ? 's' : ''} of damage!
          </div>
        )}

        <button onClick={onClose} style={{
          background: style.color, color: '#111', border: 'none',
          borderRadius: 6, padding: '8px 28px', fontSize: 14,
          cursor: 'pointer', fontWeight: 'bold',
        }}>
          OK
        </button>
      </div>
    </div>
  );
}
