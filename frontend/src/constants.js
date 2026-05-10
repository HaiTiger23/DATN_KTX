/**
 * Base URL for API. In dev, Vite proxies `/api` → backend (see vite.config.js).
 */
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'https://datn-ktx.onrender.com/api' : 'https://datn-ktx.onrender.com/api');
