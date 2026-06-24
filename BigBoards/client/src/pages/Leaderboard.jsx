import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { scoreColor } from '../components/ScoreCard';

const SORT_OPTIONS = [
  { value: 'rep_score', label: 'Reputation Score' },
  { value: 'board_count', label: 'Most Boards' },
];

const YEAR_SORT_OPTIONS = [
  { value: 'weighted_score', label: 'Weighted Score' },
  { value: 'all_around_score', label: 'All-Around' },
  { value: 'first_round_score', label: 'First Round' },
  { value: 'second_round_score', label: 'Second Round' },
  { value: 'consensus_plus_minus', label: 'Consensus +/-' },
];

function fmt(v, pm = false) {
  if (v == null) return '—';
  const s = `${(v * 100).toFixed(1)}%`;
  return pm && v >= 0 ? `+${s}` : s;
}

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draftYear, setDraftYear] = useState('');
  const [sort, setSort] = useState('rep_score');
  const [minBoards, setMinBoards] = useState(1);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    api.get('/draft-classes').then(setClasses).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort, min_boards: minBoards });
    if (draftYear) params.set('draft_year', draftYear);
    api.get(`/leaderboard?${params}`).then(r => { setRows(r); setLoading(false); }).catch(() => setLoading(false));
  }, [sort, draftYear, minBoards]);

  const sortOptions = draftYear ? YEAR_SORT_OPTIONS : SORT_OPTIONS;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-white mb-2">Leaderboard</h1>
      <p className="text-gray-400 mb-6">Authors ranked by draft accuracy across all classes.</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Draft Year</label>
          <select value={draftYear} onChange={e => { setDraftYear(e.target.value); setSort(e.target.value ? 'weighted_score' : 'rep_score'); }}
            className="bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500">
            <option value="">All time</option>
            {classes.map(c => <option key={c.year} value={c.year}>{c.year}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Sort by</label>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500">
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {!draftYear && (
          <div>
            <label className="text-xs text-gray-500 block mb-1">Min boards</label>
            <select value={minBoards} onChange={e => setMinBoards(e.target.value)}
              className="bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500">
              {[1, 2, 3, 5].map(n => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No results found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-navy-600">
                <th className="pb-2 pr-3 w-10">#</th>
                <th className="pb-2 pr-4">Author</th>
                {draftYear ? (
                  <>
                    <th className="pb-2 pr-3 text-right">All-Around</th>
                    <th className="pb-2 pr-3 text-right">1st Rd</th>
                    <th className="pb-2 pr-3 text-right">2nd Rd</th>
                    <th className="pb-2 pr-3 text-right">Weighted</th>
                    <th className="pb-2 text-right">Vs Consensus</th>
                  </>
                ) : (
                  <>
                    <th className="pb-2 pr-3 text-right">Rep Score</th>
                    <th className="pb-2 text-right">Boards</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.user_id} className="border-b border-navy-700 hover:bg-navy-800/50">
                  <td className="py-3 pr-3 text-gray-500 font-bold">{i + 1}</td>
                  <td className="py-3 pr-4">
                    <Link to={`/authors/${r.user_id}`} className="text-white hover:text-orange-400 font-medium">{r.username}</Link>
                    {draftYear && r.board_id && (
                      <Link to={`/boards/${r.board_id}`} className="block text-xs text-gray-500 hover:text-gray-400">{r.title}</Link>
                    )}
                  </td>
                  {draftYear ? (
                    <>
                      <td className={`py-3 pr-3 text-right font-semibold ${scoreColor(r.all_around_score)}`}>{fmt(r.all_around_score)}</td>
                      <td className={`py-3 pr-3 text-right font-semibold ${scoreColor(r.first_round_score)}`}>{fmt(r.first_round_score)}</td>
                      <td className={`py-3 pr-3 text-right font-semibold ${scoreColor(r.second_round_score)}`}>{fmt(r.second_round_score)}</td>
                      <td className={`py-3 pr-3 text-right font-bold ${scoreColor(r.weighted_score)}`}>{fmt(r.weighted_score)}</td>
                      <td className={`py-3 text-right font-semibold ${r.consensus_plus_minus >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(r.consensus_plus_minus, true)}</td>
                    </>
                  ) : (
                    <>
                      <td className={`py-3 pr-3 text-right font-bold ${scoreColor(r.rep_score)}`}>{fmt(r.rep_score)}</td>
                      <td className="py-3 text-right text-gray-400">{r.board_count}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
