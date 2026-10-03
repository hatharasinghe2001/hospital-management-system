import axiosClient from "./axiosClient";

export async function createAppointment(payload) {
  const { data } = await axiosClient.post("/appointments", payload);
  return data.appointment;
}

export async function fetchMyAppointments() {
  const { data } = await axiosClient.get("/appointments/mine");
  return data.appointments;
}

export async function fetchDoctorAppointments() {
  const { data } = await axiosClient.get("/appointments/doctor-mine");
  return data.appointments;
}

export async function fetchAllAppointments() {
  const { data } = await axiosClient.get("/appointments");
  return data.appointments;
}

export async function fetchAppointmentStats() {
  const { data } = await axiosClient.get("/appointments/stats");
  return data.stats;
}

export async function confirmAppointment(id) {
  const { data } = await axiosClient.patch(`/appointments/${id}/confirm`);
  return data.appointment;
}
