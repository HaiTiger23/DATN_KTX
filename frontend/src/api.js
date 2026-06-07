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
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const isFormData = body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : null,
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

/**
 * Hiển thị giá trong InputNumber (nhóm nghìn kiểu vi-VN + ₫).
 * @param {number|string|undefined|null} value
 */
export function formatVndInput(value) {
  if (value === undefined || value === null || value === '') return '';
  const n = Number(value);
  if (Number.isNaN(n)) return '';
  return `${new Intl.NumberFormat('vi-VN').format(Math.trunc(n))} ₫`;
}

/**
 * Parse chuỗi trong ô nhập giá về số nguyên (đồng).
 * @param {string|undefined} display
 */
export function parseVndInput(display) {
  if (display === undefined || display === null || display === '') return null;
  const digits = String(display).replace(/\D/g, '');
  if (digits === '') return null;
  return Number(digits);
}

/**
 * Chuyển HTML (rich text) sang text thuần — preview bảng / prompt LLM.
 * @param {string} [html]
 */
export function htmlToPlainText(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Kiểm tra editor Quill/HTML không có nội dung thực (trống hoặc chỉ &lt;p&gt;&lt;br&gt;&lt;/p&gt;).
 * @param {string} [html]
 */
export function isRichTextEmpty(html) {
  return htmlToPlainText(html).length === 0;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}
