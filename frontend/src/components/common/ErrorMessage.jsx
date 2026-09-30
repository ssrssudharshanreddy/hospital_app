import React from 'react';

export default function ErrorMessage({
  message,
  onDismiss,
  retryAction,
  style = {}
}) {
  if (!message) return null;

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '0.85rem 1rem',
        borderRadius: '6px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#991b1b',
        fontSize: '0.875rem',
        marginBottom: '1rem',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚠️</span>
        <div>
          <span style={{ fontWeight: '600' }}>Error: </span>
          <span>{message}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.75rem' }}>
        {retryAction && (
          <button
            onClick={retryAction}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#dc2626',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.8rem',
            }}
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss error"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#991b1b',
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
    </div>
  );
}
