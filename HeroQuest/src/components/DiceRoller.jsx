import { useState, useEffect, useRef } from 'react';

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

const ALL_FACES = ['skull', 'skull', 'white_shield', 'black_shield', 'black_shield', 'helm'];
const ROLL_DURATION = 700;
const SHUFFLE_MS = 55;

function randomFace() { return ALL_FACES[Math.floor(Math.random() * 6)]; }
function randomD6() { return Math.floor(Math.random() * 6) + 1; }

function DieFace({ result, dim = false, size = 48 }) {
  const color = dim ? '#444' : (FACE_COLORS[result] || '#888');
  const symbol = dim ? '?' : (FACE_SYMBOLS[result] || '?');
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: '#1a1a2e',
      border: `2px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.5,
      boxShadow: dim ? 'none' : `0 0 8px ${color}66`,
      transition: 'border-color 0.1s, box-shadow 0.1s',
    }}>
      {symbol}
    </div>
  );
}

function MoveDie({ value, dim = false, size = 56 }) {
  const color = dim ? '#444' : '#44aaff';
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: '#0a1428',
      border: `2px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.48, fontWeight: 'bold',
      color: dim ? '#444' : color,
      boxShadow: dim ? 'none' : `0 0 10px ${color}55`,
    }}>
      {dim ? '?' : value}
    </div>
  );
}

export default function DiceRoller({ attackRolls, defendRolls, damage, movementDice, movementTotal, visible, onClose }) {
  const [rolling, setRolling] = useState(false);
  const [shuffleAttack, setShuffleAttack] = useState([]);
  const [shuffleDefend, setShuffleDefend] = useState([]);
  const [shuffleMove, setShuffleMove] = useState([]);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      setRolling(false);
      clearInterval(intervalRef.current);
      clearTimeout(timerRef.current);
      return;
    }

    setRolling(true);

    const shuffle = () => {
      if (attackRolls?.length) setShuffleAttack(attackRolls.map(randomFace));
      if (defendRolls?.length) setShuffleDefend(defendRolls.map(randomFace));
      if (movementDice?.length) setShuffleMove(movementDice.map(randomD6));
    };
    shuffle();
    intervalRef.current = setInterval(shuffle, SHUFFLE_MS);

    timerRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
      setRolling(false);
    }, ROLL_DURATION);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timerRef.current);
    };
  }, [visible]);

  if (!visible) return null;

  const isMovement = !!movementDice;
  const displayAttack = rolling ? shuffleAttack : attackRolls;
  const displayDefend = rolling ? shuffleDefend : defendRolls;
  const displayMove = rolling ? shuffleMove : movementDice;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: '#000000aa',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={rolling ? undefined : onClose}
    >
      <div
        style={{
          background: '#1c1c2e', borderRadius: 12, padding: 28,
          border: '2px solid #444', minWidth: 300, textAlign: 'center',
          color: '#eee',
        }}
        onClick={e => e.stopPropagation()}
      >
        {isMovement ? (
          <>
            <h3 style={{ margin: '0 0 16px', color: '#44aaff' }}>Movement Roll</h3>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
                {(movementDice?.length ?? 2)}d6
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                {(displayMove || []).map((v, i) => (
                  <MoveDie key={i} value={v} dim={rolling} />
                ))}
              </div>
            </div>
            {!rolling && (
              <div style={{
                marginTop: 16, padding: '10px 20px',
                background: '#0d1e2e', border: '1px solid #44aaff',
                borderRadius: 8, fontSize: 22, fontWeight: 'bold', color: '#44aaff',
              }}>
                {movementTotal} spaces
              </div>
            )}
          </>
        ) : (
          <>
            <h3 style={{ margin: '0 0 16px', color: '#f39c12' }}>Combat!</h3>

            {attackRolls && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>
                  ATTACK ({attackRolls.length} {attackRolls.length === 1 ? 'die' : 'dice'})
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {(displayAttack || []).map((r, i) => <DieFace key={i} result={r} dim={rolling} />)}
                </div>
              </div>
            )}

            {defendRolls && defendRolls.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>
                  DEFENSE ({defendRolls.length} {defendRolls.length === 1 ? 'die' : 'dice'})
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {(displayDefend || []).map((r, i) => <DieFace key={i} result={r} dim={rolling} />)}
                </div>
              </div>
            )}

            {!rolling && (
              <div style={{
                marginTop: 16, padding: '10px 20px',
                background: damage > 0 ? '#c0392b22' : '#27ae6022',
                border: `1px solid ${damage > 0 ? '#c0392b' : '#27ae60'}`,
                borderRadius: 8, fontSize: 18, fontWeight: 'bold',
                color: damage > 0 ? '#e74c3c' : '#2ecc71',
              }}>
                {damage > 0 ? `${damage} damage!` : 'Blocked!'}
              </div>
            )}
          </>
        )}

        {!rolling && (
          <button onClick={onClose} style={{
            marginTop: 16, background: '#2c2c3e', color: '#eee',
            border: '1px solid #555', borderRadius: 6, padding: '8px 24px',
            cursor: 'pointer', fontSize: 14,
          }}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
