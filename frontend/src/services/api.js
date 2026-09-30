// ==============================================================
// Hospital Patient Queue Management System - API Client Service
// Strictly communicates via HTTP/REST JSON with C++ Backend
// Note: Frontend NEVER connects directly to MongoDB
// ==============================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Universal request wrapper for C++ REST API
 * Automatically handles JSON parsing, uniform envelope unwrapping,
 * and user-friendly error formatting.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = result.error || result.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = result;
      throw error;
    }

    return result;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('Unable to connect to C++ backend server. Ensure backend is running.');
      networkError.status = 503;
      throw networkError;
    }
    throw error;
  }
}

export const api = {
  // 1. Health & Status
  getHealth: () => request('/health'),
  getStatus: () => request('/status'),

  // 2. Patient Management
  registerPatient: (patientData) =>
    request('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    }),
  getPatientById: (id) => request(`/patients/${id}`),
  getPatientByPhone: (phone) => request(`/patients/search?phone=${encodeURIComponent(phone)}`),
  updatePatient: (id, patientData) =>
    request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    }),
  getPatients: () => request('/patients'),
  getAllPatients: () => request('/patients'), // convenient alias

  // 3. Doctor Management
  getDoctors: () => request('/doctors'),
  getAllDoctors: () => request('/doctors'), // convenient alias
  getDoctor: (id) => request(`/doctors/${id}`),
  getDoctorById: (id) => request(`/doctors/${id}`), // convenient alias
  addDoctor: (doctorData) =>
    request('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    }),

  // 4. Consultation Workflow
  registerConsultation: (consultationData) =>
    request('/consultations', {
      method: 'POST',
      body: JSON.stringify(consultationData),
    }),
  getConsultations: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.doctorId) query.append('doctorId', params.doctorId);
    if (params.patientId) query.append('patientId', params.patientId);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/consultations${queryString}`);
  },
  getAllConsultations: (params) => api.getConsultations(params), // alias
  getConsultationByToken: (token) => request(`/consultations/${token}`),
  updateConsultation: (token, updateData) =>
    request(`/consultations/${token}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),
  cancelConsultation: (token) =>
    request(`/consultations/${token}/cancel`, {
      method: 'POST',
    }),

  // 5. Queue Engine (C++ Real-Time DSA)
  getDoctorQueue: (doctorId) => request(`/queues/${doctorId}`),
  processNextPatient: (doctorId) =>
    request(`/queues/${doctorId}/process`, {
      method: 'POST',
    }),

  // 6. Dashboard Metrics
  getDashboardStats: () => request('/dashboard/stats'),
};

export default api;
