import React, { useState } from 'react'
import { CHAPTER_META } from '../data/questions'

export default function ChapterSelector({ selectedClass, onConfirm }) {
  const [selected, setSelected] = useState([])
  const chapters = CHAPTER_META[selectedClass]

  function toggle(num) {
    setSelected(prev =>
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    )
  }

  const availableSelected = selected.filter(n => chapters[n]?.available)

  return (
    <div className="card">
      <h2>Which chapters are you preparing for?</h2>
      <p className="subtitle">Select all that apply. Only chapters with available questions can be chosen.</p>
      <div className="chapter-grid">
        {Object.entries(chapters).map(([num, meta]) => {
          const n = Number(num)
          const isSelected = selected.includes(n)
          return (
            <button
              key={n}
              className={[
                'chapter-btn',
                !meta.available && 'chapter-btn--disabled',
                isSelected && meta.available && 'chapter-btn--selected',
              ].filter(Boolean).join(' ')}
              onClick={() => meta.available && toggle(n)}
              disabled={!meta.available}
              aria-pressed={isSelected}
            >
              <span className="chapter-num">Ch. {n}</span>
              <span className="chapter-title">{meta.title}</span>
              {!meta.available && <span className="chapter-soon">Coming soon</span>}
              {isSelected && meta.available && (
                <span className="chapter-check" aria-hidden="true">&#10003;</span>
              )}
            </button>
          )
        })}
      </div>
      <button
        className="btn-primary"
        disabled={availableSelected.length === 0}
        onClick={() => onConfirm(availableSelected.sort((a, b) => a - b))}
      >
        {availableSelected.length === 0
          ? 'Select at least one chapter'
          : `Start check-in for ${availableSelected.length === 1 ? `Chapter ${availableSelected[0]}` : `Chapters ${availableSelected.join(', ')}`}`}
      </button>
    </div>
  )
}
