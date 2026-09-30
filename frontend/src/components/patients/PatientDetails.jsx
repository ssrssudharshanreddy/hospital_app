import React from 'react';

export default function PatientDetails({ patient, style = {} }) {
  if (!patient) return null;

  const fields = [
    { label: 'Patient ID', value: patient.patientId, highlight: true },
    { label: 'Patient Name', value: patient.patientName },
    { label: 'Age', value: `${patient.age} yrs` },
    { label: 'Gender', value: patient.gender },
    { label: 'Phone Number', value: patient.phone },
  ];

  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        padding: '1rem 1.25rem',
        ...style
      }}
    >
      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
        Verified Patient Record (Read-Only)
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
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>
              {f.label}
            </div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: f.highlight ? '700' : '600',
                color: f.highlight ? '#1d4ed8' : '#0f172a',
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
