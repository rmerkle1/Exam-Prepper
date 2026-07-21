import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';

const AWARDS = [
  { key: 'is_allstar',    label: 'AS',  title: 'All-Star',        pts: 5  },
  { key: 'is_allnba',     label: 'AN',  title: 'All-NBA',         pts: 7  },
  { key: 'is_mvp',        label: 'MVP', title: 'MVP',             pts: 10 },
  { key: 'is_alldefense', label: 'AD',  title: 'All-Defense',     pts: 5  },
  { key: 'is_allrookie',  label: 'AR',  title: 'All-Rookie',      pts: 5  },
  { key: 'is_roy',        label: 'ROY', title: 'Rookie of Year',  pts: 5  },
  { key: 'is_sixth_man',  label: '6M',  title: 'Sixth Man',       pts: 5  },
];

function StatBox({ label, value, sub }) {
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-xl px-5 py-4 text-center">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-orange-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function PlayerProfile() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/players/${id}`)
      .then(p => { setPlayer(p); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-24 text-gray-500">Loading...</div>;
  if (!player) return <div className="text-center py-24 text-gray-500">Player not found.</div>;

  const seasons = player.seasons || [];
  const careerPts = player.total_points ?? player.career_points ?? 0;
  const seasonsPlayed = seasons.filter(s => s.games_played >= 1).length;
  const allStarCount = seasons.filter(s => s.is_allstar).length;
  const allNbaCount = seasons.filter(s => s.is_allnba).length;
  const mvpCount = seasons.filter(s => s.is_mvp).length;

  const bbrefUrl = player.bball_ref_id
    ? `https://www.basketball-reference.com/players/${player.bball_ref_id[0]}/${player.bball_ref_id}.html`
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/draft-classes" className="hover:text-gray-300">Draft Classes</Link>
        <span>/</span>
        <Link to={`/draft-classes/${player.draft_year}`} className="hover:text-gray-300">{player.draft_year}</Link>
        <span>/</span>
        <span className="text-gray-300">{player.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">{player.name}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-400">
            {player.position && <span>{player.position}</span>}
            {player.position && <span className="text-gray-600">·</span>}
            <span>{player.draft_year} Draft</span>
            {player.draft_pick && (
              <>
                <span className="text-gray-600">·</span>
                <span>#{player.draft_pick} overall</span>
              </>
            )}
            {player.draft_team && (
              <>
                <span className="text-gray-600">·</span>
                <span>{player.draft_team}</span>
              </>
            )}
          </div>
        </div>
        {bbrefUrl && (
          <a href={bbrefUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-300 border border-navy-600 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
            BBRef ↗
          </a>
        )}
      </div>

      {/* Stat boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatBox label="Career Points" value={careerPts} sub={player.true_rank ? `True Rank #${player.true_rank}` : null} />
        <StatBox label="NBA Seasons" value={seasonsPlayed} />
        <StatBox label="All-Star" value={allStarCount} sub={allStarCount > 0 ? `selection${allStarCount !== 1 ? 's' : ''}` : null} />
        <StatBox label="All-NBA" value={allNbaCount + (mvpCount > 0 ? ` / ${mvpCount} MVP` : '')} />
      </div>

      {/* Season table */}
      {seasons.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No season data recorded yet.</div>
      ) : (
        <>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Season Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-navy-600">
                  <th className="pb-2 pr-4">Season</th>
                  <th className="pb-2 pr-3 text-center">GP</th>
                  <th className="pb-2 pr-3 text-center">GS</th>
                  {AWARDS.map(a => (
                    <th key={a.key} className="pb-2 pr-2 text-center" title={`${a.title} (+${a.pts})`}>{a.label}</th>
                  ))}
                  <th className="pb-2 pr-3 text-right">Pts</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {seasons.map(s => (
                  <tr key={s.id} className="border-b border-navy-700 hover:bg-navy-800/50">
                    <td className="py-2.5 pr-4 font-semibold text-white">
                      {s.season_year - 1}–{String(s.season_year).slice(2)}
                    </td>
                    <td className="py-2.5 pr-3 text-center text-gray-400">{s.games_played}</td>
                    <td className="py-2.5 pr-3 text-center text-gray-400">{s.games_started}</td>
                    {AWARDS.map(a => (
                      <td key={a.key} className="py-2.5 pr-2 text-center">
                        {s[a.key]
                          ? <span className="text-green-400 font-bold text-xs">✓</span>
                          : <span className="text-gray-700">—</span>}
                      </td>
                    ))}
                    <td className="py-2.5 pr-3 text-right font-bold text-orange-400">{s.points_earned}</td>
                    <td className="py-2.5 text-right">
                      {s.is_final
                        ? <span className="text-xs text-gray-500">Final</span>
                        : <span className="text-xs text-green-500">Live</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-navy-500">
                  <td colSpan={2 + AWARDS.length + 1} className="pt-3 text-sm text-gray-500 font-semibold">Total</td>
                  <td className="pt-3 text-right font-black text-orange-400 text-base">{careerPts}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            GP = games played · GS = games started · AS = All-Star · AN = All-NBA · AD = All-Defense · AR = All-Rookie · ROY = Rookie of Year · 6M = Sixth Man
          </p>
        </>
      )}
    </div>
  );
}
