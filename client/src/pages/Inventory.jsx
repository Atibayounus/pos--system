import { useEffect, useState } from 'react';
import { api, money } from '../api.js';

const empty = { name: '', sku: '', category: 'General', price: '', stock: '' };

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/products').then(setProducts).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault(); setError('');
    const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      await api(editing ? `/products/${editing}` : '/products', { method: editing ? 'PUT' : 'POST', body });
      setForm(empty); setEditing(null); load();
    } catch (err) { setError(err.message); }
  };

  const edit = (p) => {
    setEditing(p._id);
    setForm({ name: p.name, sku: p.sku || '', category: p.category, price: p.price, stock: p.stock });
  };

  const remove = async (p) => {
    if (!confirm(`Delete ${p.name}? This can't be undone.`)) return;
    await api(`/products/${p._id}`, { method: 'DELETE' }); load();
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <main className="p-4 max-w-5xl mx-auto space-y-4">
      <form onSubmit={save} className="bg-panel border border-line rounded-lg p-4 grid sm:grid-cols-5 gap-3 items-end">
        <Field label="Name"><input required value={form.name} onChange={set('name')} /></Field>
        <Field label="SKU"><input value={form.sku} onChange={set('sku')} /></Field>
        <Field label="Category"><input value={form.category} onChange={set('category')} /></Field>
        <Field label="Price"><input required type="number" min="0" step="0.01" value={form.price} onChange={set('price')} /></Field>
        <Field label="Stock"><input required type="number" min="0" value={form.stock} onChange={set('stock')} /></Field>
        <div className="sm:col-span-5 flex gap-2 items-center">
          <button className="btn btn-neon">{editing ? 'Save changes' : 'Add product'}</button>
          {editing && <button type="button" className="btn" onClick={() => { setEditing(null); setForm(empty); }}>Cancel</button>}
          {error && <span className="text-pink text-sm">{error}</span>}
        </div>
      </form>

      <div className="bg-panel border border-line rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-slate-400 border-b border-line">
            <tr><th className="p-3">Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th /></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-b border-line last:border-0">
                <td className="p-3">{p.name}</td><td>{p.sku}</td><td>{p.category}</td>
                <td>{money(p.price)}</td>
                <td className={p.stock <= 5 ? 'text-pink' : ''}>{p.stock}</td>
                <td className="text-right pr-3 space-x-2">
                  <button className="btn !py-1" onClick={() => edit(p)}>Edit</button>
                  <button className="btn !py-1 hover:!border-pink" onClick={() => remove(p)}>Delete</button>
                </td>
              </tr>
            ))}
            {!products.length && <tr><td className="p-4 text-slate-500" colSpan="6">No products yet. Add your first one above.</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1 text-sm text-slate-400">{label}{children}</label>
);
