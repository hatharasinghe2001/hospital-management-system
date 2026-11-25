import axiosClient from "./axiosClient";

export async function fetchNotifications() {
  const { data } = await axiosClient.get("/notifications");
  return data.notifications;
}

export async function markNotificationRead(id) {
  const { data } = await axiosClient.patch(`/notifications/${id}/read`);
  return data.notification;
}
