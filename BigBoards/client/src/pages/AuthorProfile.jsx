import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { scoreColor } from '../components/ScoreCard';
import ScoreCard from '../components/ScoreCard';

function fmt(v) { return v != null ? `${(v * 100).toFixed(1)}%` : '—'; }

export default function AuthorProfile() {
  const { userId } = useParams();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/leaderboard/authors/${userId}`)
      .then(a => { setAuthor(a); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="text-center py-24 text-gray-500">Loading...</div>;
  if (!author) return <div className="text-center py-24 text-gray-500">Author not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">{author.username}</h1>
          <p className="text-gray-500 text-sm mt-1">Member since {new Date(author.created_at).getFullYear()}</p>
        </div>
        <div className="text-right">
          {author.rep_score != null && (
            <div className="text-4xl font-black text-orange-500">{fmt(author.rep_score)}</div>
          )}
          <div className="text-sm text-gray-500">
            {author.leaderboard_rank ? `Rank #${author.leaderboard_rank}` : 'Unranked'} · {author.board_count} board{author.board_count !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Boards */}
      {author.boards.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No boards submitted yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {author.boards.map(board => (
            <div key={board.id} className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-navy-600">
                <div>
                  <Link to={`/boards/${board.id}`} className="font-semibold text-white hover:text-orange-400">
                    {board.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Submitted {new Date(board.submitted_at).toLocaleDateString()}
                    {board.is_locked && <span className="ml-2 text-orange-400">Locked</span>}
                  </p>
                </div>
                <Link to={`/boards/${board.id}`} className="text-xs text-orange-400 hover:text-orange-300">View Board</Link>
              </div>
              {board.weighted_score != null ? (
                <div className="px-5 py-4">
                  <ScoreCard scores={board} />
                </div>
              ) : (
                <div className="px-5 py-4 text-sm text-gray-500">Not yet scored — rankings not available for this draft class.</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
