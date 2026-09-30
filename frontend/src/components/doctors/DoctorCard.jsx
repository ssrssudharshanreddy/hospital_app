import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function DoctorCard({
  doctor,
  queueSummary,
  onSelect,
  selected = false,
  style = {}
}) {
  if (!doctor) return null;

  const totalWaiting = queueSummary?.totalWaiting ?? 0;
  const emergencyWaiting = queueSummary?.emergencyWaiting ?? 0;

  return (
    <Card
      style={{
        border: selected ? '2px solid #2563eb' : '1px solid #e2e8f0',
        backgroundColor: selected ? '#eff6ff' : '#ffffff',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        ...style
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>
              ID: {doctor.doctorId}
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
              {doctor.doctorName}
            </h4>
            <div style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: '500' }}>
              {doctor.specialization}
            </div>
          </div>
          <div
            style={{
              padding: '0.25rem 0.6rem',
              backgroundColor: '#f1f5f9',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#334155',
              border: '1px solid #e2e8f0',
            }}
          >
            Room {doctor.roomNo}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.65rem',
            borderTop: '1px solid #f1f5f9',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: '#64748b' }}>Waiting:</span>
            <Badge variant={totalWaiting > 0 ? 'waiting' : 'default'} size="sm">
              {totalWaiting} patients
            </Badge>
            {emergencyWaiting > 0 && (
              <Badge variant="emergency" size="sm">
                {emergencyWaiting} EMG
              </Badge>
            )}
          </div>

          {onSelect && (
            <Button
              variant={selected ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onSelect(doctor)}
            >
              {selected ? 'Selected' : 'Select'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
