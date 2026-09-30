import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

export default function NotFoundPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
        gap: '1rem',
      }}
    >
      <div style={{ fontSize: '3.5rem', fontWeight: '800', color: '#cbd5e1' }}>404</div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '400px' }}>
        The route you are looking for does not exist in the Hospital Patient Queue Management System.
      </p>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Button variant="primary">Return to Dashboard</Button>
      </Link>
    </div>
  );
}
