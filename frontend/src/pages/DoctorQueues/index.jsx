import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DoctorSelector from '../../components/doctors/DoctorSelector';
import QueueList from '../../components/queues/QueueList';
import LoadingState from '../../components/common/LoadingState';
import ErrorMessage from '../../components/common/ErrorMessage';
import { RefreshIcon } from '../../components/common/Icons';
import api from '../../services/api';

export default function DoctorQueuesPage() {
  const [searchParams] = useSearchParams();
  const queryDoctorId = searchParams.get('doctorId');

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.getDoctors();
        if (res && res.data && res.data.doctors && res.data.doctors.length > 0) {
          setDoctors(res.data.doctors);
          const initialId = queryDoctorId ? Number(queryDoctorId) : res.data.doctors[0].doctorId;
          setSelectedDoctorId(initialId);
        }
      } catch (err) {
        setError(err.message || 'Failed to load doctors list.');
      }
    };
    fetchDoctors();
  }, [queryDoctorId]);

  const fetchQueue = async (docId) => {
    const id = docId || selectedDoctorId;
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDoctorQueue(id);
      if (res && res.data) {
        setQueueData(res.data);
      }
    } catch (err) {
      setError(err.message || `Failed to fetch queue for Doctor #${id}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoctorId) {
      fetchQueue(selectedDoctorId);
    }
  }, [selectedDoctorId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main, #172033)', letterSpacing: '-0.02em' }}>
            Doctor Queues
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #667085)', marginTop: '0.15rem' }}>
            Live waiting queues and active consultations by doctor
          </p>
        </div>

        <Button variant="outline" onClick={() => fetchQueue(selectedDoctorId)} loading={loading} icon={<RefreshIcon size={16} />}>
          Refresh Queue
        </Button>
      </div>

      {error && <ErrorMessage message={error} retryAction={() => fetchQueue(selectedDoctorId)} />}

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ maxWidth: '420px', flex: 1 }}>
            <DoctorSelector
              doctors={doctors}
              selectedDoctorId={selectedDoctorId}
              onChange={(id) => setSelectedDoctorId(id)}
              label="Doctor"
            />
          </div>

          {queueData?.doctor && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                backgroundColor: 'var(--surface-alt, #f8fafc)',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border, #e4e7ec)',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Doctor</span>
                <p style={{ fontWeight: '600', color: 'var(--text-main, #172033)', fontSize: '13.5px' }}>{queueData.doctor.doctorName}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Specialization</span>
                <p style={{ fontWeight: '500', color: 'var(--primary, #2563eb)', fontSize: '13.5px' }}>{queueData.doctor.specialization}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Consulting Room</span>
                <p style={{ fontWeight: '600', color: 'var(--text-main, #172033)', fontSize: '13.5px' }}>Room {queueData.doctor.roomNo}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {loading && !queueData ? (
        <LoadingState message="Loading doctor waiting queue..." />
      ) : queueData ? (
        <QueueList
          currentConsultation={queueData.currentConsultation}
          emergencyQueue={queueData.emergencyQueue || []}
          normalQueue={queueData.normalQueue || []}
          nextPatient={queueData.nextPatient}
          totalWaiting={queueData.totalWaiting || 0}
        />
      ) : (
        <Card>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary, #667085)', padding: '2rem' }}>
            Select an attending doctor to inspect their waiting queue.
          </div>
        </Card>
      )}
    </div>
  );
}
