import { useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { fetchAPI as rawFetch } from '../api';

/** Returns fetchAPI pre-bound with toast notifications. */
export function useApi() {
  const { showToast } = useToast();
  return useCallback(
    (endpoint, method = 'GET', body = null) => rawFetch(endpoint, method, body, showToast),
    [showToast],
  );
}
