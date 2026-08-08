import apiClient, { setAuthToken } from "./apiClient";

const usersService = {
  async login(payload) {
    const { data } = await apiClient.post("/users/login", payload);

    const token =
      typeof data === "string"
        ? data
        : data?.token || data?.jwt || data?.accessToken || data?.data?.token;

    if (token) {
      setAuthToken(token);
    }

    return data;
  },

  async register(payload) {
    const { data } = await apiClient.post("/users", payload);
    return data;
  },

  async getUserById(id) {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },

  async updateUserById(id, payload) {
    const { data } = await apiClient.put(`/users/${id}`, payload);
    return data;
  },

  async toggleRecruiterStatus(id) {
    const { data } = await apiClient.patch(`/users/${id}`);
    return data;
  },

  async getUsers() {
    const { data } = await apiClient.get("/users");
    return data;
  },

  async deleteUserById(id) {
    const { data } = await apiClient.delete(`/users/${id}`);
    return data;
  },

  async logout() {
    setAuthToken(null);
    return { success: true };
  },

  async getProfile() {
    const { data } = await apiClient.get("/users/me");
    return data;
  },

  async updateProfile(payload) {
    const { data } = await apiClient.patch("/users/me", payload);
    return data;
  },
};

export default usersService;
