// /client/src/api.js
const baseURL = import.meta.env.VITE_API_URL;

export async function fetchWithAuth(url, method = 'GET', data = null) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const config = {
    method,
    headers,
  };

  if (data) config.body = JSON.stringify(data);

  const response = await fetch(`${baseURL}${url}`, config);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
