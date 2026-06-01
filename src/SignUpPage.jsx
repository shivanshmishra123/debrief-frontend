import React, { useState } from 'react';

export default function SignUpPage({ onSignUp, onGoToLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      // Call Spring Boot register endpoint
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, password }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || 'Registration failed. Please try again.');
      }
      const data = await response.json();
      localStorage.setItem('authToken', data.token || '');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', fullName);
      onSignUp(data, fullName);
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
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden',
      }}
    >
      <main style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        {/* Left Side: Dark Visual */}
        <section
          style={{
            display: 'flex',
            flex: '0 0 50%',
            position: 'relative',
            backgroundColor: '#121212',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px',
            overflow: 'hidden',
          }}
        >
          {/* Animated Background */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none' }}>
            <div
              style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                top: '-25%',
                left: '-25%',
                background: 'rgba(0,133,66,0.3)',
                borderRadius: '50%',
                filter: 'blur(120px)',
                animation: 'signupPulse 4s ease-in-out infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: '500px',
                height: '500px',
                bottom: '-25%',
                right: '-25%',
                background: 'rgba(99,102,241,0.2)',
                borderRadius: '50%',
                filter: 'blur(100px)',
                animation: 'signupPulse 4s ease-in-out infinite',
                animationDelay: '-2s',
              }}
            />
          </div>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
            <div style={{ marginBottom: '48px' }}>
              <h1
                style={{
                  fontSize: '48px',
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  margin: '0 0 24px',
                }}
              >
                Unlock the hidden intelligence in every conversation.
              </h1>
              <p
                style={{
                  fontSize: '18px',
                  color: 'rgba(255,255,255,0.65)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Transform your meetings into actionable assets. Automated summaries, sentiment analysis, and searchable insights powered by world-class AI.
              </p>
            </div>

            {/* Feature card */}
            <div
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#008542',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ color: '#fff', fontVariationSettings: "'FILL' 1" }}>
                  psychology
                </span>
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>Precision Analysis Active</p>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>Processing meeting transcripts in real-time...</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Form */}
        <section
          style={{
            flex: '0 0 50%',
            backgroundColor: '#f8f9ff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 80px',
            overflowY: 'auto',
          }}
        >
          <div style={{ width: '100%', maxWidth: '400px' }}>
            {/* Brand Header */}
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    background: '#121212',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
                    bolt
                  </span>
                </div>
                <span style={{ fontSize: '24px', fontWeight: 700, color: '#121212', letterSpacing: '-0.02em' }}>Debrief.io</span>
              </div>
              <p style={{ fontSize: '12px', color: '#444748', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                AI Meeting Intelligence
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 600, color: '#0b1c30', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Create your account
              </h2>
              <p style={{ fontSize: '16px', color: '#444748', margin: 0 }}>
                Precision Intelligence for high-output teams.
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
              {/* Full Name */}
              <div>
                <label htmlFor="signup-name" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#0b1c30', marginBottom: '8px' }}>
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Rivera"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#121212')}
                  onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="signup-email" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#0b1c30', marginBottom: '8px' }}>
                  Work Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#121212')}
                  onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="signup-password" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#0b1c30', marginBottom: '8px' }}>
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#121212')}
                  onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
                />
                <p style={{ fontSize: '12px', color: '#747878', marginTop: '6px', marginBottom: 0 }}>Minimum 6 characters</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: loading ? '#555' : '#121212',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.2s',
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Footer Link */}
            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#444748', margin: 0 }}>
                Already have an account?{' '}
                <button
                  onClick={onGoToLogin}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0b1c30',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '14px',
                    textDecoration: 'underline',
                    padding: 0,
                    fontFamily: 'inherit',
                  }}
                >
                  Log in
                </button>
              </p>
            </div>

            {/* Legal */}
            <p style={{ fontSize: '12px', color: 'rgba(68,71,72,0.5)', textAlign: 'center', marginTop: '40px', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' }}>
              By creating an account, you agree to our{' '}
              <a href="#" style={{ textDecoration: 'underline', color: 'inherit' }}>Terms of Service</a>{' '}
              and{' '}
              <a href="#" style={{ textDecoration: 'underline', color: 'inherit' }}>Privacy Policy</a>.
            </p>
          </div>
        </section>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
        @keyframes signupPulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  fontSize: '16px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  background: '#ffffff',
  transition: 'border-color 0.2s',
};
