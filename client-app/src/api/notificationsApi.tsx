import api from "./axiosClient";

export async function getNotifications() {
  const res = await api.get("/notifications/notifications");
  return res.data;
}

export const createNotification = async (data: any) => {
  const response = await api.post('/notifications', data);
  return response.data;
};

export const markAsRead = async (id: number) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const deleteNotification = async (id: number) => {
  await api.delete(`/notifications/${id}`);
};
