import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function DoctorCard({
  doctor,
  queueSummary,
  onSelect,
  selected = false,
  actions,
  style = {}
}) {
  if (!doctor) return null;

  const totalWaiting = queueSummary?.totalWaiting ?? 0;
  const emergencyWaiting = queueSummary?.emergencyWaiting ?? 0;
  const hasCurrent = queueSummary?.hasCurrentConsultation ?? false;

  return (
    <Card
      style={{
        border: selected ? '2px solid var(--primary, #2563eb)' : '1px solid var(--border, #e4e7ec)',
        backgroundColor: selected ? 'var(--primary-subtle, #eff6ff)' : 'var(--surface, #ffffff)',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all var(--transition-fast, 0.15s ease)',
        ...style
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary, #667085)', letterSpacing: '0.04em' }}>
              DOCTOR #{doctor.doctorId}
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main, #172033)', marginTop: '0.15rem' }}>
              {doctor.doctorName}
            </h4>
            <div style={{ fontSize: '13px', color: 'var(--primary, #2563eb)', fontWeight: '500', marginTop: '0.1rem' }}>
              {doctor.specialization}
            </div>
          </div>
          <div
            style={{
              padding: '0.2rem 0.55rem',
              backgroundColor: 'var(--surface-muted, #f1f5f9)',
              borderRadius: 'var(--radius-xs, 4px)',
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--text-main, #172033)',
              border: '1px solid var(--border, #e4e7ec)',
              whiteSpace: 'nowrap',
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
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-light, #f1f5f9)',
            fontSize: '13px',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-secondary, #667085)', fontSize: '12px' }}>Queue:</span>
            <Badge variant={totalWaiting > 0 ? 'waiting' : 'default'} size="sm">
              {totalWaiting} waiting
            </Badge>
            {emergencyWaiting > 0 && (
              <Badge variant="emergency" size="sm">
                {emergencyWaiting} EMG
              </Badge>
            )}
            {hasCurrent && (
              <Badge variant="inConsultation" size="sm">
                In Room
              </Badge>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {actions}
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
      </div>
    </Card>
  );
}
