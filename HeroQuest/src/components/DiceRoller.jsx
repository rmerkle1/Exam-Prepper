import { useState } from 'react';

const FACE_COLORS = {
  skull: '#e74c3c',
  white_shield: '#ecf0f1',
  black_shield: '#7f8c8d',
  helm: '#f39c12',
};

const FACE_SYMBOLS = {
  skull: '💀',
  white_shield: '🛡️',
  black_shield: '🛡️',
  helm: '⛑️',
};

function DieFace({ result, size = 48 }) {
  const color = FACE_COLORS[result] || '#888';
  const symbol = FACE_SYMBOLS[result] || '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: '#1a1a2e',
      border: `2px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.5,
      boxShadow: `0 0 8px ${color}66`,
    }}>
      {symbol}
    </div>
  );
}

export default function DiceRoller({ attackRolls, defendRolls, damage, visible, onClose }) {
  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000000aa',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100,
    }} onClick={onClose}>
      <div style={{
        background: '#1c1c2e', borderRadius: 12, padding: 28,
        border: '2px solid #444', minWidth: 300, textAlign: 'center',
        color: '#eee',
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 16px', color: '#f39c12' }}>Combat!</h3>

        {attackRolls && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>
              ATTACK ({attackRolls.length} dice)
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {attackRolls.map((r, i) => <DieFace key={i} result={r} />)}
            </div>
          </div>
        )}

        {defendRolls && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>
              DEFENSE ({defendRolls.length} dice)
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {defendRolls.map((r, i) => <DieFace key={i} result={r} />)}
            </div>
          </div>
        )}

        <div style={{
          marginTop: 16, padding: '10px 20px',
          background: damage > 0 ? '#c0392b22' : '#27ae6022',
          border: `1px solid ${damage > 0 ? '#c0392b' : '#27ae60'}`,
          borderRadius: 8, fontSize: 18, fontWeight: 'bold',
          color: damage > 0 ? '#e74c3c' : '#2ecc71',
        }}>
          {damage > 0 ? `${damage} damage!` : 'Blocked!'}
        </div>

        <button onClick={onClose} style={{
          marginTop: 16, background: '#2c2c3e', color: '#eee',
          border: '1px solid #555', borderRadius: 6, padding: '8px 24px',
          cursor: 'pointer', fontSize: 14,
        }}>
          Continue
        </button>
      </div>
    </div>
  );
}
