import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

function Step({ number, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="text-sm text-gray-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    api.get('/draft-classes').then(setClasses).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
          Did your big board <span className="text-orange-500">age well?</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Upload your pre-draft big board. We track every player's career and score how accurate you were — forever.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/upload" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-lg transition-colors">
            Upload Your Big Board
          </Link>
          <Link to="/leaderboard" className="border border-gray-600 hover:border-gray-400 text-gray-200 font-semibold px-6 py-3 rounded-lg transition-colors">
            View Leaderboard
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-xl font-bold text-white mb-6">How It Works</h2>
          <div className="flex flex-col gap-5">
            <Step number="1" title="Upload your big board" desc="Submit a CSV ranking up to 60 players from any draft class before the NBA season starts." />
            <Step number="2" title="Players earn career points" desc="Each season, players accumulate points for being on a roster, making All-Star, All-NBA, winning MVP, and more." />
            <Step number="3" title="Career points create a True Value Ranking" desc="Players are sorted by lifetime points. This becomes the ground truth for your draft class." />
            <Step number="4" title="Your board is scored" desc="We compare your picks against the True Value Ranking using rank distance. Higher scores mean you nailed it." />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-6">Point System</h2>
          <div className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden">
            {[
              ['On an NBA roster', 1],
              ['Plays 41+ games', 2],
              ['Starts 41+ games', 3],
              ['All-Star selection', 5],
              ['All-NBA team', 7],
              ['All-Defense team', 5],
              ['All-Rookie team', 5],
              ['Rookie of the Year', 5],
              ['Sixth Man of the Year', 5],
              ['MVP', 10],
            ].map(([label, pts]) => (
              <div key={label} className="flex items-center justify-between px-4 py-2.5 border-b border-navy-700 last:border-0">
                <span className="text-sm text-gray-300">{label}</span>
                <span className="font-bold text-orange-400">+{pts}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">All applicable points stack. Points accumulate forever.</p>
        </div>
      </div>

      {/* Draft classes */}
      {classes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Draft Classes</h2>
            <Link to="/draft-classes" className="text-sm text-orange-400 hover:text-orange-300">View all</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {classes.slice(0, 8).map(dc => (
              <Link key={dc.year} to={`/draft-classes/${dc.year}`}
                className="bg-navy-800 border border-navy-600 hover:border-orange-500 rounded-xl p-4 transition-colors group">
                <div className="text-2xl font-black text-white group-hover:text-orange-400 transition-colors">{dc.year}</div>
                <div className="text-xs text-gray-500 mt-1">{dc.player_count} players · {dc.board_count} boards</div>
                {dc.is_locked && <span className="text-xs text-orange-400 font-medium">Locked</span>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
