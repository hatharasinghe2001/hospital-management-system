import axiosClient from "./axiosClient";

export async function loginRequest({ username, password, portal }) {
  const { data } = await axiosClient.post("/auth/login", { username, password, portal });
  return data;
}

export async function registerPatientRequest(payload) {
  const { data } = await axiosClient.post("/auth/register", { ...payload, role: "patient" });
  return data;
}

export async function fetchMe() {
  const { data } = await axiosClient.get("/auth/me");
  return data;
}

export async function createStaffRequest(payload) {
  const { data } = await axiosClient.post("/auth/create-staff", payload);
  return data;
}

export async function updateProfileRequest(payload) {
  const { data } = await axiosClient.put("/auth/profile", payload);
  return data;
}
