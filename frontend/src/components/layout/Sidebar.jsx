import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  DashboardIcon,
  PatientsIcon,
  RegisterIcon,
  SearchIcon,
  QueueIcon,
  ProcessIcon,
  RecordsIcon,
  DoctorIcon,
  EditIcon,
  CancelIcon,
} from '../common/Icons';

export default function Sidebar({ isOpen, onClose }) {
  const sections = [
    {
      title: 'MAIN',
      items: [
        { path: '/', label: 'Dashboard', icon: <DashboardIcon size={18} /> },
      ],
    },
    {
      title: 'PATIENTS',
      items: [
        { path: '/patients', label: 'Patients', icon: <PatientsIcon size={18} /> },
        { path: '/register-patient', label: 'Register Patient', icon: <RegisterIcon size={18} /> },
        { path: '/search-patients', label: 'Search Patients', icon: <SearchIcon size={18} /> },
      ],
    },
    {
      title: 'QUEUE',
      items: [
        { path: '/new-consultation', label: 'New Consultation', icon: <QueueIcon size={18} /> },
        { path: '/doctor-queues', label: 'Doctor Queues', icon: <QueueIcon size={18} /> },
        { path: '/process-patient', label: 'Process Patient', icon: <ProcessIcon size={18} /> },
      ],
    },
    {
      title: 'RECORDS',
      items: [
        { path: '/consultations', label: 'Consultation Records', icon: <RecordsIcon size={18} /> },
      ],
    },
    {
      title: 'STAFF',
      items: [
        { path: '/doctors', label: 'Doctors', icon: <DoctorIcon size={18} /> },
      ],
    },
    {
      title: 'ACTIONS',
      items: [
        { path: '/update-patient', label: 'Update Patient', icon: <EditIcon size={18} /> },
        { path: '/cancel-consultation', label: 'Cancel Consultation', icon: <CancelIcon size={18} /> },
      ],
    },
  ];

  return (
    <>
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />
      )}
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ padding: '1.25rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {sections.map((section, idx) => (
            <div key={idx}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                  color: 'var(--text-secondary, #667085)',
                  padding: '0 0.65rem 0.35rem 0.65rem',
                  textTransform: 'uppercase',
                }}
              >
                {section.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
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
                      borderRadius: 'var(--radius-sm, 6px)',
                      textDecoration: 'none',
                      backgroundColor: isActive ? 'var(--primary-subtle, #eff6ff)' : 'transparent',
                      color: isActive ? 'var(--primary, #2563eb)' : 'var(--text-main, #172033)',
                      fontSize: '13.5px',
                      fontWeight: isActive ? '600' : '400',
                      transition: 'all var(--transition-fast, 0.15s ease)',
                    })}
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
