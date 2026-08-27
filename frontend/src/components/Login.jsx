import { useState } from 'react';
import * as api from '../api/client';

export default function Login({ onLogin, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    try {
      const token = await api.login(email, password);
      onLogin(token);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Log in</h2>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <input
        aria-label="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        aria-label="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Log in</button>
      <button type="button" onClick={onSwitch}>
        Need an account? Register
      </button>
    </form>
  );
}
