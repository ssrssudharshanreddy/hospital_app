import React from 'react';

export default function Card({ title, subtitle, children, actions, style = {} }) {
  return (
    <div style={{
      backgroundColor: 'var(--surface, #ffffff)',
      borderRadius: 'var(--radius-md, 8px)',
      border: '1px solid var(--border, #e4e7ec)',
      boxShadow: 'var(--shadow-xs, 0 1px 2px rgba(16, 24, 40, 0.04))',
      overflow: 'hidden',
      ...style
    }}>
      {(title || actions) && (
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border, #e4e7ec)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          backgroundColor: 'var(--surface, #ffffff)'
        }}>
          <div>
            {title && (
              <h3 style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: 'var(--text-main, #172033)',
                letterSpacing: '-0.01em'
              }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary, #667085)',
                marginTop: '0.15rem'
              }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div style={{ padding: '1.25rem' }}>
        {children}
      </div>
    </div>
  );
}
