import React from 'react';
import { RecordsIcon } from './Icons';

export default function EmptyState({
  title = 'No Records Found',
  description = 'There are no items matching this criteria at this time.',
  icon,
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
        backgroundColor: 'var(--surface, #ffffff)',
        borderRadius: 'var(--radius-md, 8px)',
        border: '1px dashed var(--border, #e4e7ec)',
        ...style
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48px',
        height: '48px',
        borderRadius: 'var(--radius-full, 9999px)',
        backgroundColor: 'var(--surface-muted, #f1f5f9)',
        color: 'var(--text-secondary, #667085)',
        marginBottom: '0.85rem'
      }}>
        {icon || <RecordsIcon size={24} />}
      </div>
      <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main, #172033)', marginBottom: '0.25rem' }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #667085)', maxWidth: '380px', marginBottom: actionButton ? '1.25rem' : 0 }}>
        {description}
      </p>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
}
