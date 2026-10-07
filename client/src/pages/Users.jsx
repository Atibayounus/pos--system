import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../App.jsx';

const empty = { name: '', email: '', password: '', role: 'cashier' };

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const load = () => api('/auth/users').then(setUsers).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault(); setError('');
    try { await api('/auth/register', { method: 'POST', body: form }); setForm(empty); load(); }
    catch (err) { setError(err.message); }
  };

  const update = async (u, body) => {
    setError('');
    try { await api(`/auth/users/${u._id}`, { method: 'PUT', body }); load(); }
    catch (err) { setError(err.message); }
  };

  const resetPassword = (u) => {
    const password = prompt(`New password for ${u.name} (min 6 characters):`);
    if (password) update(u, { password });
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <main className="p-4 max-w-5xl mx-auto space-y-4">
      <form onSubmit={create} className="bg-panel border border-line rounded-lg p-4 grid sm:grid-cols-5 gap-3 items-end">
        <F label="Name"><input required value={form.name} onChange={set('name')} /></F>
        <F label="Email"><input required type="email" value={form.email} onChange={set('email')} /></F>
        <F label="Password"><input required type="password" minLength="6" value={form.password} onChange={set('password')} /></F>
        <F label="Role">
          <select value={form.role} onChange={set('role')}><option value="cashier">Cashier</option><option value="admin">Admin</option></select>
        </F>
        <button className="btn btn-neon">Add user</button>
        {error && <p className="sm:col-span-5 text-pink text-sm">{error}</p>}
      </form>

      <div className="bg-panel border border-line rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-slate-400 border-b border-line">
            <tr><th className="p-3">Name</th><th>Email</th><th>Role</th><th>Status</th><th /></tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const self = u._id === me._id;
              return (
                <tr key={u._id} className="border-b border-line last:border-0">
                  <td className="p-3">{u.name}{self && <span className="text-slate-500"> (you)</span>}</td>
                  <td>{u.email}</td>
                  <td>
                    <select className="!py-1" value={u.role} disabled={self} onChange={(e) => update(u, { role: e.target.value })}>
                      <option value="cashier">Cashier</option><option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className={u.active ? 'text-neon' : 'text-pink'}>{u.active ? 'Active' : 'Disabled'}</td>
                  <td className="text-right pr-3 space-x-2">
                    <button className="btn !py-1" onClick={() => resetPassword(u)}>Reset password</button>
                    <button className="btn !py-1" disabled={self} onClick={() => update(u, { active: !u.active })}>{u.active ? 'Disable' : 'Enable'}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const F = ({ label, children }) => (
  <label className="flex flex-col gap-1 text-sm text-slate-400">{label}{children}</label>
);
