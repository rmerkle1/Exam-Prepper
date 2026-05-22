import React from 'react'

export default function ClassSelector({ onSelect }) {
  return (
    <div className="card centered">
      <h2>Which class are you preparing for?</h2>
      <p className="subtitle">Select your course to get a personalized study check-in.</p>
      <div className="class-grid">
        <button className="class-btn" onClick={() => onSelect('CHM113')}>
          <span className="class-code">CHM113</span>
          <span className="class-name">General Chemistry II</span>
        </button>
        <button className="class-btn class-btn--disabled" disabled>
          <span className="class-code">CHM101</span>
          <span className="class-name">Intro to Chemistry</span>
          <span className="coming-soon">Coming soon</span>
        </button>
      </div>
    </div>
  )
}
