import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Header({ backendConnected, onToggleSidebar }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.5rem',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0.35rem 0.5rem',
              cursor: 'pointer',
              color: '#334155',
            }}
          >
            ☰
          </button>
        )}

        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1.2rem',
            }}
          >
            +
          </div>
          <div>
            <h1 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              Hospital Patient Queue Management System
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
              C++ DSA Backend Core &bull; React Operator Desk
            </p>
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Backend Connectivity Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.8rem',
            fontWeight: '600',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: backendConnected ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${backendConnected ? '#bbf7d0' : '#fecaca'}`,
            color: backendConnected ? '#16a34a' : '#dc2626',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: backendConnected ? '#16a34a' : '#dc2626',
            }}
          />
          {backendConnected ? 'C++ Core Connected' : 'C++ Core Disconnected'}
        </div>

        {/* Live Clock */}
        <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>
          {time}
        </div>

        {/* Desk Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.3rem 0.75rem',
            backgroundColor: '#f1f5f9',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: '700',
            color: '#1e293b',
          }}
        >
          Operator Desk
        </div>
      </div>
    </header>
  );
}
