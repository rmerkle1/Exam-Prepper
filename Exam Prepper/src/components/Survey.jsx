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
  const [selectedOption, setSelectedOption] = useState(null)
  const [confidence, setConfidence] = useState(3)

  const question = questions[index]
  const progressPct = ((index + (phase === 'followup' ? 0.5 : 0)) / questions.length) * 100

  function handleUnderstanding(value) {
    if (value === 'no') {
      const next = [...answers, { understanding: 'no', followUpAnswer: null, confidence: null }]
      setAnswers(next)
      advance(next)
    } else {
      setAnswers([...answers, { understanding: value }])
      setSelectedOption(null)
      setConfidence(3)
      setPhase('followup')
    }
  }

  function handleFollowUpSubmit() {
    if (selectedOption === null) return
    const updated = [...answers]
    updated[updated.length - 1] = {
      ...updated[updated.length - 1],
      followUpAnswer: selectedOption,
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
          <div className="options-list">
            {question.followUp.options.map(opt => (
              <button
                key={opt.id}
                className={`option-btn ${selectedOption === opt.id ? 'option-btn--selected' : ''}`}
                onClick={() => setSelectedOption(opt.id)}
              >
                <span className="option-letter">{opt.id.toUpperCase()}</span>
                <span className="option-text">{opt.text}</span>
              </button>
            ))}
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
            disabled={selectedOption === null}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
