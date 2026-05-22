import React from 'react'

const CIRCUMFERENCE = 2 * Math.PI * 50 // r=50

function textbookUrl(chapter) {
  return `https://openstax.org/books/chemistry-2e/pages/${chapter}-introduction`
}

function isCorrect(answer, question) {
  if (!answer.followUpAnswer) return false
  if (question.followUp.type === 'select-all') {
    const sel = Array.isArray(answer.followUpAnswer)
      ? [...answer.followUpAnswer].sort()
      : []
    const cor = [...question.followUp.correctIds].sort()
    return sel.length === cor.length && sel.every((v, i) => v === cor[i])
  }
  return answer.followUpAnswer === question.followUp.correctId
}

function scoreAnswer(answer, question) {
  if (answer.understanding === 'no') return 0
  const correct = isCorrect(answer, question)
  if (correct) {
    // 60–100% based on confidence
    return 50 + answer.confidence * 10
  } else {
    // 10–30% — being confidently wrong hurts more
    return Math.max(5, 35 - answer.confidence * 5)
  }
}

function getColor(score) {
  if (score >= 75) return '#16a34a'
  if (score >= 45) return '#d97706'
  return '#dc2626'
}

function getLabel(score) {
  if (score >= 75) return 'Strong'
  if (score >= 45) return 'Review'
  return 'Study this'
}

function getSummary(overall) {
  if (overall >= 80) return "You're in strong shape. Focus any remaining time on the topics flagged below."
  if (overall >= 55) return "You have a solid foundation, but a few areas need more attention before the exam."
  return "There's ground to cover — prioritize the topics below and work through the relevant textbook sections."
}

export default function Results({ questions, answers, onRestart }) {
  const scores = questions.map((q, i) => scoreAnswer(answers[i], q))
  const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  const studyTopics = questions.filter((_, i) => scores[i] < 75)
  const strokeDash = `${(overall / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`

  return (
    <div className="results">
      <div className="card centered">
        <h2>Your Results</h2>
        <div className="score-ring-wrap">
          <svg viewBox="0 0 120 120" className="score-ring">
            <circle cx="60" cy="60" r="50" className="ring-bg" />
            <circle
              cx="60" cy="60" r="50"
              className="ring-fill"
              strokeDasharray={strokeDash}
              style={{ stroke: getColor(overall) }}
            />
          </svg>
          <div className="score-number" style={{ color: getColor(overall) }}>{overall}%</div>
        </div>
        <p className="score-summary">{getSummary(overall)}</p>
      </div>

      <div className="card">
        <h3>Topic Breakdown</h3>
        <div className="topic-list">
          {questions.map((q, i) => (
            <div key={q.id} className="topic-row">
              <div className="topic-meta">
                <span className="topic-name">{q.topic}</span>
                <span className="topic-chapter">Ch. {q.chapter}</span>
              </div>
              <div className="topic-bar-track">
                <div
                  className="topic-bar-fill"
                  style={{ width: `${scores[i]}%`, background: getColor(scores[i]) }}
                />
              </div>
              {getLabel(scores[i]) === 'Study this' ? (
                <a
                  className="topic-tag topic-tag--link"
                  href={textbookUrl(q.chapter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: getColor(scores[i]) }}
                  onClick={e => e.stopPropagation()}
                >
                  Study this ↗
                </a>
              ) : (
                <span className="topic-tag" style={{ color: getColor(scores[i]) }}>
                  {getLabel(scores[i])}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {studyTopics.length > 0 && (
        <div className="card">
          <h3>Suggested study topics</h3>
          <p className="subtitle" style={{ marginBottom: '1rem' }}>
            Focus on these sections in OpenStax Chemistry 2e before your exam.
          </p>
          <ul className="study-list">
            {studyTopics.map(q => (
              <li key={q.id} className="study-item">
                <span className="study-chapter">Ch. {q.chapter}</span>
                <span className="study-topic">{q.topic}</span>
                <a
                  className="study-link"
                  href={textbookUrl(q.chapter)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in OpenStax ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button className="btn-primary btn-restart" onClick={onRestart}>
        Start over
      </button>
    </div>
  )
}
