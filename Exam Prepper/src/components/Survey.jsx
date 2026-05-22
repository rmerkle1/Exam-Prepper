import React, { useState } from 'react'

const CONFIDENCE_LABELS = [
  'Just guessing',
  'Not very sure',
  'Somewhat sure',
  'Pretty confident',
  'Very confident',
]

export default function Survey({ questions, onComplete }) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('main') // 'main' | 'followup'
  const [answers, setAnswers] = useState([])

  // Single-select state
  const [selectedOption, setSelectedOption] = useState(null)
  // Multi-select state (for select-all type)
  const [selectedOptions, setSelectedOptions] = useState([])
  const [confidence, setConfidence] = useState(3)

  const question = questions[index]
  const isSelectAll = question.followUp.type === 'select-all'
  const progressPct = ((index + (phase === 'followup' ? 0.5 : 0)) / questions.length) * 100

  const hasSelection = isSelectAll ? selectedOptions.length > 0 : selectedOption !== null

  function handleUnderstanding(value) {
    if (value === 'no') {
      const next = [...answers, { understanding: 'no', followUpAnswer: null, confidence: null }]
      setAnswers(next)
      advance(next)
    } else {
      setAnswers([...answers, { understanding: value }])
      setSelectedOption(null)
      setSelectedOptions([])
      setConfidence(3)
      setPhase('followup')
    }
  }

  function toggleOption(id) {
    setSelectedOptions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function handleFollowUpSubmit() {
    if (!hasSelection) return
    const followUpAnswer = isSelectAll ? [...selectedOptions].sort() : selectedOption
    const updated = [...answers]
    updated[updated.length - 1] = {
      ...updated[updated.length - 1],
      followUpAnswer,
      confidence,
    }
    setAnswers(updated)
    advance(updated)
  }

  function advance(currentAnswers) {
    if (index + 1 >= questions.length) {
      onComplete(currentAnswers)
    } else {
      setIndex(index + 1)
      setPhase('main')
    }
  }

  return (
    <div className="survey">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="progress-label">
        Topic {index + 1} of {questions.length} — {question.topic}
      </div>

      {phase === 'main' && (
        <div className="card">
          <div className="chapter-badge">Chapter {question.chapter}</div>
          <p className="question-text">{question.question}</p>
          <div className="understanding-row">
            <button className="btn-understanding btn-yes" onClick={() => handleUnderstanding('yes')}>
              Yes
            </button>
            <button className="btn-understanding btn-maybe" onClick={() => handleUnderstanding('maybe')}>
              Maybe
            </button>
            <button className="btn-understanding btn-no" onClick={() => handleUnderstanding('no')}>
              No
            </button>
          </div>
          <p className="understanding-hint">
            <strong>Yes</strong> — I understand this and could solve it. &nbsp;
            <strong>Maybe</strong> — I've seen it but I'm unsure. &nbsp;
            <strong>No</strong> — I haven't learned this yet.
          </p>
        </div>
      )}

      {phase === 'followup' && (
        <div className="card">
          <div className="followup-eyebrow">Check your understanding</div>
          <p className="question-text">{question.followUp.prompt}</p>

          {isSelectAll && (
            <p className="select-all-hint">Select all that apply.</p>
          )}

          <div className="options-list">
            {question.followUp.options.map(opt => {
              const selected = isSelectAll
                ? selectedOptions.includes(opt.id)
                : selectedOption === opt.id
              return (
                <button
                  key={opt.id}
                  className={[
                    'option-btn',
                    selected && 'option-btn--selected',
                    isSelectAll && 'option-btn--checkbox',
                  ].filter(Boolean).join(' ')}
                  onClick={() => isSelectAll ? toggleOption(opt.id) : setSelectedOption(opt.id)}
                >
                  <span className="option-marker" aria-hidden="true">
                    {isSelectAll
                      ? (selected ? '☑' : '☐')
                      : opt.id.toUpperCase()
                    }
                  </span>
                  <span className="option-text">{opt.text}</span>
                </button>
              )
            })}
          </div>

          <div className="confidence-block">
            <div className="confidence-header">
              <label className="confidence-label">How confident are you in your answer?</label>
              <span className="confidence-value">{CONFIDENCE_LABELS[confidence - 1]}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={confidence}
              onChange={e => setConfidence(Number(e.target.value))}
              className="confidence-slider"
            />
            <div className="slider-ticks">
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleFollowUpSubmit}
            disabled={!hasSelection}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
