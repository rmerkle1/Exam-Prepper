import React from 'react'

export default function DataTable({ caption, headers, rows }) {
  return (
    <div className="data-table-wrap">
      {caption && <p className="data-table-caption">{caption}</p>}
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((h, i) => <th key={i}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => <td key={j}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
