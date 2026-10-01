import React from 'react';
import { AlertIcon, CloseIcon } from './Icons';

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
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-sm, 6px)',
        backgroundColor: 'var(--status-emergency-bg, #fee2e2)',
        border: '1px solid var(--status-emergency-border, #fecaca)',
        color: 'var(--status-emergency-text, #991b1b)',
        fontSize: '13.5px',
        marginBottom: '1rem',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <span style={{ color: 'var(--status-emergency, #dc2626)', flexShrink: 0, display: 'flex' }}>
          <AlertIcon size={18} />
        </span>
        <div>
          <span style={{ fontWeight: '600' }}>Error: </span>
          <span>{message}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginLeft: '0.75rem' }}>
        {retryAction && (
          <button
            onClick={retryAction}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--status-emergency, #dc2626)',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '13px',
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: 'var(--status-emergency-text, #991b1b)',
              cursor: 'pointer',
              padding: '0.15rem',
            }}
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
