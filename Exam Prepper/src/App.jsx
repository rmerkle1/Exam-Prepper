import React, { useState } from 'react'
import ClassSelector from './components/ClassSelector'
import TextbookConfirm from './components/TextbookConfirm'
import ChapterSelector from './components/ChapterSelector'
import Survey from './components/Survey'
import Results from './components/Results'
import { QUESTIONS } from './data/questions'
import './App.css'

export default function App() {
  const [step, setStep] = useState('class-select')
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedChapters, setSelectedChapters] = useState([])
  const [answers, setAnswers] = useState([])

  function getQuestions() {
    if (!selectedClass) return []
    return QUESTIONS[selectedClass].filter(q => selectedChapters.includes(q.chapter))
  }

  function handleClassSelect(cls) {
    setSelectedClass(cls)
    setStep('textbook-confirm')
  }

  function handleTextbookConfirm() {
    setStep('chapter-select')
  }

  function handleChapterConfirm(chapters) {
    setSelectedChapters(chapters)
    setStep('survey')
  }

  function handleSurveyComplete(surveyAnswers) {
    setAnswers(surveyAnswers)
    setStep('results')
  }

  function handleRestart() {
    setStep('class-select')
    setSelectedClass(null)
    setSelectedChapters([])
    setAnswers([])
  }

  const questions = getQuestions()

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-logo">Exam Prepper</span>
        {selectedClass && <span className="app-badge">{selectedClass}</span>}
        {selectedChapters.length > 0 && (
          <span className="app-badge app-badge--light">
            Ch. {selectedChapters.join(', ')}
          </span>
        )}
      </header>
      <main className="app-main">
        {step === 'class-select' && (
          <ClassSelector onSelect={handleClassSelect} />
        )}
        {step === 'textbook-confirm' && (
          <TextbookConfirm selectedClass={selectedClass} onConfirm={handleTextbookConfirm} />
        )}
        {step === 'chapter-select' && (
          <ChapterSelector selectedClass={selectedClass} onConfirm={handleChapterConfirm} />
        )}
        {step === 'survey' && (
          <Survey questions={questions} onComplete={handleSurveyComplete} />
        )}
        {step === 'results' && (
          <Results questions={questions} answers={answers} onRestart={handleRestart} />
        )}
      </main>
    </div>
  )
}
