import React from 'react';
import { CheckIcon, CloseIcon } from './Icons';

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
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-sm, 6px)',
        backgroundColor: 'var(--status-completed-bg, #dcfce7)',
        border: '1px solid var(--status-completed-border, #bbf7d0)',
        color: 'var(--status-completed-text, #166534)',
        fontSize: '13.5px',
        marginBottom: '1rem',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <span style={{ color: 'var(--status-completed, #16a34a)', flexShrink: 0, display: 'flex' }}>
          <CheckIcon size={18} />
        </span>
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--status-completed-text, #166534)',
            cursor: 'pointer',
            padding: '0.15rem',
          }}
        >
          <CloseIcon size={14} />
        </button>
      )}
    </div>
  );
}
