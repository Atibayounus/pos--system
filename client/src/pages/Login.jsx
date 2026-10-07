import { useState } from 'react';
import { api } from '../api.js';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { token, user } = await api('/auth/login', { method: 'POST', body: form });
      localStorage.setItem('token', token);
      onLogin(user);
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 bg-panel border border-line rounded-lg p-6 shadow-[0_0_40px_#00f0ff14]">
        <h1 className="text-2xl font-bold text-neon">Sign in to Neon POS</h1>
        <input className="w-full" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="w-full" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error && <p className="text-pink text-sm">{error}</p>}
        <button className="btn btn-neon w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
