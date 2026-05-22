import React, { useState } from 'react'
import Math from './Math'
import ElementCard from './ElementCard'
import DataTable from './DataTable'

const CONFIDENCE_LABELS = [
  'Just guessing',
  'Not very sure',
  'Somewhat sure',
  'Pretty confident',
  'Very confident',
]

function VisualBlock({ visual }) {
  if (!visual) return null
  if (visual.type === 'element-card') return <ElementCard {...visual} />
  if (visual.type === 'data-table') return <DataTable {...visual} />
  return null
}

export default function Survey({ questions, onComplete }) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('main')
  const [answers, setAnswers] = useState([])

  // Single-select state
  const [selectedOption, setSelectedOption] = useState(null)
  // Multi-select state
  const [selectedOptions, setSelectedOptions] = useState([])
  // Multi-dropdown state
  const [dropdownValues, setDropdownValues] = useState({})
  const [confidence, setConfidence] = useState(3)

  const question = questions[index]
  const followUp = question.followUp
  const isSelectAll = followUp.type === 'select-all'
  const isMultiDropdown = followUp.type === 'multi-dropdown'
  const progressPct = ((index + (phase === 'followup' ? 0.5 : 0)) / questions.length) * 100

  const hasSelection = (() => {
    if (isMultiDropdown) {
      return followUp.subQuestions.every(sq =>
        sq.fields.every(f => dropdownValues[`${sq.id}-${f.id}`])
      )
    }
    if (isSelectAll) return selectedOptions.length > 0
    return selectedOption !== null
  })()

  function handleUnderstanding(value) {
    if (value === 'no') {
      const next = [...answers, { understanding: 'no', followUpAnswer: null, confidence: null }]
      setAnswers(next)
      advance(next)
    } else {
      setAnswers([...answers, { understanding: value }])
      setSelectedOption(null)
      setSelectedOptions([])
      setDropdownValues({})
      setConfidence(3)
      setPhase('followup')
    }
  }

  function toggleOption(id) {
    setSelectedOptions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function setDropdown(sqId, fieldId, value) {
    setDropdownValues(prev => ({ ...prev, [`${sqId}-${fieldId}`]: value }))
  }

  function handleFollowUpSubmit() {
    if (!hasSelection) return
    let followUpAnswer
    if (isMultiDropdown) followUpAnswer = { ...dropdownValues }
    else if (isSelectAll) followUpAnswer = [...selectedOptions].sort()
    else followUpAnswer = selectedOption

    const updated = [...answers]
    updated[updated.length - 1] = { ...updated[updated.length - 1], followUpAnswer, confidence }
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

      {/* ── Main question (Yes / Maybe / No) ── */}
      {phase === 'main' && (
        <div className="card">
          <div className="chapter-badge">Chapter {question.chapter}</div>
          {question.visual && (
            <div className="visual-block">
              <VisualBlock visual={question.visual} />
            </div>
          )}
          <p className="question-text">{question.question}</p>
          <div className="understanding-row">
            <button className="btn-understanding btn-yes"   onClick={() => handleUnderstanding('yes')}>Yes</button>
            <button className="btn-understanding btn-maybe" onClick={() => handleUnderstanding('maybe')}>Maybe</button>
            <button className="btn-understanding btn-no"    onClick={() => handleUnderstanding('no')}>No</button>
          </div>
          <p className="understanding-hint">
            <strong>Yes</strong> — I understand this and could solve it. &nbsp;
            <strong>Maybe</strong> — I've seen it but I'm unsure. &nbsp;
            <strong>No</strong> — I haven't learned this yet.
          </p>
        </div>
      )}

      {/* ── Follow-up ── */}
      {phase === 'followup' && (
        <div className="card">
          <div className="followup-eyebrow">Check your understanding</div>

          {/* Question-level visual (e.g., element card shown in both phases) */}
          {question.visual && (
            <div className="visual-block">
              <VisualBlock visual={question.visual} />
            </div>
          )}

          {/* Followup-level visual (e.g., data table only in followup) */}
          {followUp.visual && (
            <div className="visual-block">
              <VisualBlock visual={followUp.visual} />
            </div>
          )}

          <p className="question-text">{followUp.prompt}</p>

          {/* ── Multi-dropdown ── */}
          {isMultiDropdown && (
            <div className="dropdown-table-wrap">
              <table className="dropdown-table">
                <thead>
                  <tr>
                    <th className="dropdown-species-header">Species</th>
                    {followUp.columnHeaders.map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {followUp.subQuestions.map(sq => (
                    <tr key={sq.id}>
                      <td className="dropdown-row-label">{sq.label}</td>
                      {sq.fields.map(f => (
                        <td key={f.id} className="dropdown-cell">
                          <select
                            className="dropdown-select"
                            value={dropdownValues[`${sq.id}-${f.id}`] || ''}
                            onChange={e => setDropdown(sq.id, f.id, e.target.value)}
                          >
                            <option value="">—</option>
                            {f.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Select-all or single-select options ── */}
          {!isMultiDropdown && (
            <>
              {isSelectAll && <p className="select-all-hint">Select all that apply.</p>}
              <div className="options-list">
                {followUp.options.map(opt => {
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
                        opt.latex && 'option-btn--math',
                      ].filter(Boolean).join(' ')}
                      onClick={() => isSelectAll ? toggleOption(opt.id) : setSelectedOption(opt.id)}
                    >
                      <span className="option-marker" aria-hidden="true">
                        {isSelectAll ? (selected ? '☑' : '☐') : opt.id.toUpperCase()}
                      </span>
                      <span className="option-content">
                        {opt.latex && (
                          <span className="option-math-wrap">
                            <Math latex={opt.latex} />
                          </span>
                        )}
                        {opt.text && (
                          <span className={opt.latex ? 'option-subtext' : 'option-text'}>
                            {opt.text}
                          </span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* ── Confidence ── */}
          <div className="confidence-block">
            <div className="confidence-header">
              <label className="confidence-label">How confident are you in your answer?</label>
              <span className="confidence-value">{CONFIDENCE_LABELS[confidence - 1]}</span>
            </div>
            <input
              type="range" min={1} max={5} value={confidence}
              onChange={e => setConfidence(Number(e.target.value))}
              className="confidence-slider"
            />
            <div className="slider-ticks">
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
          </div>

          <button className="btn-primary" onClick={handleFollowUpSubmit} disabled={!hasSelection}>
            Next
          </button>
        </div>
      )}
    </div>
  )
}
