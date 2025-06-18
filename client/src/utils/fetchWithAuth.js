// client/src/utils/fetchWithAuth.js
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const config = {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  return response.json();
}
