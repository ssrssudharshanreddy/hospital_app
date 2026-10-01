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
        borderRadius: 'var(--radius-md, 8px)',
        border: '1px solid var(--border, #e4e7ec)',
        backgroundColor: 'var(--surface, #ffffff)',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '13.5px',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--surface-alt, #f8fafc)',
              borderBottom: '1px solid var(--border, #e4e7ec)',
            }}
          >
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{
                  padding: '0.75rem 1rem',
                  fontWeight: '600',
                  color: 'var(--text-secondary, #667085)',
                  fontSize: '12px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  width: col.width || 'auto',
                  textAlign: col.align || 'left',
                  whiteSpace: 'nowrap',
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
                  color: 'var(--text-secondary, #667085)',
                  fontSize: '13.5px',
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
                  borderBottom: rowIdx === data.length - 1 ? 'none' : '1px solid var(--border-light, #f1f5f9)',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color var(--transition-fast, 0.12s ease)',
                }}
                onMouseEnter={(e) => {
                  if (onRowClick) e.currentTarget.style.backgroundColor = 'var(--surface-alt, #f8fafc)';
                }}
                onMouseLeave={(e) => {
                  if (onRowClick) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    style={{
                      padding: '0.75rem 1rem',
                      color: 'var(--text-main, #172033)',
                      textAlign: col.align || 'left',
                      verticalAlign: 'middle',
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
