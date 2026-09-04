import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Spotify Official Desktop / Web Login Page
 */
export default function LoginPage() {
  const { login } = useAuth();

  const handleGoogleLogin = () => {
    const callbackUrl = window.location.origin + '/auth/callback';
    document.cookie = `frontend_redirect_uri=${encodeURIComponent(callbackUrl)}; path=/; max-age=300; SameSite=Lax`;
    const backendOAuthUrl = 'http://localhost:8081/oauth2/authorization/google';
    window.location.href = backendOAuthUrl;
  };

  const handleGuestLogin = () => {
    // Generate an instant session token for local listening
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: 'bharath@pattakelu.com',
      name: 'bharath',
      role: 'USER',
      exp: Math.floor(Date.now() / 1000) + 86400 * 30,
    }));
    const signature = 'local_dev_signature';
    login(`${header}.${payload}.${signature}`);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#000000',
      padding: 24,
    }}>
      <div style={{
        background: '#121212',
        borderRadius: 16,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 440,
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7)',
      }}>
        {/* Patta Kelu Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <img
            src="/logo.png"
            alt="Patta Kelu"
            style={{ width: 68, height: 68, borderRadius: 16, objectFit: 'contain' }}
          />
        </div>

        <h1 style={{
          fontSize: 28,
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '-0.8px',
          marginBottom: 8,
        }}>
          Log in to Patta Kelu
        </h1>
        <p style={{
          fontSize: 14,
          color: '#9499a1',
          marginBottom: 32,
        }}>
          Listen without limits on phone, speaker, and web.
        </p>

        {/* Google OAuth Login Button */}
        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            height: 48,
            borderRadius: 9999,
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            cursor: 'pointer',
            marginBottom: 14,
            transition: 'border-color 0.15s, background-color 0.15s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#ffffff';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* 1-Click Instant Guest Login */}
        <button
          onClick={handleGuestLogin}
          style={{
            width: '100%',
            height: 48,
            borderRadius: 9999,
            background: '#1ED760',
            border: 'none',
            color: '#000000',
            fontSize: 14,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(30, 215, 96, 0.4)',
            transition: 'transform 0.15s, background-color 0.15s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#1fdf64';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#1ED760';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span>🎧 Listen Now as User</span>
        </button>

        <div style={{
          marginTop: 28,
          paddingTop: 24,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: 12,
          color: '#646a73',
        }}>
          Patta Kelu Desktop Hi-Fi Edition
        </div>
      </div>
    </div>
  );
}
