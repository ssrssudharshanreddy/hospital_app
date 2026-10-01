import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { DashboardIcon } from '../../components/common/Icons';

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
      <div style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--border-strong, #cbd5e1)', lineHeight: 1 }}>
        404
      </div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main, #172033)' }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #667085)', maxWidth: '400px' }}>
        The requested URL was not found in the Hospital Patient Queue Management System.
      </p>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Button variant="primary" icon={<DashboardIcon size={16} />}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
