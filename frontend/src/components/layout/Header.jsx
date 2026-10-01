import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, PulseIcon } from '../common/Icons';

export default function Header({ backendConnected, onToggleSidebar }) {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
      setCurrentTime(now.toLocaleTimeString());
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        backgroundColor: 'var(--surface, #ffffff)',
        borderBottom: '1px solid var(--border, #e4e7ec)',
        boxShadow: 'var(--shadow-xs, 0 1px 2px rgba(16, 24, 40, 0.04))',
        position: 'sticky',
        top: 0,
        zIndex: 60,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid var(--border, #e4e7ec)',
              borderRadius: 'var(--radius-sm, 6px)',
              padding: '0.4rem',
              cursor: 'pointer',
              color: 'var(--text-main, #172033)',
            }}
          >
            <MenuIcon size={18} />
          </button>
        )}

        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--primary, #2563eb)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PulseIcon size={18} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main, #172033)', margin: 0, lineHeight: 1.2 }}>
              Hospital Patient Queue
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #667085)', margin: 0 }}>
              Reception Desk
            </p>
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.78rem',
            fontWeight: '600',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full, 9999px)',
            backgroundColor: backendConnected ? 'var(--status-completed-bg, #dcfce7)' : 'var(--status-emergency-bg, #fee2e2)',
            border: `1px solid ${backendConnected ? 'var(--status-completed-border, #bbf7d0)' : 'var(--status-emergency-border, #fecaca)'}`,
            color: backendConnected ? 'var(--status-completed-text, #166534)' : 'var(--status-emergency-text, #991b1b)',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: backendConnected ? 'var(--status-completed, #16a34a)' : 'var(--status-emergency, #dc2626)',
            }}
          />
          {backendConnected ? 'System Online' : 'System Offline'}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary, #667085)' }}>
          <span>{currentDate}</span>
          <span>&bull;</span>
          <span style={{ fontWeight: '500', color: 'var(--text-main, #172033)' }}>{currentTime}</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.25rem 0.65rem',
            backgroundColor: 'var(--surface-muted, #f1f5f9)',
            borderRadius: 'var(--radius-sm, 6px)',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'var(--text-secondary, #667085)',
          }}
        >
          Operator Desk
        </div>
      </div>
    </header>
  );
}
