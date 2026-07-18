import React from 'react';

/**
 * Toast notification renderer
 */
export default function ToastContainer({ toasts, onRemove }) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map(({ key, message, type }) => (
        <div key={key} className={`toast ${type}`}>
          <span className="toast-icon">{icons[type] ?? 'ℹ️'}</span>
          <span className="toast-msg">{message}</span>
          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={() => onRemove(key)}
            aria-label="Dismiss notification"
            style={{ marginLeft: 'auto', padding: '4px' }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
