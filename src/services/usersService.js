import apiClient, { setAuthToken } from "./apiClient";

const usersService = {
  async login(payload) {
    const { data } = await apiClient.post("/users/login", payload);

    const token =
      data?.token || data?.jwt || data?.accessToken || data?.data?.token;

    if (token) {
      setAuthToken(token);
    }

    return data;
  },

  async register(payload) {
    const { data } = await apiClient.post("/users", payload);
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
