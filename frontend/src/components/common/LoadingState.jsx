import React from 'react';
import { SpinnerIcon } from './Icons';

export default function LoadingState({
  message = 'Loading patient queue data...',
  minHeight = '180px'
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: '0.75rem',
        color: 'var(--text-secondary, #667085)',
        padding: '1.5rem',
      }}
    >
      <div style={{ color: 'var(--primary, #2563eb)' }}>
        <SpinnerIcon size={28} />
      </div>
      <p style={{ fontSize: '13px', fontWeight: '500' }}>{message}</p>
    </div>
  );
}
