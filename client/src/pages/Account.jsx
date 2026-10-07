import { useState } from 'react';
import { api } from '../api.js';

export default function Account() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api('/auth/password', { method: 'POST', body: form });
      setForm({ currentPassword: '', newPassword: '' });
      setMsg({ type: 'ok', text: 'Password changed.' });
    } catch (err) { setMsg({ type: 'err', text: err.message }); }
  };

  return (
    <main className="p-4 max-w-md mx-auto">
      <form onSubmit={submit} className="bg-panel border border-line rounded-lg p-5 space-y-3">
        <h1 className="text-xl font-bold">Change password</h1>
        <input className="w-full" type="password" placeholder="Current password" required value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
        <input className="w-full" type="password" placeholder="New password (min 6 characters)" required minLength="6" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
        {msg.text && <p className={msg.type === 'ok' ? 'text-neon text-sm' : 'text-pink text-sm'}>{msg.text}</p>}
        <button className="btn btn-neon w-full">Save password</button>
      </form>
    </main>
  );
}
