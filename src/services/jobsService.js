import apiClient from "./apiClient";

const jobsService = {
  async getJobs(options = {}) {
    const { params = {}, headers, validateStatus } = options;
    const response = await apiClient.get("/jobs", {
      params,
      headers,
      validateStatus,
    });
    return response;
  },

  async getJobById(id) {
    const { data } = await apiClient.get(`/jobs/${id}`);
    return data;
  },

  async getMyJobs() {
    const { data } = await apiClient.get("/jobs/my-jobs");
    return data;
  },

  async createJob(payload) {
    const { data } = await apiClient.post("/jobs", payload);
    return data;
  },

  async updateJob(id, payload) {
    const { data } = await apiClient.put(`/jobs/${id}`, payload);
    return data;
  },

  async deleteJob(id) {
    const { data } = await apiClient.delete(`/jobs/${id}`);
    return data;
  },

  async toggleSaveJob(id) {
    const { data } = await apiClient.patch(`/jobs/${id}`);
    return data;
  },
};

export default jobsService;
