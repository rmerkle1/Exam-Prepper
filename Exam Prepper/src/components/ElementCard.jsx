import React from 'react'

export default function ElementCard({ atomicNumber, symbol, name, atomicMass }) {
  return (
    <div className="element-card-wrap">
      <div className="element-card">
        <div className="element-number">{atomicNumber}</div>
        <div className="element-symbol">{symbol}</div>
        <div className="element-name">{name}</div>
        <div className="element-mass">{atomicMass}</div>
      </div>
    </div>
  )
}
