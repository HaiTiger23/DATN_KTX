/**
 * Base URL for API. In dev, Vite proxies `/api` → backend (see vite.config.js).
 */
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5556/api' : 'http://localhost:5556/api');
