import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${active ? 'border-orange-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
      {label}
    </button>
  );
}

function Alert({ msg, type = 'success' }) {
  if (!msg) return null;
  return (
    <div className={`text-sm rounded-lg px-4 py-3 mb-4 ${type === 'success' ? 'bg-green-900/40 border border-green-700 text-green-300' : 'bg-red-900/40 border border-red-700 text-red-300'}`}>
      {msg}
    </div>
  );
}

// ── Draft Classes ──────────────────────────────────────────────────────────────
function DraftClassesPanel() {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ year: '', lock_date: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(() => api.get('/draft-classes').then(setClasses).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await api.post('/admin/draft-classes', { year: parseInt(form.year), lock_date: form.lock_date });
      setMsg(`Draft class ${form.year} saved.`);
      setForm({ year: '', lock_date: '' });
      load();
    } catch (ex) { setErr(ex.message); }
  }

  async function toggleLock(dc) {
    try {
      await api.patch(`/admin/draft-classes/${dc.year}/lock`, { is_locked: !dc.is_locked });
      load();
    } catch (ex) { alert(ex.message); }
  }

  return (
    <div>
      <Alert msg={msg} /><Alert msg={err} type="error" />
      <form onSubmit={handleCreate} className="flex flex-wrap gap-3 mb-6 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Draft Year</label>
          <input type="number" placeholder="2025" required value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
            className="bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:border-orange-500" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Lock Date (NBA Season Start)</label>
          <input type="date" required value={form.lock_date} onChange={e => setForm(f => ({ ...f, lock_date: e.target.value }))}
            className="bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
        </div>
        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg text-sm">Add / Update</button>
      </form>

      <table className="w-full text-sm">
        <thead><tr className="text-left text-gray-500 border-b border-navy-600">
          <th className="pb-2 pr-4">Year</th><th className="pb-2 pr-4">Lock Date</th><th className="pb-2">Status</th>
        </tr></thead>
        <tbody>
          {classes.map(dc => (
            <tr key={dc.year} className="border-b border-navy-700">
              <td className="py-3 pr-4 font-bold text-white">{dc.year}</td>
              <td className="py-3 pr-4 text-gray-400">{dc.lock_date}</td>
              <td className="py-3">
                <button onClick={() => toggleLock(dc)}
                  className={`text-xs px-3 py-1 rounded-full border font-medium ${dc.is_locked ? 'border-orange-700 text-orange-400 hover:bg-orange-900/30' : 'border-green-700 text-green-400 hover:bg-green-900/30'}`}>
                  {dc.is_locked ? 'Locked — Click to Unlock' : 'Open — Click to Lock'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Players ────────────────────────────────────────────────────────────────────
function PlayersPanel() {
  const [players, setPlayers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filterYear, setFilterYear] = useState('');
  const [form, setForm] = useState({ name: '', draft_year: '', draft_pick: '', draft_team: '', position: '', bball_ref_id: '' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');

  useEffect(() => { api.get('/draft-classes').then(cs => { setClasses(cs); if (cs[0]) setFilterYear(String(cs[0].year)); }).catch(() => {}); }, []);

  const load = useCallback(() => {
    if (!filterYear) return;
    api.get(`/players?draft_year=${filterYear}`).then(setPlayers).catch(() => {});
  }, [filterYear]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await api.post('/admin/players', { ...form, id: editId || undefined, draft_year: parseInt(form.draft_year), draft_pick: form.draft_pick ? parseInt(form.draft_pick) : null });
      setMsg(editId ? 'Player updated.' : 'Player added.');
      setForm({ name: '', draft_year: filterYear, draft_pick: '', draft_team: '', position: '', bball_ref_id: '' });
      setEditId(null);
      load();
    } catch (ex) { setErr(ex.message); }
  }

  function startEdit(p) {
    setEditId(p.id);
    setForm({ name: p.name, draft_year: String(p.draft_year), draft_pick: String(p.draft_pick || ''), draft_team: p.draft_team || '', position: p.position || '', bball_ref_id: p.bball_ref_id || '' });
  }

  async function handleDelete(p) {
    if (!confirm(`Delete ${p.name}? This removes all their scores and unlinks board entries.`)) return;
    try { await api.delete(`/admin/players/${p.id}`); load(); } catch (ex) { alert(ex.message); }
  }

  const inputCls = "bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 w-full";

  return (
    <div>
      <Alert msg={msg} /><Alert msg={err} type="error" />

      <div className="flex gap-3 items-center mb-4">
        <label className="text-xs text-gray-500">Filter by Year:</label>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
          className="bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500">
          {classes.map(c => <option key={c.year} value={c.year}>{c.year}</option>)}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6 items-end">
        {[['name', 'Player Name', 'text'], ['draft_year', 'Year', 'number'], ['draft_pick', 'NBA Pick', 'number'], ['draft_team', 'NBA Team', 'text'], ['position', 'Position', 'text'], ['bball_ref_id', 'BBRef ID', 'text']].map(([key, label, type]) => (
          <div key={key}>
            <label className="text-xs text-gray-500 block mb-1">{label}</label>
            <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className={inputCls}
              required={key === 'name' || key === 'draft_year'} />
          </div>
        ))}
        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-2 rounded-lg text-sm col-span-2 md:col-span-1">
          {editId ? 'Update' : 'Add Player'}
        </button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ name: '', draft_year: filterYear, draft_pick: '', draft_team: '', position: '', bball_ref_id: '' }); }}
          className="border border-gray-600 text-gray-400 font-bold px-3 py-2 rounded-lg text-sm">Cancel</button>}
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b border-navy-600">
            <th className="pb-2 pr-4">Name</th><th className="pb-2 pr-3">Pick</th><th className="pb-2 pr-3">Team</th>
            <th className="pb-2 pr-3">Pos</th><th className="pb-2 pr-3">Career Pts</th><th className="pb-2">Actions</th>
          </tr></thead>
          <tbody>
            {players.map(p => (
              <tr key={p.id} className="border-b border-navy-700">
                <td className="py-2.5 pr-4 font-medium text-white">{p.name}</td>
                <td className="py-2.5 pr-3 text-gray-400">{p.draft_pick ? `#${p.draft_pick}` : '—'}</td>
                <td className="py-2.5 pr-3 text-gray-400">{p.draft_team || '—'}</td>
                <td className="py-2.5 pr-3 text-gray-400">{p.position || '—'}</td>
                <td className="py-2.5 pr-3 text-orange-400 font-bold">{p.career_points ?? 0}</td>
                <td className="py-2.5 flex gap-2">
                  <button onClick={() => startEdit(p)} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                  <button onClick={() => handleDelete(p)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Season Scores ──────────────────────────────────────────────────────────────
function SeasonScoresPanel() {
  const [classes, setClasses] = useState([]);
  const [players, setPlayers] = useState([]);
  const [filterYear, setFilterYear] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [seasonYear, setSeasonYear] = useState('');
  const [seasons, setSeasons] = useState([]);
  const [form, setForm] = useState({ games_played: '', games_started: '', is_allstar: false, is_allnba: false, is_mvp: false, is_alldefense: false, is_allrookie: false, is_roy: false, is_sixth_man: false, is_final: false });
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');

  useEffect(() => { api.get('/draft-classes').then(cs => { setClasses(cs); if (cs[0]) setFilterYear(String(cs[0].year)); }).catch(() => {}); }, []);
  useEffect(() => { if (!filterYear) return; api.get(`/players?draft_year=${filterYear}`).then(setPlayers).catch(() => {}); }, [filterYear]);
  useEffect(() => {
    if (!selectedPlayer) return;
    api.get(`/players/${selectedPlayer}`).then(p => setSeasons(p.seasons || [])).catch(() => {});
  }, [selectedPlayer]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const result = await api.post('/admin/season-scores', {
        player_id: parseInt(selectedPlayer), season_year: parseInt(seasonYear),
        games_played: parseInt(form.games_played) || 0, games_started: parseInt(form.games_started) || 0,
        is_allstar: form.is_allstar ? 1 : 0, is_allnba: form.is_allnba ? 1 : 0, is_mvp: form.is_mvp ? 1 : 0,
        is_alldefense: form.is_alldefense ? 1 : 0, is_allrookie: form.is_allrookie ? 1 : 0,
        is_roy: form.is_roy ? 1 : 0, is_sixth_man: form.is_sixth_man ? 1 : 0, is_final: form.is_final ? 1 : 0,
      });
      setMsg(`Season saved. Points earned: ${result.points_earned}`);
      api.get(`/players/${selectedPlayer}`).then(p => setSeasons(p.seasons || [])).catch(() => {});
    } catch (ex) { setErr(ex.message); }
  }

  async function handleRecalc() {
    if (!filterYear) return;
    try {
      const r = await api.post(`/admin/recalculate/${filterYear}`, {});
      setMsg(`Recalculated ${filterYear}: ${r.players} players, ${r.boards} boards scored.`);
    } catch (ex) { setErr(ex.message); }
  }

  async function handleDeleteSeason(playerId, sy) {
    if (!confirm(`Delete ${sy} season data for this player?`)) return;
    try {
      await api.delete(`/admin/season-scores/${playerId}/${sy}`);
      api.get(`/players/${selectedPlayer}`).then(p => setSeasons(p.seasons || [])).catch(() => {});
    } catch (ex) { alert(ex.message); }
  }

  const toggle = key => setForm(f => ({ ...f, [key]: !f[key] }));
  const inputCls = "bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500";

  return (
    <div>
      <Alert msg={msg} /><Alert msg={err} type="error" />

      <div className="flex flex-wrap gap-3 mb-5 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Draft Class</label>
          <select value={filterYear} onChange={e => { setFilterYear(e.target.value); setSelectedPlayer(''); }} className={inputCls}>
            {classes.map(c => <option key={c.year} value={c.year}>{c.year}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Player</label>
          <select value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)} className={`${inputCls} min-w-48`}>
            <option value="">Select player...</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <button onClick={handleRecalc} className="border border-orange-700 text-orange-400 hover:bg-orange-900/30 font-semibold px-4 py-2 rounded-lg text-sm">
          Recalculate {filterYear}
        </button>
      </div>

      {selectedPlayer && (
        <>
          <form onSubmit={handleSubmit} className="bg-navy-800 border border-navy-600 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-white mb-3">Add / Update Season Score</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Season Year</label>
                <input type="number" placeholder="2024" required value={seasonYear} onChange={e => setSeasonYear(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Games Played</label>
                <input type="number" min="0" max="82" value={form.games_played} onChange={e => setForm(f => ({ ...f, games_played: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Games Started</label>
                <input type="number" min="0" max="82" value={form.games_started} onChange={e => setForm(f => ({ ...f, games_started: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mb-4">
              {[['is_allstar', 'All-Star'], ['is_allnba', 'All-NBA'], ['is_mvp', 'MVP'], ['is_alldefense', 'All-Defense'], ['is_allrookie', 'All-Rookie'], ['is_roy', 'ROY'], ['is_sixth_man', 'Sixth Man'], ['is_final', 'Season Final']].map(([key, label]) => (
                <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={form[key]} onChange={() => toggle(key)}
                    className="w-4 h-4 accent-orange-500 rounded" />
                  <span className={`text-sm ${key === 'is_final' ? 'text-orange-400' : 'text-gray-300'}`}>{label}</span>
                </label>
              ))}
            </div>
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg text-sm">Save Season Score</button>
          </form>

          {seasons.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 border-b border-navy-600">
                  <th className="pb-2 pr-3">Season</th><th className="pb-2 pr-3">GP</th><th className="pb-2 pr-3">GS</th>
                  <th className="pb-2 pr-3">AS</th><th className="pb-2 pr-3">AN</th><th className="pb-2 pr-3">MVP</th>
                  <th className="pb-2 pr-3">AD</th><th className="pb-2 pr-3">AR</th><th className="pb-2 pr-3">ROY</th>
                  <th className="pb-2 pr-3">6M</th><th className="pb-2 pr-3 text-right">Pts</th><th className="pb-2">Final</th>
                </tr></thead>
                <tbody>
                  {seasons.map(s => (
                    <tr key={s.id} className="border-b border-navy-700">
                      <td className="py-2 pr-3 font-semibold text-white">{s.season_year}</td>
                      <td className="py-2 pr-3 text-gray-400">{s.games_played}</td>
                      <td className="py-2 pr-3 text-gray-400">{s.games_started}</td>
                      {['is_allstar','is_allnba','is_mvp','is_alldefense','is_allrookie','is_roy','is_sixth_man'].map(k => (
                        <td key={k} className="py-2 pr-3">{s[k] ? <span className="text-green-400">✓</span> : <span className="text-gray-700">—</span>}</td>
                      ))}
                      <td className="py-2 pr-3 text-right font-bold text-orange-400">{s.points_earned}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          {s.is_final ? <span className="text-xs text-orange-400">Final</span> : <span className="text-xs text-gray-600">Live</span>}
                          <button onClick={() => handleDeleteSeason(s.player_id, s.season_year)} className="text-xs text-red-400 hover:text-red-300">Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Boards ─────────────────────────────────────────────────────────────────────
function BoardsPanel() {
  const [boards, setBoards] = useState([]);
  const [filterYear, setFilterYear] = useState('');
  const [classes, setClasses] = useState([]);

  useEffect(() => { api.get('/draft-classes').then(cs => { setClasses(cs); if (cs[0]) setFilterYear(String(cs[0].year)); }).catch(() => {}); }, []);
  useEffect(() => { if (!filterYear) return; api.get(`/boards?draft_year=${filterYear}&limit=100`).then(setBoards).catch(() => {}); }, [filterYear]);

  async function handleDelete(b) {
    if (!confirm(`Delete board "${b.title}"?`)) return;
    try {
      await api.delete(`/admin/boards/${b.id}`);
      setBoards(bs => bs.filter(x => x.id !== b.id));
    } catch (ex) { alert(ex.message); }
  }

  return (
    <div>
      <div className="flex gap-3 items-center mb-5">
        <label className="text-xs text-gray-500">Draft Year:</label>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
          className="bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500">
          {classes.map(c => <option key={c.year} value={c.year}>{c.year}</option>)}
        </select>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="text-left text-gray-500 border-b border-navy-600">
          <th className="pb-2 pr-4">Author</th><th className="pb-2 pr-4">Title</th>
          <th className="pb-2 pr-3">Submitted</th><th className="pb-2 pr-3">Locked</th><th className="pb-2">Actions</th>
        </tr></thead>
        <tbody>
          {boards.map(b => (
            <tr key={b.id} className="border-b border-navy-700">
              <td className="py-2.5 pr-4 text-gray-300">{b.username}</td>
              <td className="py-2.5 pr-4 text-white">{b.title}</td>
              <td className="py-2.5 pr-3 text-gray-500">{new Date(b.submitted_at).toLocaleDateString()}</td>
              <td className="py-2.5 pr-3">{b.is_locked ? <span className="text-orange-400 text-xs">Yes</span> : <span className="text-gray-600 text-xs">No</span>}</td>
              <td className="py-2.5">
                <button onClick={() => handleDelete(b)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── BBall Reference Sync ───────────────────────────────────────────────────────
function SyncPanel() {
  const [classes, setClasses] = useState([]);
  const [draftYear, setDraftYear] = useState('');
  const [seasonYear, setSeasonYear] = useState('');
  const [isFinal, setIsFinal] = useState(false);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/draft-classes').then(cs => {
      setClasses(cs);
      if (cs[0]) {
        setDraftYear(String(cs[0].year));
        setSeasonYear(String(cs[0].year + 1));
      }
    }).catch(() => {});
  }, []);

  function appendLog(lines) {
    setLog(prev => [...prev, ...(Array.isArray(lines) ? lines : [lines])]);
  }

  async function handleDraftSync() {
    if (!draftYear) return;
    setLoading(true); setErr(''); setLog([]);
    appendLog(`Syncing ${draftYear} draft picks from Basketball Reference...`);
    try {
      const r = await api.post(`/admin/scrape/draft/${draftYear}`, {});
      appendLog(r.log || []);
      appendLog(`✓ Done: ${r.inserted} inserted, ${r.updated} updated`);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSeasonSync() {
    if (!draftYear || !seasonYear) return;
    setLoading(true); setErr(''); setLog([]);
    appendLog(`Syncing ${draftYear} draft class — ${seasonYear} season stats + awards...`);
    appendLog('This makes 3 requests to Basketball Reference (~12 seconds)...');
    try {
      const r = await api.post(`/admin/scrape/season/${draftYear}/${seasonYear}`, { is_final: isFinal });
      appendLog(r.log || []);
      appendLog(`✓ Done: ${r.matched}/${r.total} players matched`);
      if (r.not_found?.length) appendLog(`No stats: ${r.not_found.join(', ')}`);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePreview() {
    if (!draftYear) return;
    setLoading(true); setErr(''); setLog([]);
    appendLog(`Previewing ${draftYear} draft (first 10 picks)...`);
    try {
      const r = await api.get(`/admin/scrape/draft/${draftYear}/preview`);
      appendLog(`Found ${r.count} picks:`);
      r.picks.forEach(p => appendLog(`  #${p.draft_pick} ${p.name} (${p.draft_team}) [${p.bball_ref_id}]`));
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500";
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div>
      <div className="bg-navy-800 border border-navy-600 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-white mb-1">Basketball Reference Sync</h3>
        <p className="text-xs text-gray-500 mb-4">
          Scrapes player data from Basketball Reference. Requests are spaced 3.5s apart to avoid rate limiting.
          Run Draft Sync first to populate players, then Season Sync to pull stats and awards.
        </p>

        <div className="flex flex-wrap gap-4 mb-5">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Draft Year</label>
            <select value={draftYear} onChange={e => setDraftYear(e.target.value)} className={inputCls}>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Season Year (ends in)</label>
            <select value={seasonYear} onChange={e => setSeasonYear(e.target.value)} className={inputCls}>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <p className="text-xs text-gray-600 mt-0.5">e.g. 2025 = 2024–25 season</p>
          </div>
          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFinal} onChange={e => setIsFinal(e.target.checked)}
                className="w-4 h-4 accent-orange-500" />
              <span className="text-sm text-orange-400">Mark season as final</span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={handlePreview} disabled={loading}
            className="border border-navy-500 hover:border-gray-400 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">
            Preview Draft Picks
          </button>
          <button onClick={handleDraftSync} disabled={loading}
            className="bg-navy-700 hover:bg-navy-600 border border-navy-500 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50">
            {loading ? 'Working...' : 'Sync Draft Picks'}
          </button>
          <button onClick={handleSeasonSync} disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50">
            {loading ? 'Working...' : 'Sync Season Stats + Awards'}
          </button>
        </div>
      </div>

      {err && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">{err}</div>
      )}

      {log.length > 0 && (
        <div className="bg-navy-900 border border-navy-600 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Sync Log</span>
            <button onClick={() => setLog([])} className="text-xs text-gray-600 hover:text-gray-400">Clear</button>
          </div>
          <div className="font-mono text-xs text-gray-300 space-y-0.5 max-h-80 overflow-y-auto">
            {log.map((line, i) => (
              <div key={i} className={line.startsWith('✓') ? 'text-green-400' : line.startsWith('  ') ? 'text-gray-500' : 'text-gray-300'}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 bg-navy-800 border border-navy-700 rounded-xl p-4 text-xs text-gray-500">
        <p className="font-semibold text-gray-400 mb-1">Workflow</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Use <span className="text-orange-400">Preview Draft Picks</span> to verify BBref can reach the page</li>
          <li>Use <span className="text-orange-400">Sync Draft Picks</span> to import the full draft (players + picks + teams)</li>
          <li>Set Season Year to the year the season ended (e.g. 2025 for 2024–25)</li>
          <li>Use <span className="text-orange-400">Sync Season Stats + Awards</span> to pull GP, GS, and all award flags</li>
          <li>Check "Mark season as final" once MVP and end-of-season awards are announced</li>
          <li>Repeat Season Sync each year to accumulate career points</li>
        </ol>
      </div>
    </div>
  );
}

// ── Main Admin ─────────────────────────────────────────────────────────────────
export default function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('draft-classes');

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) navigate('/');
  }, [user, loading, navigate]);

  if (loading) return <div className="text-center py-24 text-gray-500">Loading...</div>;
  if (!user?.is_admin) return null;

  const tabs = [
    { id: 'draft-classes', label: 'Draft Classes' },
    { id: 'players', label: 'Players' },
    { id: 'season-scores', label: 'Season Scores' },
    { id: 'boards', label: 'Boards' },
    { id: 'sync', label: 'BBall Ref Sync' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-white">Admin Panel</h1>
        <span className="text-sm text-orange-400 border border-orange-800 bg-orange-900/30 px-3 py-1 rounded-full">Admin</span>
      </div>

      <div className="flex border-b border-navy-600 mb-6 gap-1 overflow-x-auto">
        {tabs.map(t => <Tab key={t.id} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />)}
      </div>

      {tab === 'draft-classes' && <DraftClassesPanel />}
      {tab === 'players' && <PlayersPanel />}
      {tab === 'season-scores' && <SeasonScoresPanel />}
      {tab === 'boards' && <BoardsPanel />}
      {tab === 'sync' && <SyncPanel />}
    </div>
  );
}
