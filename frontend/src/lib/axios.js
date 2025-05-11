import axios from "axios";

// Backend URLs
const EXPRESS_BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";
const GO_BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5002/api" : "/api";

// Main axios instance - points to Express backend (for auth and user endpoints)
export const axiosInstance = axios.create({
  baseURL: EXPRESS_BASE_URL,
  withCredentials: true, // send cookies with the request
});

// Golang backend axios instance - only for chat endpoints
export const goAxiosInstance = axios.create({
  baseURL: GO_BASE_URL,
  withCredentials: true, // send cookies with the request
});
