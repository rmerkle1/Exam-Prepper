import React from 'react'
import { CHAPTER_META } from '../data/questions'

const CIRCUMFERENCE = 2 * Math.PI * 50

function textbookUrl(chapter) {
  return `https://openstax.org/books/chemistry-2e/pages/${chapter}-introduction`
}

function isCorrect(answer, question) {
  if (!answer.followUpAnswer) return false
  const fu = question.followUp
  if (fu.type === 'select-all') {
    const sel = Array.isArray(answer.followUpAnswer) ? [...answer.followUpAnswer].sort() : []
    const cor = [...fu.correctIds].sort()
    return sel.length === cor.length && sel.every((v, i) => v === cor[i])
  }
  if (fu.type === 'multi-dropdown') {
    return null // handled separately
  }
  return answer.followUpAnswer === fu.correctId
}

function scoreAnswer(answer, question) {
  if (answer.understanding === 'no') return 0
  const fu = question.followUp

  if (fu.type === 'multi-dropdown') {
    const values = answer.followUpAnswer || {}
    let correct = 0, total = 0
    fu.subQuestions.forEach(sq => {
      sq.fields.forEach(f => {
        total++
        if (values[`${sq.id}-${f.id}`] === f.correctValue) correct++
      })
    })
    const pct = total > 0 ? correct / total : 0
    return Math.round(pct * (50 + answer.confidence * 10))
  }

  const correct = isCorrect(answer, question)
  if (correct) return 50 + answer.confidence * 10   // 60–100%
  return Math.max(5, 35 - answer.confidence * 5)    // 10–30%
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
  if (overall >= 80) return "You're in strong shape. Focus any remaining time on the flagged topics below."
  if (overall >= 55) return "You have a solid foundation, but a few areas need more attention before the exam."
  return "There's ground to cover — prioritize the topics below and work through the textbook sections linked."
}

export default function Results({ questions, answers, onRestart }) {
  const scores = questions.map((q, i) => scoreAnswer(answers[i], q))
  const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  const strokeDash = `${(overall / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`

  // Group questions by chapter → topicGroup
  const chapterMap = {}
  questions.forEach((q, i) => {
    const ch = q.chapter
    const group = q.topicGroup || q.topic
    if (!chapterMap[ch]) chapterMap[ch] = {}
    if (!chapterMap[ch][group]) chapterMap[ch][group] = []
    chapterMap[ch][group].push({ question: q, score: scores[i], index: i })
  })

  const chapters = Object.entries(chapterMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([ch, groups]) => ({
      chapter: Number(ch),
      title: CHAPTER_META.CHM113?.[Number(ch)]?.title ?? `Chapter ${ch}`,
      groups: Object.entries(groups).map(([name, items]) => ({
        name,
        avgScore: Math.round(items.reduce((s, it) => s + it.score, 0) / items.length),
        items,
      })),
    }))

  // Weak individual questions for study suggestions
  const weakItems = questions
    .map((q, i) => ({ question: q, score: scores[i] }))
    .filter(it => it.score < 75)

  return (
    <div className="results">
      {/* Overall score ring */}
      <div className="card centered">
        <h2>Your Results</h2>
        <div className="score-ring-wrap">
          <svg viewBox="0 0 120 120" className="score-ring">
            <circle cx="60" cy="60" r="50" className="ring-bg" />
            <circle cx="60" cy="60" r="50" className="ring-fill"
              strokeDasharray={strokeDash}
              style={{ stroke: getColor(overall) }}
            />
          </svg>
          <div className="score-number" style={{ color: getColor(overall) }}>{overall}%</div>
        </div>
        <p className="score-summary">{getSummary(overall)}</p>
      </div>

      {/* Topic breakdown grouped by chapter → topicGroup */}
      <div className="card">
        <h3>Topic Breakdown</h3>
        {chapters.map(ch => (
          <div key={ch.chapter} className="chapter-section">
            <div className="chapter-section-header">
              Ch. {ch.chapter} — {ch.title}
            </div>
            {ch.groups.map(group => (
              <div key={group.name} className="topic-row">
                <div className="topic-meta">
                  <span className="topic-name">{group.name}</span>
                  {group.items.length > 1 && (
                    <span className="topic-count">{group.items.length} questions</span>
                  )}
                </div>
                <div className="topic-bar-track">
                  <div
                    className="topic-bar-fill"
                    style={{ width: `${group.avgScore}%`, background: getColor(group.avgScore) }}
                  />
                </div>
                {getLabel(group.avgScore) === 'Study this' ? (
                  <a
                    className="topic-tag topic-tag--link"
                    href={textbookUrl(ch.chapter)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: getColor(group.avgScore) }}
                  >
                    Study this ↗
                  </a>
                ) : (
                  <span className="topic-tag" style={{ color: getColor(group.avgScore) }}>
                    {getLabel(group.avgScore)}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Specific study suggestions */}
      {weakItems.length > 0 && (
        <div className="card">
          <h3>What to study</h3>
          <p className="subtitle" style={{ marginBottom: '1rem' }}>
            Focus on these specific topics in OpenStax Chemistry 2e before your exam.
          </p>
          <ul className="study-list">
            {weakItems.map(({ question: q, score }) => (
              <li key={q.id} className="study-item">
                <div className="study-item-top">
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
                </div>
                {q.studyNote && (
                  <p className="study-note">{q.studyNote}</p>
                )}
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
