import axios from "axios";

const API = axios.create({baseURL: "http://localhost:5000/api",});

API.interceptors.request.use(
  (config) => {
    const localToken = localStorage.getItem("token");
    const sessionToken = sessionStorage.getItem("token");
    const token = localToken || sessionToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;