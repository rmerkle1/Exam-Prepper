import React from 'react'

export default function TextbookConfirm({ selectedClass, onConfirm }) {
  return (
    <div className="card centered">
      <h2>Confirm your textbook</h2>
      <p className="subtitle">This quiz is built around the following edition. Make sure it matches yours before continuing.</p>
      <div className="textbook-card">
        <div className="textbook-spine" />
        <div className="textbook-info">
          <div className="textbook-title">OpenStax Chemistry 2e</div>
          <div className="textbook-authors">Langley, Bier, Blaser, et al.</div>
          <div className="textbook-detail">{selectedClass} topics — Chapters 1–11</div>
        </div>
      </div>
      <button className="btn-primary" onClick={onConfirm}>
        That's my textbook — start the check-in
      </button>
    </div>
  )
}
