import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function PatientCard({
  patient,
  onSelect,
  selectLabel = 'Select Patient',
  onEdit,
  style = {}
}) {
  if (!patient) return null;

  return (
    <Card
      style={{
        borderLeft: '4px solid #2563eb',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe'
              }}
            >
              ID: {patient.patientId}
            </span>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
              {patient.patientName}
            </h4>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.825rem', color: '#64748b' }}>
            <span>Age: <strong style={{ color: '#334155' }}>{patient.age}</strong></span>
            <span>Gender: <strong style={{ color: '#334155' }}>{patient.gender}</strong></span>
            <span>Phone: <strong style={{ color: '#334155' }}>{patient.phone}</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(patient)}>
              Edit
            </Button>
          )}
          {onSelect && (
            <Button variant="primary" size="sm" onClick={() => onSelect(patient)}>
              {selectLabel}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
