import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthCallbackPage({ onFinish }) {
  const { login } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const errorParam = urlParams.get('error');

      if (token) {
        login(token);
        // Clean up the URL query params without reloading the page
        window.history.replaceState({}, document.title, window.location.pathname);
        if (onFinish) {
          onFinish();
        }
      } else if (errorParam) {
        setError(`Google login error: ${errorParam}`);
      } else {
        // No token and no error (e.g. user refreshed the page or landed on /auth/callback)
        // Automatically return to login/home
        if (onFinish) {
          onFinish();
        } else {
          window.location.href = '/';
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during login.');
    }
  }, [login, onFinish]);

  if (error) {
    return (
      <div className="login-container">
        <div className="login-card" style={{ maxWidth: 440, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--error)' }}>
            Authentication Error
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
            {error}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => (window.location.href = '/')}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: 360, textAlign: 'center', padding: '48px 32px' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderTopColor: 'var(--primary)', margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Signing you in…</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Connecting your Google account</p>
      </div>
    </div>
  );
}
