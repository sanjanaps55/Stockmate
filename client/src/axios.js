// client/src/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: "https://stockmate-66d8.onrender.com",  // 🔥 Hardcoded your Render backend URL
});

export default api;
