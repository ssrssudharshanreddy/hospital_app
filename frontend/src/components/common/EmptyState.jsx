import React from 'react';

export default function EmptyState({
  title = 'No Data Available',
  description = 'There are no records matching your request at this time.',
  icon = '📋',
  actionButton,
  style = {}
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px dashed #cbd5e1',
        ...style
      }}
    >
      <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{icon}</div>
      <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '380px', marginBottom: actionButton ? '1.25rem' : 0 }}>
        {description}
      </p>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
}
