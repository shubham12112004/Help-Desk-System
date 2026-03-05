const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const normalizedApiUrl = rawApiUrl
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

export const API_BASE_URL = `${normalizedApiUrl}/api`;
