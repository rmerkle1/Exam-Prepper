import React from 'react'
import katex from 'katex'

export default function Math({ latex }) {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: true,
  })
  return (
    <div
      className="math-display"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
