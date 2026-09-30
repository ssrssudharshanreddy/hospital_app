import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DoctorSelector from '../../components/doctors/DoctorSelector';
import QueueList from '../../components/queues/QueueList';
import LoadingState from '../../components/common/LoadingState';
import ErrorMessage from '../../components/common/ErrorMessage';
import api from '../../services/api';

export default function DoctorQueuesPage() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch available doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.getDoctors();
        if (res && res.data && res.data.doctors && res.data.doctors.length > 0) {
          setDoctors(res.data.doctors);
          setSelectedDoctorId(res.data.doctors[0].doctorId);
        }
      } catch (err) {
        setError(err.message || 'Failed to load doctors list.');
      }
    };
    fetchDoctors();
  }, []);

  // 2. Fetch selected doctor's queue
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
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
            Doctor Queues Overview
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
            Live inspection of separate emergency and normal queues powered by C++ engine
          </p>
        </div>

        <Button variant="outline" onClick={() => fetchQueue(selectedDoctorId)} loading={loading}>
          Refresh Queue
        </Button>
      </div>

      {error && <ErrorMessage message={error} retryAction={() => fetchQueue(selectedDoctorId)} />}

      {/* Doctor Selection Card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ maxWidth: '420px', flex: 1 }}>
            <DoctorSelector
              doctors={doctors}
              selectedDoctorId={selectedDoctorId}
              onChange={(id) => setSelectedDoctorId(id)}
              label="Select Attending Doctor"
            />
          </div>

          {queueData?.doctor && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                backgroundColor: '#f8fafc',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Doctor Name</span>
                <p style={{ fontWeight: '700', color: '#0f172a' }}>{queueData.doctor.doctorName}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Specialization</span>
                <p style={{ fontWeight: '600', color: '#2563eb' }}>{queueData.doctor.specialization}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Consulting Room</span>
                <p style={{ fontWeight: '700', color: '#0f172a' }}>Room {queueData.doctor.roomNo}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Queue View */}
      {loading && !queueData ? (
        <LoadingState message="Fetching live queue from C++ core..." />
      ) : queueData ? (
        <QueueList
          emergencyQueue={queueData.emergencyQueue || []}
          normalQueue={queueData.normalQueue || []}
          nextPatient={queueData.nextPatient}
          effectiveProcessingOrder={queueData.effectiveProcessingOrder}
          totalWaiting={queueData.totalWaiting || 0}
        />
      ) : (
        <Card>
          <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
            Select an attending doctor to inspect their waiting queue.
          </div>
        </Card>
      )}
    </div>
  );
}
