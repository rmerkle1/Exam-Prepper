import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CSV_TEMPLATE = `draft_year,author_name,rank,player_name,team,notes
2025,MyName,1,Player One,,
2025,MyName,2,Player Two,,
2025,MyName,3,Player Three,,`;

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [draftClasses, setDraftClasses] = useState([]);

  useEffect(() => {
    api.get('/draft-classes').then(setDraftClasses).catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-white mb-3">Sign in to upload</h1>
        <p className="text-gray-400 mb-6">You need an account to submit a big board.</p>
        <Link to="/login" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg">Sign In</Link>
      </div>
    );
  }

  const openDraftClasses = draftClasses.filter(dc => !dc.is_locked);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) { setError('Please select a CSV file'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await api.uploadCsv('/boards', file, title ? { title } : {});
      navigate(`/boards/${result.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bigboard-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-white mb-2">Upload Big Board</h1>
      <p className="text-gray-400 mb-8">Submit your pre-draft rankings as a CSV file. Boards lock on the first day of the NBA season.</p>

      {openDraftClasses.length === 0 && draftClasses.length > 0 && (
        <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 text-sm rounded-lg px-4 py-3 mb-6">
          All draft classes are currently locked. No new submissions are accepted.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload form */}
        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Board Title (optional)</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={`${user.username} 2025 Big Board`}
                className="w-full bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">CSV File</label>
              <div
                className="border-2 border-dashed border-navy-600 hover:border-orange-500 rounded-xl p-8 text-center cursor-pointer transition-colors"
                onClick={() => fileRef.current.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
              >
                {file ? (
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-gray-500 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <svg className="w-10 h-10 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-400 text-sm">Drop CSV here or click to select</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => setFile(e.target.files[0])} />
              </div>
            </div>

            {error && <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">{error}</div>}

            <button type="submit" disabled={loading || !file}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-colors">
              {loading ? 'Uploading...' : 'Submit Big Board'}
            </button>
          </form>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-400 flex flex-col gap-4">
          <div>
            <h3 className="text-white font-semibold mb-1">Required columns</h3>
            <ul className="list-disc list-inside space-y-0.5">
              <li><code className="text-orange-400">draft_year</code> — e.g. 2025</li>
              <li><code className="text-orange-400">author_name</code> or <code className="text-orange-400">user_id</code></li>
              <li><code className="text-orange-400">rank</code> — 1–60 only</li>
              <li><code className="text-orange-400">player_name</code></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Optional columns</h3>
            <ul className="list-disc list-inside space-y-0.5">
              <li><code className="text-orange-400">team</code></li>
              <li><code className="text-orange-400">notes</code></li>
              <li><code className="text-orange-400">player_id</code></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Rules</h3>
            <ul className="list-disc list-inside space-y-0.5">
              <li>One board per draft year per account</li>
              <li>Ranks 1–60 only (higher ignored)</li>
              <li>No duplicate ranks or players</li>
              <li>Locks on Day 1 of the NBA season</li>
            </ul>
          </div>
          <button onClick={downloadTemplate}
            className="mt-2 border border-navy-600 hover:border-gray-400 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors w-full">
            Download CSV Template
          </button>

          {openDraftClasses.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-1">Open draft classes</h3>
              <div className="flex flex-wrap gap-2">
                {openDraftClasses.map(dc => (
                  <span key={dc.year} className="bg-navy-800 border border-navy-600 px-2 py-0.5 rounded text-xs">
                    {dc.year} — locks {dc.lock_date}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
