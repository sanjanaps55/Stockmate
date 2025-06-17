// /client/src/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Pulls from Vercel env var
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
