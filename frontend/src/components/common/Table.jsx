import React from 'react';

export default function Table({
  columns = [],
  data = [],
  emptyMessage = 'No records found.',
  onRowClick,
  keyExtractor = (item, index) => item.id || item._id || item.tokenNo || item.patientId || item.doctorId || index,
}) {
  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.875rem',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{
                  padding: '0.75rem 1rem',
                  fontWeight: '600',
                  color: '#475569',
                  fontSize: '0.8rem',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  width: col.width || 'auto',
                  textAlign: col.align || 'left',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '2.5rem 1rem',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '0.9rem',
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr
                key={keyExtractor(item, rowIdx)}
                onClick={() => onRowClick && onRowClick(item)}
                style={{
                  borderBottom: rowIdx === data.length - 1 ? 'none' : '1px solid #f1f5f9',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  if (onRowClick) e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (onRowClick) e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    style={{
                      padding: '0.75rem 1rem',
                      color: '#1e293b',
                      textAlign: col.align || 'left',
                    }}
                  >
                    {col.render ? col.render(item, rowIdx) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
