// export const API_BASE_URL = "http://192.168.18.8:5001/api";
import axios from "axios";

export const API_BASE_URL = "https://backend-finance-rose.vercel.app/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
