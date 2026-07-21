import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { scoreColor } from '../components/ScoreCard';

function fmt(score) {
  return score != null ? `${(score * 100).toFixed(1)}%` : '—';
}

export default function DraftClass() {
  const { year } = useParams();
  const [dc, setDc] = useState(null);
  const [boards, setBoards] = useState([]);
  const [tab, setTab] = useState('players');
  const [loading, setLoading] = useState(true);
  const [consensus, setConsensus] = useState(null);
  const [consensusLoading, setConsensusLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/draft-classes/${year}`),
      api.get(`/draft-classes/${year}/boards`),
    ]).then(([dcData, boardsData]) => {
      setDc(dcData);
      setBoards(boardsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [year]);

  useEffect(() => {
    if (tab !== 'consensus' || consensus !== null) return;
    setConsensusLoading(true);
    api.get(`/draft-classes/${year}/consensus`)
      .then(data => { setConsensus(data); setConsensusLoading(false); })
      .catch(() => setConsensusLoading(false));
  }, [tab, year, consensus]);

  if (loading) return <div className="text-center py-24 text-gray-500">Loading...</div>;
  if (!dc) return <div className="text-center py-24 text-gray-500">Draft class not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-1">
        <Link to="/draft-classes" className="text-gray-500 hover:text-gray-300 text-sm">Draft Classes</Link>
        <span className="text-gray-600">/</span>
        <span className="text-gray-300 text-sm">{year}</span>
      </div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-4xl font-black text-white">{year} Draft Class</h1>
          <p className="text-gray-400 mt-1">{dc.player_count} players · {dc.board_count} big boards</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {dc.is_locked
            ? <span className="text-sm bg-orange-900/40 text-orange-400 border border-orange-800 px-3 py-1 rounded-full">Locked</span>
            : <span className="text-sm bg-green-900/40 text-green-400 border border-green-800 px-3 py-1 rounded-full">Open — closes {dc.lock_date}</span>}
          <Link to={`/true-value/${year}`} className="text-xs text-orange-400 hover:text-orange-300">True Value Rankings</Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-navy-600 mb-6 gap-6">
        {['players', 'boards', 'consensus'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-2 text-sm font-medium capitalize transition-colors border-b-2 ${tab === t ? 'border-orange-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            {t === 'players' ? 'True Value Ranking' : t === 'boards' ? `Big Boards (${boards.length})` : 'Consensus Board'}
          </button>
        ))}
      </div>

      {tab === 'players' && (
        <div className="overflow-x-auto">
          {dc.players.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No players added yet. Admins can add players in the admin panel.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-navy-600">
                  <th className="pb-2 pr-4 w-12">Rank</th>
                  <th className="pb-2 pr-4">Player</th>
                  <th className="pb-2 pr-4">Position</th>
                  <th className="pb-2 pr-4">NBA Pick</th>
                  <th className="pb-2 text-right">Career Pts</th>
                </tr>
              </thead>
              <tbody>
                {dc.players.map((p, i) => (
                  <tr key={p.id} className="border-b border-navy-700 hover:bg-navy-800/50">
                    <td className="py-3 pr-4">
                      <span className={`rank-badge ${i < 3 ? 'bg-orange-500 text-white' : 'bg-navy-700 text-gray-300'}`}>{p.true_rank || '—'}</span>
                    </td>
                    <td className="py-3 pr-4 font-medium text-white">
                      <Link to={`/players/${p.id}`} className="hover:text-orange-400 transition-colors">{p.name}</Link>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{p.position || '—'}</td>
                    <td className="py-3 pr-4 text-gray-400">{p.draft_pick ? `#${p.draft_pick}` : '—'}</td>
                    <td className="py-3 text-right font-bold text-orange-400">{p.career_points ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'boards' && (
        <div>
          {boards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No boards submitted yet.</p>
              <Link to="/upload" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg">Upload Yours</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-navy-600">
                    <th className="pb-2 pr-4">Author</th>
                    <th className="pb-2 pr-4">Title</th>
                    <th className="pb-2 pr-3 text-right">All-Around</th>
                    <th className="pb-2 pr-3 text-right">1st Round</th>
                    <th className="pb-2 pr-3 text-right">2nd Round</th>
                    <th className="pb-2 text-right">Weighted</th>
                  </tr>
                </thead>
                <tbody>
                  {boards.map(b => (
                    <tr key={b.id} className="border-b border-navy-700 hover:bg-navy-800/50">
                      <td className="py-3 pr-4">
                        <Link to={`/authors/${b.user_id}`} className="text-orange-400 hover:text-orange-300 font-medium">{b.username}</Link>
                      </td>
                      <td className="py-3 pr-4">
                        <Link to={`/boards/${b.id}`} className="text-gray-300 hover:text-white">{b.title}</Link>
                      </td>
                      <td className={`py-3 pr-3 text-right font-semibold ${scoreColor(b.all_around_score)}`}>{fmt(b.all_around_score)}</td>
                      <td className={`py-3 pr-3 text-right font-semibold ${scoreColor(b.first_round_score)}`}>{fmt(b.first_round_score)}</td>
                      <td className={`py-3 pr-3 text-right font-semibold ${scoreColor(b.second_round_score)}`}>{fmt(b.second_round_score)}</td>
                      <td className={`py-3 text-right font-bold ${scoreColor(b.weighted_score)}`}>{fmt(b.weighted_score)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'consensus' && (
        <div>
          {consensusLoading ? (
            <div className="text-center py-16 text-gray-500">Loading...</div>
          ) : !consensus || consensus.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">No consensus board available yet.</p>
              <p className="text-gray-600 text-sm mt-1">
                {dc.is_locked
                  ? 'No matched entries found in locked boards.'
                  : 'Consensus is computed from locked boards once the draft class closes.'}
              </p>
            </div>
          ) : (() => {
            const trueRankMap = {};
            (dc.players || []).forEach(p => { if (p.true_rank != null) trueRankMap[p.id] = p.true_rank; });
            const lockedBoardCount = boards.filter(b => b.is_locked).length;
            return (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Average rank across {lockedBoardCount} locked board{lockedBoardCount !== 1 ? 's' : ''}.
                  {' '}Players appearing on fewer boards rank lower.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-navy-600">
                        <th className="pb-2 pr-3 w-12">Rank</th>
                        <th className="pb-2 pr-4">Player</th>
                        <th className="pb-2 pr-4">Position</th>
                        <th className="pb-2 pr-4">NBA Pick</th>
                        <th className="pb-2 pr-4 text-right">Avg Rank</th>
                        <th className="pb-2 text-right">True Rank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consensus.map((row, i) => {
                        const trueRank = trueRankMap[row.player_id];
                        const diff = trueRank != null ? row.consensus_rank - trueRank : null;
                        return (
                          <tr key={row.player_id} className="border-b border-navy-700 hover:bg-navy-800/50">
                            <td className="py-3 pr-3">
                              <span className={`rank-badge text-xs font-bold ${i < 3 ? 'bg-orange-500 text-white' : 'bg-navy-700 text-gray-300'}`}>
                                {row.consensus_rank}
                              </span>
                            </td>
                            <td className="py-3 pr-4 font-medium text-white">
                              <Link to={`/players/${row.player_id}`} className="hover:text-orange-400 transition-colors">
                                {row.player ? row.player.name : `Player #${row.player_id}`}
                              </Link>
                            </td>
                            <td className="py-3 pr-4 text-gray-400">{row.player?.position || '—'}</td>
                            <td className="py-3 pr-4 text-gray-400">{row.player?.draft_pick ? `#${row.player.draft_pick}` : '—'}</td>
                            <td className="py-3 pr-4 text-right text-gray-300">{row.avg_rank.toFixed(1)}</td>
                            <td className="py-3 text-right">
                              {trueRank != null ? (
                                <span className="text-gray-400">
                                  #{trueRank}
                                  {diff !== 0 && (
                                    <span className={`ml-1.5 text-xs font-semibold ${Math.abs(diff) <= 3 ? 'text-green-400' : Math.abs(diff) <= 8 ? 'text-yellow-400' : 'text-red-400'}`}>
                                      ({diff > 0 ? `+${diff}` : diff})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-gray-600">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
