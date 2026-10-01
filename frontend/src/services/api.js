const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

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
      const networkError = new Error('Unable to connect to hospital queue backend. Ensure backend server is running.');
      networkError.status = 503;
      throw networkError;
    }
    throw error;
  }
}

export const api = {
  getHealth: () => request('/health'),
  getStatus: () => request('/status'),

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
  getDoctors: () => request('/doctors'),
  getDoctorById: (id) => request(`/doctors/${id}`),
  addDoctor: (doctorData) =>
    request('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    }),

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

  getDoctorQueue: (doctorId) => request(`/queues/${doctorId}`),
  processNextPatient: (doctorId) =>
    request(`/queues/${doctorId}/process`, {
      method: 'POST',
    }),
  completeConsultation: (doctorId) =>
    request(`/queues/${doctorId}/complete`, {
      method: 'POST',
    }),

  getDashboardStats: () => request('/dashboard/stats'),
};

export default api;
