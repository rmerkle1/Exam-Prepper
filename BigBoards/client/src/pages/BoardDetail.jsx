import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ScoreCard from '../components/ScoreCard';

function diffColor(diff) {
  if (diff == null) return 'text-gray-600';
  const abs = Math.abs(diff);
  if (abs <= 3) return 'text-green-400';
  if (abs <= 8) return 'text-yellow-400';
  if (abs <= 15) return 'text-orange-400';
  return 'text-red-400';
}

export default function BoardDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get(`/boards/${id}`).then(b => { setBoard(b); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this big board? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/boards/${id}`);
      navigate('/');
    } catch (err) {
      alert(err.message);
      setDeleting(false);
    }
  }

  if (loading) return <div className="text-center py-24 text-gray-500">Loading...</div>;
  if (!board) return <div className="text-center py-24 text-gray-500">Board not found.</div>;

  const canDelete = user && (user.id === board.user_id || user.is_admin) && !board.is_locked;
  const scored = board.weighted_score != null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/leaderboard" className="hover:text-gray-300">Leaderboard</Link>
        <span>/</span>
        <Link to={`/authors/${board.user_id}`} className="hover:text-gray-300">{board.username}</Link>
        <span>/</span>
        <span className="text-gray-300">{board.draft_year}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-white">{board.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            By <Link to={`/authors/${board.user_id}`} className="text-orange-400 hover:text-orange-300">{board.username}</Link>
            {' '}&middot; {board.draft_year} Draft Class
            {' '}&middot; Submitted {new Date(board.submitted_at).toLocaleDateString()}
            {board.is_locked && <span className="ml-2 bg-orange-900/40 text-orange-400 border border-orange-800 text-xs px-2 py-0.5 rounded-full">Locked</span>}
          </p>
        </div>
        {canDelete && (
          <button onClick={handleDelete} disabled={deleting}
            className="text-sm text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 px-3 py-1.5 rounded-lg transition-colors">
            {deleting ? 'Deleting...' : 'Delete Board'}
          </button>
        )}
      </div>

      {/* Scores */}
      {scored ? (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Accuracy Scores</h2>
          <ScoreCard scores={board} />
        </div>
      ) : (
        <div className="bg-navy-800 border border-navy-600 rounded-xl px-4 py-3 mb-6 text-sm text-gray-500">
          Scores not yet available — true value rankings need player data for the {board.draft_year} draft class.
        </div>
      )}

      {/* Entries table */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Rankings ({board.entries.length} players)</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-navy-600">
              <th className="pb-2 pr-3 w-10">Pick</th>
              <th className="pb-2 pr-4">Player</th>
              <th className="pb-2 pr-3 text-center">True Rank</th>
              <th className="pb-2 pr-3 text-center">Diff</th>
              <th className="pb-2 pr-3">Team</th>
              <th className="pb-2 pr-3 text-right">Career Pts</th>
              <th className="pb-2 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {board.entries.map(e => {
              const diff = e.true_rank != null ? e.rank - e.true_rank : null;
              return (
                <tr key={e.id} className="border-b border-navy-700 hover:bg-navy-800/50">
                  <td className="py-2.5 pr-3">
                    <span className={`rank-badge text-xs ${e.rank <= 30 ? 'bg-navy-700 text-gray-200' : 'bg-navy-800 text-gray-400'}`}>{e.rank}</span>
                  </td>
                  <td className="py-2.5 pr-4 font-medium text-white">
                    {e.player_name}
                    {!e.player_id && <span className="ml-2 text-xs text-gray-600" title="Not yet matched to database player">?</span>}
                  </td>
                  <td className="py-2.5 pr-3 text-center text-gray-400">{e.true_rank ?? '—'}</td>
                  <td className={`py-2.5 pr-3 text-center font-semibold ${diffColor(diff)}`}>
                    {diff != null ? (diff > 0 ? `+${diff}` : diff) : '—'}
                  </td>
                  <td className="py-2.5 pr-3 text-gray-500 text-xs">{e.team || e.draft_team || '—'}</td>
                  <td className="py-2.5 pr-3 text-right text-orange-400 font-bold">{e.career_points ?? '—'}</td>
                  <td className="py-2.5 text-right">
                    {e.player_score != null
                      ? <span className={`font-bold ${e.player_score >= 0.85 ? 'text-green-400' : e.player_score >= 0.7 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {(e.player_score * 100).toFixed(0)}%
                        </span>
                      : <span className="text-gray-600">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {board.entries.some(e => !e.player_id) && (
        <p className="text-xs text-gray-600 mt-3">Players marked with ? have not been matched to the database yet. Scores will appear after an admin links them.</p>
      )}
    </div>
  );
}
