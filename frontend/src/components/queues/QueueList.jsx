import React from 'react';
import QueueItem from './QueueItem';
import Badge from '../common/Badge';
import ConsultationStatusBadge from '../consultations/ConsultationStatusBadge';

export default function QueueList({
  currentConsultation = null,
  emergencyQueue = [],
  normalQueue = [],
  nextPatient,
  effectiveProcessingOrder = '',
  totalWaiting = 0,
  style = {}
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', ...style }}>
      {/* SECTION: CURRENTLY CONSULTING */}
      <div
        style={{
          backgroundColor: currentConsultation ? '#faf5ff' : '#f8fafc',
          borderRadius: '8px',
          border: currentConsultation ? '1.5px solid #ddd6fe' : '1px solid #e2e8f0',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🩺</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: currentConsultation ? '#6b21a8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CURRENTLY CONSULTING
            </span>
          </div>
          {currentConsultation ? (
            <ConsultationStatusBadge status="In Consultation" />
          ) : (
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
              No patient currently inside doctor's room
            </span>
          )}
        </div>

        {currentConsultation && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              padding: '0.85rem 1rem',
              borderRadius: '6px',
              border: '1px solid #e9d5ff',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.35rem',
                  fontWeight: '800',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                }}
              >
                Token {currentConsultation.formattedToken || String(currentConsultation.tokenNo).padStart(3, '0')}
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                  {currentConsultation.patientName}
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
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

      {/* SECTION: WAITING */}
      <div>
        <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            WAITING QUEUE
          </span>
        </div>

        {/* Summary Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1rem',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b' }}>
              Waiting Status:
            </span>
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

          {nextPatient && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>Next in turn to be called:</span>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontWeight: '700',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: nextPatient.emergency ? '#dc2626' : '#2563eb',
                  color: '#ffffff',
                }}
              >
                Token {nextPatient.formattedToken || String(nextPatient.tokenNo).padStart(3, '0')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Effective Processing Order from C++ Backend */}
      {effectiveProcessingOrder && (
        <div
          style={{
            padding: '0.65rem 1rem',
            backgroundColor: '#f1f5f9',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            fontSize: '0.8rem',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontWeight: '700', color: '#0f172a' }}>C++ Processing Order:</span>
          <span style={{ fontFamily: 'monospace', color: '#2563eb', fontWeight: '600' }}>
            {effectiveProcessingOrder}
          </span>
        </div>
      )}

      {/* Grid of Queues: Emergency & Normal */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Emergency Queue (Priority) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fef2f2',
              borderBottom: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem' }}>🚨</span>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#991b1b' }}>
                Emergency Queue
              </h4>
            </div>
            <Badge variant="emergency" size="sm">
              {emergencyQueue.length}
            </Badge>
          </div>
          <div style={{ padding: '0.75rem', minHeight: '120px' }}>
            {emergencyQueue.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', padding: '1.5rem 0' }}>
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

        {/* Normal Queue (FIFO) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #bae6fd',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#f0f9ff',
              borderBottom: '1px solid #bae6fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem' }}>👥</span>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0369a1' }}>
                Normal Queue (FIFO)
              </h4>
            </div>
            <Badge variant="normal" size="sm">
              {normalQueue.length}
            </Badge>
          </div>
          <div style={{ padding: '0.75rem', minHeight: '120px' }}>
            {normalQueue.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', padding: '1.5rem 0' }}>
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
