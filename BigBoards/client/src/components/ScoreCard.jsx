import React from 'react';

function scoreColor(score) {
  if (score === null || score === undefined) return 'text-gray-500';
  if (score >= 0.85) return 'text-green-400';
  if (score >= 0.70) return 'text-yellow-400';
  if (score >= 0.55) return 'text-orange-400';
  return 'text-red-400';
}

function ScoreStat({ label, value, format = 'pct' }) {
  const display = value === null || value === undefined
    ? '—'
    : format === 'pct' ? `${(value * 100).toFixed(1)}%`
    : format === 'pm' ? `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`
    : value;

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className={`text-lg font-bold ${format === 'pm' ? (value >= 0 ? 'text-green-400' : 'text-red-400') : scoreColor(value)}`}>
        {display}
      </span>
    </div>
  );
}

export default function ScoreCard({ scores }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-navy-800 border border-navy-600 rounded-xl p-4">
      <ScoreStat label="All-Around" value={scores?.all_around_score} />
      <ScoreStat label="First Round" value={scores?.first_round_score} />
      <ScoreStat label="Second Round" value={scores?.second_round_score} />
      <ScoreStat label="Weighted Score" value={scores?.weighted_score} />
      {scores?.consensus_plus_minus !== undefined && (
        <ScoreStat label="Consensus +/-" value={scores.consensus_plus_minus} format="pm" />
      )}
    </div>
  );
}

export { ScoreStat, scoreColor };
