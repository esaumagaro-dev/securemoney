import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const rt = localStorage.getItem("refresh_token");
      if (rt) {
        try {
          const r = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refresh_token: rt },
            { headers: { "Content-Type": "application/json" } }
          );
          localStorage.setItem("access_token", r.data.access_token);
          if (r.data.refresh_token) localStorage.setItem("refresh_token", r.data.refresh_token);
          original.headers.Authorization = `Bearer ${r.data.access_token}`;
          return api(original);
        } catch {}
      }
    }
    return Promise.reject(error);
  }
);

export default api;
