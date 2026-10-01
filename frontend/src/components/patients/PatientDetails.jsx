import React from 'react';

export default function PatientDetails({ patient, style = {} }) {
  if (!patient) return null;

  const fields = [
    { label: 'Patient ID', value: `#${patient.patientId}`, highlight: true },
    { label: 'Patient Name', value: patient.patientName },
    { label: 'Age', value: `${patient.age} yrs` },
    { label: 'Gender', value: patient.gender },
    { label: 'Phone Number', value: patient.phone },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-alt, #f8fafc)',
        borderRadius: 'var(--radius-md, 8px)',
        border: '1px solid var(--border, #e4e7ec)',
        padding: '1rem 1.25rem',
        ...style
      }}
    >
      <div style={{
        fontSize: '11px',
        fontWeight: '600',
        color: 'var(--text-secondary, #667085)',
        textTransform: 'uppercase',
        marginBottom: '0.75rem',
        letterSpacing: '0.04em'
      }}>
        Patient Record (Verified)
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
        }}
      >
        {fields.map((f, idx) => (
          <div key={idx}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)', marginBottom: '0.2rem' }}>
              {f.label}
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: f.highlight ? '700' : '500',
                color: f.highlight ? 'var(--primary, #2563eb)' : 'var(--text-main, #172033)',
              }}
            >
              {f.value || '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
