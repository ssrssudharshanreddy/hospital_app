import React from 'react';

export default function Badge({ variant = 'default', children, size = 'md' }) {
  const stylesByVariant = {
    emergency: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fecaca'
    },
    normal: {
      backgroundColor: '#f0f9ff',
      color: '#0284c7',
      border: '1px solid #bae6fd'
    },
    waiting: {
      backgroundColor: '#fffbeb',
      color: '#d97706',
      border: '1px solid #fde68a'
    },
    inConsultation: {
      backgroundColor: '#f5f3ff',
      color: '#7c3aed',
      border: '1px solid #ddd6fe'
    },
    completed: {
      backgroundColor: '#f0fdf4',
      color: '#16a34a',
      border: '1px solid #bbf7d0'
    },
    cancelled: {
      backgroundColor: '#f8fafc',
      color: '#64748b',
      border: '1px solid #e2e8f0'
    },
    default: {
      backgroundColor: '#f1f5f9',
      color: '#334155',
      border: '1px solid #cbd5e1'
    }
  };

  const currentStyle = stylesByVariant[variant] || stylesByVariant.default;
  const padding = size === 'sm' ? '0.15rem 0.45rem' : '0.25rem 0.65rem';
  const fontSize = size === 'sm' ? '0.7rem' : '0.75rem';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      borderRadius: '9999px',
      padding,
      fontSize,
      letterSpacing: '0.02em',
      ...currentStyle
    }}>
      {children}
    </span>
  );
}
