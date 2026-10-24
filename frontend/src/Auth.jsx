
import React, { useState } from 'react';

const API = 'https://pathway-backend-t8al.onrender.com/api/auth';

export default function Auth({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isSignup ? '/register' : '/login';

      const body = isSignup
        ? { fullName, email, password }
        : { email, password };

      const response = await fetch(API + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.detail ||
          'Unable to continue. Please check your details.'
        );
      }

      if (!data.token) {
        throw new Error('Login response did not include an access token.');
      }

      onLogin(data);
    } catch (err) {
      setError(
        err.message ||
        'Unable to connect. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">✦</span>
          <span>pathway</span>
        </div>

        <p className="auth-eyebrow">YOUR NEXT CHAPTER</p>

        <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>

        <p className="auth-subtitle">
          {isSignup
            ? 'Start organizing your job search in one place.'
            : 'Sign in to continue your career journey.'}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={!isSignup ? 'active' : ''}
            onClick={() => {
              setIsSignup(false);
              setError('');
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={isSignup ? 'active' : ''}
            onClick={() => {
              setIsSignup(true);
              setError('');
            }}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <label>
              Full name
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete={
                isSignup ? 'new-password' : 'current-password'
              }
              minLength={isSignup ? 8 : undefined}
              required
            />
          </label>

          {error && (
            <p className="auth-error" role="alert">{error}</p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isSignup
                ? 'Create account →'
                : 'Sign in →'}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? 'Already have an account?' : 'New to Pathway?'}
          {' '}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
          >
            {isSignup ? 'Login' : 'Create an account'}
          </button>
        </p>

        <p className="auth-footer">
          Your career journey, thoughtfully organized.
        </p>
      </section>
    </main>
  );
}
