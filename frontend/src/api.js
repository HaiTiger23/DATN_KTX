import { API_URL } from './constants';

function getToken() {
  return localStorage.getItem('token');
}

/**
 * @param {string} endpoint
 * @param {string} [method]
 * @param {object|null} [body]
 * @param {(msg: string, type?: string) => void} showToast
 */
export async function fetchAPI(endpoint, method = 'GET', body = null, showToast = () => {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const text = await res.text();
    let data = {};
    if (text && text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        const snippet = text.slice(0, 160).trim();
        throw new Error(
          snippet || `Máy chủ trả về không phải JSON (HTTP ${res.status})`,
        );
      }
    } else if (!res.ok) {
      throw new Error(`Lỗi HTTP ${res.status}`);
    }

    if (!res.ok) {
      const msg = data?.message ?? data?.error;
      throw new Error(typeof msg === 'string' ? msg : 'Có lỗi xảy ra');
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
    showToast(message, 'error');
    if (
      message.includes('token') ||
      message.includes('Auth') ||
      message.includes('xác thực')
    ) {
      window.dispatchEvent(new CustomEvent('ktx:auth-failed'));
    }
    throw err;
  }
}

export function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}
