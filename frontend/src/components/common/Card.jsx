import React from 'react';

export default function Card({ title, subtitle, children, actions, style = {} }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      ...style
    }}>
      {(title || actions) && (
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            {title && <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>{subtitle}</p>}
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
