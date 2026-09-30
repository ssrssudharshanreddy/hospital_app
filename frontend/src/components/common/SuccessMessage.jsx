import React from 'react';

export default function SuccessMessage({
  message,
  onDismiss,
  style = {}
}) {
  if (!message) return null;

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1rem',
        borderRadius: '6px',
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        color: '#166534',
        fontSize: '0.875rem',
        marginBottom: '1rem',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>✅</span>
        <div>
          <span style={{ fontWeight: '600' }}>Success: </span>
          <span>{message}</span>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss success message"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#166534',
            cursor: 'pointer',
            fontSize: '1.1rem',
            lineHeight: 1,
            padding: '0 0.25rem',
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
}
