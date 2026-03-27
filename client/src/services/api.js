import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

export const getDoctors = () => API.get("/doctors");
export const getDoctorById = (id) => API.get(`/doctors/${id}`);
export const updateDoctor = (id, payload) => API.put(`/doctors/${id}`, payload);
export const createDoctor = (payload) => API.post("/doctors", payload);
export const deleteDoctor = (id, ownerKey) =>
  API.delete(`/doctors/${id}`, {
    data: { ownerKey },
  });

export const triageWithAi = (payload) => API.post("/ai/triage", payload);

export const getChats = () => API.get("/chats");
export const getChatById = (id) => API.get(`/chats/${id}`);
export const createChat = (payload) => API.post("/chats", payload);
export const sendChatMessage = (id, payload) => API.post(`/chats/${id}/messages`, payload);
export const getPatients = () => API.get("/patients");
export const getAppointments = (doctorId) =>
  API.get("/appointments", { params: doctorId ? { doctorId } : {} });
export const getAppointmentsForPatient = (patientKey) =>
  API.get("/appointments", { params: patientKey ? { patientKey } : {} });
export const createAppointment = (payload) => API.post("/appointments", payload);
export const createCheckoutSession = (payload) => API.post("/payments/checkout", payload);
export const confirmCheckoutSession = (payload) => API.post("/payments/confirm", payload);
export const getPatientProfile = (patientKey) =>
  API.get("/patients/profile", { params: { patientKey } });
export const upsertPatientProfile = (payload) => API.put("/patients/profile", payload);
export const updateChatSlots = (id, slots) => API.put(`/chats/${id}/slots`, { slots });
export const updateAppointmentStatus = (id, status) =>
  API.put(`/appointments/${id}`, { status });
export const updateAppointment = (id, payload) =>
  API.put(`/appointments/${id}`, payload);
export const getDoctorAvailability = (doctorId, date) =>
  API.get(`/doctors/${doctorId}/availability`, { params: { date } });
export const getDoctorReviews = (doctorId) =>
  API.get(`/doctors/${doctorId}/reviews`);
export const createDoctorReview = (doctorId, payload) =>
  API.post(`/doctors/${doctorId}/reviews`, payload);
