import React, { useState } from 'react';

export default function LoginPage({ onLogin, onGoToSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      // Call Spring Boot login endpoint
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || 'Invalid credentials. Please try again.');
      }
      const data = await response.json();
      // Store token and user info
      localStorage.setItem('authToken', data.token || '');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', data.name || email.split('@')[0]);
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9ff',
        padding: '16px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <main
        style={{
          width: '100%',
          maxWidth: '1100px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0px 4px 40px -1px rgba(0,0,0,0.08), 0px 2px 10px -1px rgba(0,0,0,0.04)',
          minHeight: '680px',
        }}
      >
        {/* Left Side: AI Themed Visual */}
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '48px',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#f8f9ff',
            borderRight: '1px solid #E2E8F0',
          }}
        >
          {/* Decorative Blobs */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-10%',
                right: '-10%',
                width: '380px',
                height: '380px',
                background: 'rgba(99,102,241,0.08)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                animation: 'pulseGlow 4s ease-in-out infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-5%',
                left: '-5%',
                width: '280px',
                height: '280px',
                background: 'rgba(203,219,245,0.3)',
                borderRadius: '50%',
                filter: 'blur(60px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.03,
                backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
          </div>

          {/* Top: Brand */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: '#121212',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                }}
              >
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
                  analytics
                </span>
              </div>
              <div>
                <p style={{ fontSize: '20px', fontWeight: 700, color: '#0b1c30', margin: 0 }}>Debrief.io</p>
                <p style={{ fontSize: '12px', color: '#444748', margin: 0 }}>AI Meeting Intelligence</p>
              </div>
            </div>

            <div style={{ marginTop: '64px' }}>
              <h2
                style={{
                  fontSize: '32px',
                  fontWeight: 600,
                  color: '#0b1c30',
                  lineHeight: 1.25,
                  maxWidth: '340px',
                  letterSpacing: '-0.02em',
                  margin: '0 0 24px',
                }}
              >
                Transform every meeting into actionable intelligence.
              </h2>
              <p style={{ fontSize: '18px', color: '#444748', lineHeight: 1.6, maxWidth: '320px', margin: 0 }}>
                Experience the next generation of executive decision support with automated summaries and task tracking.
              </p>
            </div>
          </div>

          {/* Bottom: Social Proof */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(12px)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                maxWidth: '280px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ color: '#008542', fontSize: '18px' }}>
                  check_circle
                </span>
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0b1c30', margin: 0 }}>AI Processing Complete</p>
                <p style={{ fontSize: '12px', color: '#444748', margin: 0 }}>3 Action items extracted</p>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#747878', margin: 0 }}>
              © 2024 Debrief.io — The Intelligence Layer for Modern Teams.
            </p>
          </div>
        </section>

        {/* Right Side: Form */}
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '64px 80px',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ width: '100%', maxWidth: '380px' }}>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 600, color: '#0b1c30', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Welcome back
              </h2>
              <p style={{ fontSize: '16px', color: '#444748', margin: 0 }}>
                Log in to your meeting intelligence dashboard.
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: '#ffdad6',
                  border: '1px solid #ba1a1a',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '14px',
                  color: '#93000a',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#0b1c30', marginBottom: '8px' }}
                >
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    background: '#fff',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#121212')}
                  onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
                />
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label
                    htmlFor="login-password"
                    style={{ fontSize: '14px', fontWeight: 600, color: '#0b1c30' }}
                  >
                    Password
                  </label>
                  <a href="#" style={{ fontSize: '12px', color: '#444748', textDecoration: 'none' }}>
                    Forgot password?
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 48px 12px 16px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      background: '#fff',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#121212')}
                    onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#747878',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading ? '#555' : '#121212',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.2s, transform 0.1s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px',
                }}
                onMouseEnter={(e) => { if (!loading) e.target.style.background = '#2d2d2d'; }}
                onMouseLeave={(e) => { if (!loading) e.target.style.background = '#121212'; }}
              >
                {loading && (
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      display: 'inline-block',
                    }}
                  />
                )}
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#444748', marginTop: '24px' }}>
              Don&apos;t have an account?{' '}
              <button
                onClick={onGoToSignUp}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0b1c30',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline',
                  padding: 0,
                  fontFamily: 'inherit',
                }}
              >
                Sign up
              </button>
            </p>
          </div>
        </section>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
