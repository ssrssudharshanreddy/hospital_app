import React from 'react';
import QueueItem from './QueueItem';
import Badge from '../common/Badge';
import ConsultationStatusBadge from '../consultations/ConsultationStatusBadge';
import { PulseIcon, AlertIcon, QueueIcon } from '../common/Icons';

export default function QueueList({
  currentConsultation = null,
  emergencyQueue = [],
  normalQueue = [],
  nextPatient,
  totalWaiting = 0,
  style = {}
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', ...style }}>
      <div
        style={{
          backgroundColor: currentConsultation ? 'var(--status-consulting-bg, #eef2ff)' : 'var(--surface-alt, #f8fafc)',
          borderRadius: 'var(--radius-md, 8px)',
          border: currentConsultation ? '1px solid var(--status-consulting-border, #c7d2fe)' : '1px solid var(--border, #e4e7ec)',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: currentConsultation ? 'var(--status-consulting-text, #3730a3)' : 'var(--text-secondary, #667085)', display: 'flex' }}>
              <PulseIcon size={18} />
            </span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: currentConsultation ? 'var(--status-consulting-text, #3730a3)' : 'var(--text-secondary, #667085)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CURRENTLY CONSULTING
            </span>
          </div>
          {currentConsultation ? (
            <ConsultationStatusBadge status="In Consultation" />
          ) : (
            <span style={{ fontSize: '13px', color: 'var(--text-secondary, #667085)', fontStyle: 'italic' }}>
              No patient currently inside consultation room
            </span>
          )}
        </div>

        {currentConsultation && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--surface, #ffffff)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--status-consulting-border, #c7d2fe)',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '18px',
                  fontWeight: '700',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  backgroundColor: 'var(--status-consulting, #4f46e5)',
                  color: '#ffffff',
                }}
              >
                Token {currentConsultation.formattedToken || String(currentConsultation.tokenNo).padStart(3, '0')}
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main, #172033)' }}>
                  {currentConsultation.patientName}
                </h4>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary, #667085)', marginTop: '0.15rem' }}>
                  Patient #{currentConsultation.patientId} &bull; Chief Issue: {currentConsultation.healthIssue || 'General consultation'}
                </div>
              </div>
            </div>
            {currentConsultation.emergency && (
              <Badge variant="emergency" size="sm">
                EMERGENCY
              </Badge>
            )}
          </div>
        )}
      </div>

      <div>
        <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary, #667085)', display: 'flex' }}>
              <QueueIcon size={18} />
            </span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main, #172033)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              WAITING QUEUE
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Badge variant={totalWaiting > 0 ? 'waiting' : 'default'}>
              {totalWaiting} Total Waiting
            </Badge>
            <Badge variant="emergency" size="sm">
              {emergencyQueue.length} Emergency
            </Badge>
            <Badge variant="normal" size="sm">
              {normalQueue.length} Normal
            </Badge>
          </div>
        </div>

        {nextPatient && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 1rem',
              backgroundColor: 'var(--surface, #ffffff)',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border, #e4e7ec)',
              marginBottom: '0.85rem',
              fontSize: '13px',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary, #667085)' }}>Next in line to be examined:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontWeight: '700',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-xs, 4px)',
                  backgroundColor: nextPatient.emergency ? 'var(--status-emergency, #dc2626)' : 'var(--primary, #2563eb)',
                  color: '#ffffff',
                }}
              >
                Token {nextPatient.formattedToken || String(nextPatient.tokenNo).padStart(3, '0')}
              </span>
              <span style={{ fontWeight: '600', color: 'var(--text-main, #172033)' }}>
                {nextPatient.patientName || `Patient #${nextPatient.patientId}`}
              </span>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--surface, #ffffff)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--status-emergency-border, #fecaca)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--status-emergency-bg, #fee2e2)',
              borderBottom: '1px solid var(--status-emergency-border, #fecaca)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--status-emergency, #dc2626)', display: 'flex' }}>
                <AlertIcon size={16} />
              </span>
              <h4 style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--status-emergency-text, #991b1b)' }}>
                Emergency Queue
              </h4>
            </div>
            <Badge variant="emergency" size="sm">
              {emergencyQueue.length}
            </Badge>
          </div>
          <div style={{ padding: '0.75rem', minHeight: '120px' }}>
            {emergencyQueue.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary, #667085)', fontSize: '13px', padding: '1.5rem 0' }}>
                No emergency patients waiting.
              </div>
            ) : (
              emergencyQueue.map((item, idx) => (
                <QueueItem
                  key={item.tokenNo}
                  item={item}
                  index={idx}
                  isNext={nextPatient && nextPatient.tokenNo === item.tokenNo}
                />
              ))
            )}
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--surface, #ffffff)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--primary-border, #bfdbfe)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--primary-subtle, #eff6ff)',
              borderBottom: '1px solid var(--primary-border, #bfdbfe)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--primary, #2563eb)', display: 'flex' }}>
                <QueueIcon size={16} />
              </span>
              <h4 style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--primary, #2563eb)' }}>
                Normal Queue
              </h4>
            </div>
            <Badge variant="normal" size="sm">
              {normalQueue.length}
            </Badge>
          </div>
          <div style={{ padding: '0.75rem', minHeight: '120px' }}>
            {normalQueue.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary, #667085)', fontSize: '13px', padding: '1.5rem 0' }}>
                No normal consultations waiting.
              </div>
            ) : (
              normalQueue.map((item, idx) => (
                <QueueItem
                  key={item.tokenNo}
                  item={item}
                  index={idx}
                  isNext={nextPatient && nextPatient.tokenNo === item.tokenNo}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
