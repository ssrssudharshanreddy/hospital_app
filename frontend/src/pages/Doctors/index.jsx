import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DoctorCard from '../../components/doctors/DoctorCard';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import LoadingState from '../../components/common/LoadingState';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';
import api from '../../services/api';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    doctorId: '',
    doctorName: '',
    specialization: '',
    roomNo: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDoctors();
      if (res && res.data && res.data.doctors) {
        setDoctors(res.data.doctors);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch doctors list from C++ backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const docId = parseInt(newDoctor.doctorId, 10);
    const room = parseInt(newDoctor.roomNo, 10);

    if (isNaN(docId) || docId <= 0) {
      setError('Doctor ID must be a positive integer.');
      return;
    }
    if (!newDoctor.doctorName.trim()) {
      setError('Doctor Name is required.');
      return;
    }
    if (!newDoctor.specialization.trim()) {
      setError('Specialization is required.');
      return;
    }
    if (isNaN(room) || room <= 0) {
      setError('Room number must be a positive integer.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.addDoctor({
        doctorId: docId,
        doctorName: newDoctor.doctorName.trim(),
        specialization: newDoctor.specialization.trim(),
        roomNo: room,
      });

      if (res && res.success) {
        setSuccess(`Doctor ${newDoctor.doctorName} registered successfully!`);
        setShowAddModal(false);
        setNewDoctor({ doctorId: '', doctorName: '', specialization: '', roomNo: '' });
        fetchDoctors();
      }
    } catch (err) {
      setError(err.message || 'Failed to add doctor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
            Doctors Directory
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
            Attending physicians, clinical specializations, and designated consulting rooms
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" onClick={fetchDoctors} loading={loading}>
            Refresh
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            + Add Doctor
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />}

      {loading ? (
        <LoadingState message="Loading doctors catalog..." />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {doctors.map((doc) => (
            <DoctorCard key={doc.doctorId} doctor={doc} />
          ))}
        </div>
      )}

      {/* Add Doctor Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Doctor"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddDoctor} loading={submitting}>
              Register Doctor
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddDoctor}>
          <Input
            label="Doctor ID"
            name="doctorId"
            type="number"
            value={newDoctor.doctorId}
            onChange={(e) => setNewDoctor({ ...newDoctor, doctorId: e.target.value })}
            placeholder="Unique Doctor ID (e.g. 205)"
            required
          />

          <Input
            label="Doctor Name"
            name="doctorName"
            value={newDoctor.doctorName}
            onChange={(e) => setNewDoctor({ ...newDoctor, doctorName: e.target.value })}
            placeholder="e.g. Dr. Rajesh Verma"
            required
          />

          <Input
            label="Specialization"
            name="specialization"
            value={newDoctor.specialization}
            onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
            placeholder="e.g. Dermatology, Neurology"
            required
          />

          <Input
            label="Consulting Room Number"
            name="roomNo"
            type="number"
            value={newDoctor.roomNo}
            onChange={(e) => setNewDoctor({ ...newDoctor, roomNo: e.target.value })}
            placeholder="Room number (e.g. 104)"
            required
          />
        </form>
      </Modal>
    </div>
  );
}
