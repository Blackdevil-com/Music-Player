import { useState, useCallback, useRef } from 'react';

/**
 * Toast notification hook
 * Returns { toasts, showToast, removeToast }
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const id = useRef(0);

  const showToast = useCallback((message, type = 'info') => {
    const key = ++id.current;
    setToasts((prev) => [...prev, { key, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.key !== key));
    }, 3500);
  }, []);

  const removeToast = useCallback((key) => {
    setToasts((prev) => prev.filter((t) => t.key !== key));
  }, []);

  return { toasts, showToast, removeToast };
}
