import React from 'react';
import Badge from '../common/Badge';

export default function QueueItem({
  item,
  isNext = false,
  index,
  style = {}
}) {
  if (!item) return null;

  const isEmergency = item.emergency;
  const formattedToken = item.formattedToken || String(item.tokenNo).padStart(3, '0');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 0.85rem',
        borderRadius: 'var(--radius-sm, 6px)',
        backgroundColor: isNext
          ? (isEmergency ? 'var(--status-emergency-bg, #fee2e2)' : 'var(--primary-subtle, #eff6ff)')
          : 'var(--surface, #ffffff)',
        border: `1px solid ${
          isNext
            ? (isEmergency ? 'var(--status-emergency-border, #fecaca)' : 'var(--primary-border, #bfdbfe)')
            : 'var(--border, #e4e7ec)'
        }`,
        boxShadow: isNext ? 'var(--shadow-xs, 0 1px 2px rgba(16, 24, 40, 0.04))' : 'none',
        marginBottom: '0.45rem',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {index !== undefined && (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)', fontWeight: '600', width: '18px' }}>
            #{index + 1}
          </span>
        )}
        <div
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '14px',
            fontWeight: '700',
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-xs, 4px)',
            backgroundColor: isEmergency ? 'var(--status-emergency, #dc2626)' : 'var(--primary, #2563eb)',
            color: '#ffffff',
            letterSpacing: '0.04em',
            lineHeight: 1.2,
          }}
        >
          {formattedToken}
        </div>
        <div>
          <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-main, #172033)' }}>
            Patient #{item.patientId}
          </div>
          {item.healthIssue && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.healthIssue}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {isEmergency && (
          <Badge variant="emergency" size="sm">
            EMERGENCY
          </Badge>
        )}
        {isNext && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-xs, 4px)',
              backgroundColor: isEmergency ? 'var(--status-emergency-bg, #fee2e2)' : 'var(--primary-subtle, #eff6ff)',
              color: isEmergency ? 'var(--status-emergency-text, #991b1b)' : 'var(--primary, #2563eb)',
              border: `1px solid ${isEmergency ? 'var(--status-emergency-border, #fecaca)' : 'var(--primary-border, #bfdbfe)'}`,
            }}
          >
            NEXT IN LINE
          </span>
        )}
      </div>
    </div>
  );
}
