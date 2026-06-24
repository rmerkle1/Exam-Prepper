import React from 'react';

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-white mb-4 border-b border-navy-600 pb-2">{title}</h2>
      {children}
    </section>
  );
}

function Formula({ label, expr }) {
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-lg px-4 py-3 mb-3">
      {label && <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>}
      <code className="text-orange-300 font-mono text-sm">{expr}</code>
    </div>
  );
}

export default function ScoringRules() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-white mb-2">Scoring Rules</h1>
      <p className="text-gray-400 mb-8">How BigBoards evaluates draft accuracy using career performance data.</p>

      <Section title="Player Season Points">
        <p className="text-gray-400 text-sm mb-4">Each season, every player from a draft class earns points based on NBA achievements. All applicable milestones stack.</p>
        <div className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden">
          {[
            ['Player is on an NBA roster', 1],
            ['Plays more than 41 games', 2],
            ['Starts more than 41 games', 3],
            ['Named an All-Star', 5],
            ['Makes an All-NBA team', 7],
            ['Makes an All-Defense team', 5],
            ['Makes an All-Rookie team', 5],
            ['Wins Rookie of the Year', 5],
            ['Wins Sixth Man of the Year', 5],
            ['Wins MVP', 10],
          ].map(([label, pts]) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 border-b border-navy-700 last:border-0">
              <span className="text-sm text-gray-300">{label}</span>
              <span className="font-bold text-orange-400">+{pts} pts</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Example: A player who starts 50 games and wins All-Star earns 1 + 2 + 3 + 5 = 11 points that season.</p>
        <p className="text-xs text-gray-500 mt-1">Awards count for the season they were earned, even if announced later. Points accumulate forever.</p>
      </Section>

      <Section title="True Value Ranking">
        <p className="text-gray-400 text-sm mb-4">
          For each draft class, players are sorted by cumulative career points (highest first). This ranking is the ground truth used to score big boards.
          It updates throughout a season as milestones are crossed and finalizes after all end-of-season awards are recorded.
        </p>
        <Formula label="Career points" expr="career_points = sum(season_points across all seasons)" />
        <Formula label="True rank" expr="Sorted descending by career_points (ties broken by draft pick)" />
      </Section>

      <Section title="Board Accuracy Score">
        <p className="text-gray-400 text-sm mb-4">
          Each player on your board receives a score from 0 to 1 based on the distance between your rank and their true value rank.
        </p>
        <Formula label="Player score" expr="score = max(0, 1 - |author_rank - true_rank| / 60)" />
        <p className="text-gray-400 text-sm mb-3">
          Example: You ranked a player #10, true rank is #25. Distance = 15. Score = 1 − 15/60 = <span className="text-orange-400 font-semibold">0.75</span>.
        </p>
        <Formula label="All-Around Score (ranks 1–60)" expr="avg(all player scores)" />
        <Formula label="First Round Score (your picks 1–30)" expr="avg(scores for entries ranked 1–30)" />
        <Formula label="Second Round Score (your picks 31–60)" expr="avg(scores for entries ranked 31–60)" />
      </Section>

      <Section title="Top-Weighted Score">
        <p className="text-gray-400 text-sm mb-4">
          A weighted score that gives more credit for correctly identifying the best players in the class.
          Used for leaderboard sorting and author reputation.
        </p>
        <Formula label="Player weight" expr="weight = 1 + (60 - true_rank) / 60" />
        <Formula label="Weighted player score" expr="weighted_score = base_score × weight" />
        <Formula label="Weighted board score" expr="sum(weighted_score) / sum(weights)" />
        <p className="text-gray-400 text-sm">True rank #1 has weight ≈ 1.98. True rank #60 has weight ≈ 1.0.</p>
      </Section>

      <Section title="Consensus Score">
        <p className="text-gray-400 text-sm mb-4">
          A consensus big board is generated for each draft class by averaging the ranks assigned by all public boards before the lock date.
          Your board is then compared to the consensus to measure whether you beat the crowd.
        </p>
        <Formula label="Consensus rank" expr="Average of all authors' ranks for each player, sorted ascending" />
        <Formula label="Consensus Plus/Minus" expr="author_weighted_score - consensus_weighted_score" />
        <p className="text-gray-400 text-sm">A positive consensus +/- means you outperformed the crowd. This rewards contrarian accuracy.</p>
      </Section>

      <Section title="Author Reputation">
        <p className="text-gray-400 text-sm mb-4">
          Your reputation score is the weighted average of your board scores across all draft classes.
          It updates whenever new player data is entered or rankings change.
        </p>
        <Formula label="Reputation" expr="weighted_average(all board weighted_scores)" />
        <p className="text-gray-400 text-sm">Future feature: full Elo head-to-head matchups between authors on each draft class.</p>
      </Section>
    </div>
  );
}
