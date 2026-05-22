import React, { useState } from 'react'
import ClassSelector from './components/ClassSelector'
import TextbookConfirm from './components/TextbookConfirm'
import Survey from './components/Survey'
import Results from './components/Results'
import { QUESTIONS } from './data/questions'
import './App.css'

export default function App() {
  const [step, setStep] = useState('class-select')
  const [selectedClass, setSelectedClass] = useState(null)
  const [answers, setAnswers] = useState([])

  const questions = selectedClass ? QUESTIONS[selectedClass] : []

  function handleClassSelect(cls) {
    setSelectedClass(cls)
    setStep('textbook-confirm')
  }

  function handleTextbookConfirm() {
    setStep('survey')
  }

  function handleSurveyComplete(surveyAnswers) {
    setAnswers(surveyAnswers)
    setStep('results')
  }

  function handleRestart() {
    setStep('class-select')
    setSelectedClass(null)
    setAnswers([])
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-logo">Exam Prepper</span>
        {selectedClass && <span className="app-badge">{selectedClass}</span>}
      </header>
      <main className="app-main">
        {step === 'class-select' && (
          <ClassSelector onSelect={handleClassSelect} />
        )}
        {step === 'textbook-confirm' && (
          <TextbookConfirm selectedClass={selectedClass} onConfirm={handleTextbookConfirm} />
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
