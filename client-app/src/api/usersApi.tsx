import api from "../api/axiosClient";

export async function getCachedUsers() {
  const res = await api.get("/identity/users");
  return res.data;
}
