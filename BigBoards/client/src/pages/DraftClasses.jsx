import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function DraftClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/draft-classes').then(c => { setClasses(c); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-white mb-2">Draft Classes</h1>
      <p className="text-gray-400 mb-8">Select a draft class to view players, true value rankings, and submitted big boards.</p>

      {loading ? (
        <div className="text-gray-500 text-center py-16">Loading...</div>
      ) : classes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No draft classes yet.</p>
          <p className="text-gray-600 text-sm mt-1">An admin can create draft classes in the admin panel.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(dc => (
            <Link key={dc.year} to={`/draft-classes/${dc.year}`}
              className="bg-navy-800 border border-navy-600 hover:border-orange-500 rounded-xl p-5 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl font-black text-white group-hover:text-orange-400 transition-colors">{dc.year}</span>
                {dc.is_locked
                  ? <span className="text-xs bg-orange-900/40 text-orange-400 border border-orange-800 px-2 py-0.5 rounded-full font-medium">Locked</span>
                  : <span className="text-xs bg-green-900/40 text-green-400 border border-green-800 px-2 py-0.5 rounded-full font-medium">Open</span>}
              </div>
              <div className="flex gap-4 text-sm text-gray-400">
                <span><span className="text-white font-semibold">{dc.player_count}</span> players</span>
                <span><span className="text-white font-semibold">{dc.board_count}</span> boards</span>
              </div>
              {dc.lock_date && !dc.is_locked && (
                <p className="text-xs text-gray-500 mt-2">Locks {dc.lock_date}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
