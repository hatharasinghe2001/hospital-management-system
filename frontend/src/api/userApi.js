import axiosClient from "./axiosClient";

export async function fetchUsers() {
  const { data } = await axiosClient.get("/users");
  return data.users;
}
