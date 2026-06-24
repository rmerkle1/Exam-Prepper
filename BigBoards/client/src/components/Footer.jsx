import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-navy-700 mt-16 py-8 text-center text-sm text-gray-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-bold text-orange-500">BigBoards</span>
        <div className="flex gap-6">
          <Link to="/scoring-rules" className="hover:text-gray-300">Scoring Rules</Link>
          <Link to="/leaderboard" className="hover:text-gray-300">Leaderboard</Link>
          <Link to="/draft-classes" className="hover:text-gray-300">Draft Classes</Link>
        </div>
        <span>NBA Draft Accuracy Tracker</span>
      </div>
    </footer>
  );
}
