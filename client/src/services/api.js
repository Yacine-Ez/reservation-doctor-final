import axios from "axios";

const API = axios.create({
  baseURL: "https://reservation-doctor-final-1.onrender.com/api"|| "/api",
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
export const getAppointments = (doctorId) =>
  API.get("/appointments", { params: doctorId ? { doctorId } : {} });
export const createAppointment = (payload) => API.post("/appointments", payload);
export const updateChatSlots = (id, slots) => API.put(`/chats/${id}/slots`, { slots });
export const updateAppointmentStatus = (id, status) =>
  API.put(`/appointments/${id}`, { status });
