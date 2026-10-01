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
        borderLeft: '4px solid var(--primary, #2563eb)',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '600',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-xs, 4px)',
                backgroundColor: 'var(--primary-subtle, #eff6ff)',
                color: 'var(--primary, #2563eb)',
                border: '1px solid var(--primary-border, #bfdbfe)'
              }}
            >
              #{patient.patientId}
            </span>
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main, #172033)' }}>
              {patient.patientName}
            </h4>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '13px', color: 'var(--text-secondary, #667085)', flexWrap: 'wrap' }}>
            <span>Age: <strong style={{ color: 'var(--text-main, #172033)' }}>{patient.age}</strong></span>
            <span>Gender: <strong style={{ color: 'var(--text-main, #172033)' }}>{patient.gender}</strong></span>
            <span>Phone: <strong style={{ color: 'var(--text-main, #172033)' }}>{patient.phone}</strong></span>
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
