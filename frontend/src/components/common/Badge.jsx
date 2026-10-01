import React from 'react';

export default function Badge({ variant = 'default', children, size = 'md', style = {} }) {
  const stylesByVariant = {
    emergency: {
      backgroundColor: 'var(--status-emergency-bg, #fee2e2)',
      color: 'var(--status-emergency-text, #991b1b)',
      border: '1px solid var(--status-emergency-border, #fecaca)'
    },
    normal: {
      backgroundColor: 'var(--primary-subtle, #eff6ff)',
      color: 'var(--primary, #2563eb)',
      border: '1px solid var(--primary-border, #bfdbfe)'
    },
    waiting: {
      backgroundColor: 'var(--status-waiting-bg, #fef3c7)',
      color: 'var(--status-waiting-text, #92400e)',
      border: '1px solid var(--status-waiting-border, #fde68a)'
    },
    inConsultation: {
      backgroundColor: 'var(--status-consulting-bg, #eef2ff)',
      color: 'var(--status-consulting-text, #3730a3)',
      border: '1px solid var(--status-consulting-border, #c7d2fe)'
    },
    completed: {
      backgroundColor: 'var(--status-completed-bg, #dcfce7)',
      color: 'var(--status-completed-text, #166534)',
      border: '1px solid var(--status-completed-border, #bbf7d0)'
    },
    cancelled: {
      backgroundColor: 'var(--status-cancelled-bg, #f1f5f9)',
      color: 'var(--status-cancelled-text, #475569)',
      border: '1px solid var(--status-cancelled-border, #e2e8f0)'
    },
    default: {
      backgroundColor: '#f1f5f9',
      color: '#334155',
      border: '1px solid #e2e8f0'
    }
  };

  const currentStyle = stylesByVariant[variant] || stylesByVariant.default;
  const padding = size === 'sm' ? '0.15rem 0.45rem' : '0.22rem 0.6rem';
  const fontSize = size === 'sm' ? '0.72rem' : '0.78rem';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      borderRadius: 'var(--radius-full, 9999px)',
      padding,
      fontSize,
      letterSpacing: '0.02em',
      lineHeight: 1.2,
      whiteSpace: 'nowrap',
      ...currentStyle,
      ...style
    }}>
      {children}
    </span>
  );
}
