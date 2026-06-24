import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function TrueValueRankings() {
  const { year } = useParams();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedYear, setSelectedYear] = useState(year || '');
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/draft-classes').then(cs => {
      setClasses(cs);
      if (!selectedYear && cs.length > 0) setSelectedYear(String(cs[0].year));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedYear) return;
    setLoading(true);
    api.get(`/draft-classes/${selectedYear}/true-value`)
      .then(r => { setRankings(r); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedYear]);

  function handleYearChange(y) {
    setSelectedYear(y);
    navigate(`/true-value/${y}`, { replace: true });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-white mb-2">True Value Rankings</h1>
      <p className="text-gray-400 mb-6">Players ranked by cumulative career points — the ground truth for scoring big boards.</p>

      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm text-gray-400">Draft Class:</label>
        <select
          value={selectedYear}
          onChange={e => handleYearChange(e.target.value)}
          className="bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500"
        >
          {classes.map(c => <option key={c.year} value={c.year}>{c.year}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No rankings available yet for {selectedYear}.</p>
          <p className="text-gray-600 text-sm mt-1">Rankings are computed after player stats are entered.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-navy-600">
                <th className="pb-2 pr-4 w-12">Rank</th>
                <th className="pb-2 pr-4">Player</th>
                <th className="pb-2 pr-4">Position</th>
                <th className="pb-2 pr-4">NBA Pick</th>
                <th className="pb-2 pr-4">Team</th>
                <th className="pb-2 text-right">Career Pts</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r, i) => (
                <tr key={r.player_id} className="border-b border-navy-700 hover:bg-navy-800/50">
                  <td className="py-3 pr-4">
                    <span className={`rank-badge text-xs font-bold ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-navy-700 text-gray-300'}`}>
                      {r.true_rank}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-medium text-white">{r.name}</td>
                  <td className="py-3 pr-4 text-gray-400">{r.position || '—'}</td>
                  <td className="py-3 pr-4 text-gray-400">{r.draft_pick ? `#${r.draft_pick}` : '—'}</td>
                  <td className="py-3 pr-4 text-gray-400">{r.draft_team || '—'}</td>
                  <td className="py-3 text-right">
                    <span className="font-bold text-orange-400">{r.career_points}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
