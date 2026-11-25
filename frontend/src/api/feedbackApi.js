import axiosClient from "./axiosClient";

export async function createFeedback(payload) {
  const { data } = await axiosClient.post("/feedback", payload);
  return data.feedback;
}

export async function fetchAllFeedback() {
  const { data } = await axiosClient.get("/feedback");
  return data.feedback;
}
