import api from "./axiosClient";

export async function getNotifications() {
  const res = await api.get("/notifications/notifications");
  return res.data;
}
