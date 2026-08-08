import axiosClient from "./axiosClient";

export async function fetchDoctors() {
  const { data } = await axiosClient.get("/doctors");
  return data.doctors;
}

export async function fetchDoctor(id) {
  const { data } = await axiosClient.get(`/doctors/${id}`);
  return data.doctor;
}

export async function fetchMyDoctorProfile() {
  const { data } = await axiosClient.get("/doctors/me");
  return data.profile;
}

export async function updateMyDoctorProfile(payload) {
  const { data } = await axiosClient.put("/doctors/me", payload);
  return data.profile;
}
