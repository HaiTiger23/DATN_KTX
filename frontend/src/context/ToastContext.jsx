import { createContext, useCallback, useContext, useMemo } from 'react';
import { message } from 'antd';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [messageApi, contextHolder] = message.useMessage();

  const showToast = useCallback(
    (msg, type = 'success') => {
      if (type === 'error') messageApi.error(msg);
      else messageApi.success(msg);
    },
    [messageApi],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {contextHolder}
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
