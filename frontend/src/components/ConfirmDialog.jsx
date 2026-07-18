import React from 'react';

/**
 * Reusable confirmation dialog modal
 */
export default function ConfirmDialog({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="confirm-icon">⚠️</div>
        <h2 className="confirm-title" id="confirm-title">{title}</h2>
        <p className="confirm-msg">{message}</p>
        <div className="modal-footer" style={{ justifyContent: 'center', marginTop: 20 }}>
          <button id="confirm-cancel-btn" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button id="confirm-delete-btn" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
