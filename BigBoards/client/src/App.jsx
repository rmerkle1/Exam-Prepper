import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Nav from './components/Nav';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import Leaderboard from './pages/Leaderboard';
import DraftClasses from './pages/DraftClasses';
import DraftClass from './pages/DraftClass';
import TrueValueRankings from './pages/TrueValueRankings';
import AuthorProfile from './pages/AuthorProfile';
import BoardDetail from './pages/BoardDetail';
import ScoringRules from './pages/ScoringRules';
import Admin from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/draft-classes" element={<DraftClasses />} />
              <Route path="/draft-classes/:year" element={<DraftClass />} />
              <Route path="/true-value" element={<TrueValueRankings />} />
              <Route path="/true-value/:year" element={<TrueValueRankings />} />
              <Route path="/authors/:userId" element={<AuthorProfile />} />
              <Route path="/boards/:id" element={<BoardDetail />} />
              <Route path="/scoring-rules" element={<ScoringRules />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
