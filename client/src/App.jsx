import { createContext, useContext, useEffect, useState } from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { api } from './api.js';
import Login from './pages/Login.jsx';
import POS from './pages/POS.jsx';
import Inventory from './pages/Inventory.jsx';
import Sales from './pages/Sales.jsx';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) return setReady(true);
    api('/auth/me').then(setUser).catch(() => localStorage.removeItem('token')).finally(() => setReady(true));
  }, []);

  const logout = () => { localStorage.removeItem('token'); setUser(null); };
  if (!ready) return null;
  if (!user) return <Login onLogin={setUser} />;

  const isAdmin = user.role === 'admin';
  const link = ({ isActive }) =>
    `px-3 py-1.5 rounded ${isActive ? 'text-neon border border-neon' : 'text-slate-400 hover:text-white border border-transparent'}`;

  return (
    <AuthCtx.Provider value={{ user, logout }}>
      <header className="flex items-center justify-between border-b border-line bg-panel px-5 py-3 print:hidden">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-neon">Neon POS</span>
          <nav className="flex gap-1">
            <NavLink to="/" end className={link}>Register</NavLink>
            {isAdmin && <NavLink to="/inventory" className={link}>Inventory</NavLink>}
            {isAdmin && <NavLink to="/sales" className={link}>Sales</NavLink>}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          {user.name} ({user.role})
          <button onClick={logout} className="btn !py-1">Sign out</button>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<POS />} />
        <Route path="/inventory" element={isAdmin ? <Inventory /> : <Navigate to="/" />} />
        <Route path="/sales" element={isAdmin ? <Sales /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthCtx.Provider>
  );
}
