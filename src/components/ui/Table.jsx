
import React from 'react';

function Table({ title, headers, data }) {
  if (!data || data.length === 0) {
    return (
      <div className="entries-table">
        <h3>{title}</h3>
        <p>No entries found</p>
      </div>
    );
  }

  return (
    <div className="entries-table">
      <h3>{title}</h3>
      <table>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
