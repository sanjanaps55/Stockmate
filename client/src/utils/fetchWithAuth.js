const API_BASE = "https://stockmate-66d8.onrender.com";  // HARD-CODE IT NOW

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
