import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ isOpen, onClose }) {
  const mainNav = [
    {
      title: 'OVERVIEW',
      items: [
        { path: '/', label: 'Dashboard', icon: '📊' },
      ],
    },
    {
      title: 'PATIENT DESK',
      items: [
        { path: '/register-patient', label: 'Register Patient', icon: '👤' },
        { path: '/search-patients', label: 'Search Patients', icon: '🔍' },
      ],
    },
    {
      title: 'CONSULTATIONS',
      items: [
        { path: '/new-consultation', label: 'New Consultation', icon: '📋' },
        { path: '/consultations', label: 'Consultation Records', icon: '📑' },
      ],
    },
    {
      title: 'QUEUES & PROCESSING',
      items: [
        { path: '/doctor-queues', label: 'Doctor Queues', icon: '👥' },
        { path: '/process-patient', label: 'Process Patient', icon: '🩺' },
      ],
    },
    {
      title: 'HOSPITAL STAFF',
      items: [
        { path: '/doctors', label: 'Doctors Directory', icon: '👨‍⚕️' },
      ],
    },
    {
      title: 'WORKFLOW ACTIONS',
      items: [
        { path: '/update-patient', label: 'Update Patient', icon: '✏️' },
        { path: '/cancel-consultation', label: 'Cancel Consultation', icon: '🚫' },
      ],
    },
  ];

  return (
    <aside
      className={`app-sidebar ${isOpen ? 'open' : ''}`}
      style={{
        width: '240px',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        minHeight: 'calc(100vh - 61px)',
        borderRight: '1px solid #1e293b',
        transition: 'transform 0.2s ease',
      }}
    >
      <div style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {mainNav.map((section, idx) => (
          <div key={idx}>
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: '700',
                letterSpacing: '0.05em',
                color: '#94a3b8',
                padding: '0 0.5rem 0.35rem 0.5rem',
              }}
            >
              {section.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    backgroundColor: isActive ? '#2563eb' : 'transparent',
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? '600' : '400',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
