import axiosClient from "./axiosClient";

export async function fetchMessageContacts() {
  const { data } = await axiosClient.get("/messages/contacts");
  return data.contacts;
}

export async function fetchConversation(userId) {
  const { data } = await axiosClient.get(`/messages/${userId}`);
  return data.messages;
}

export async function sendMessage(userId, body) {
  const { data } = await axiosClient.post(`/messages/${userId}`, { body });
  return data.message;
}

export async function fetchUnreadMessageCount() {
  const { data } = await axiosClient.get("/messages/unread-count");
  return data.count;
}
