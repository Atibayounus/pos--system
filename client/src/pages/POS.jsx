import { useEffect, useMemo, useState } from 'react';
import { api, money } from '../api.js';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [taxRate, setTaxRate] = useState(0);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState([]); // [{ product, qty }]
  const [discount, setDiscount] = useState('');
  const [payment, setPayment] = useState('cash');
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api('/products').then(setProducts).catch((e) => setError(e.message));
  useEffect(() => { load(); api('/config').then((c) => setTaxRate(c.taxRate)); }, []);

  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category))], [products]);
  const shown = products.filter(
    (p) => (category === 'All' || p.category === category) &&
      (p.name.toLowerCase().includes(q.toLowerCase()) || p.sku === q)
  );

  const qtyInCart = (id) => cart.find((c) => c.product._id === id)?.qty || 0;

  const add = (product) => {
    if (qtyInCart(product._id) >= product.stock) return;
    setError('');
    setCart((c) => c.some((l) => l.product._id === product._id)
      ? c.map((l) => (l.product._id === product._id ? { ...l, qty: l.qty + 1 } : l))
      : [...c, { product, qty: 1 }]);
  };

  const change = (id, delta) =>
    setCart((c) => c
      .map((l) => (l.product._id === id ? { ...l, qty: Math.min(l.qty + delta, l.product.stock) } : l))
      .filter((l) => l.qty > 0));

  const subtotal = cart.reduce((s, l) => s + l.product.price * l.qty, 0);
  const disc = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
  const tax = Math.round((subtotal - disc) * taxRate * 100) / 100;
  const total = subtotal - disc + tax;

  const checkout = async () => {
    setBusy(true); setError('');
    try {
      const order = await api('/orders', {
        method: 'POST',
        body: { items: cart.map((l) => ({ product: l.product._id, qty: l.qty })), discount: disc, paymentMethod: payment },
      });
      setReceipt(order); setCart([]); setDiscount('');
      load();
    } catch (e) { setError(e.message); load(); }
    setBusy(false);
  };

  return (
    <main className="grid lg:grid-cols-[1fr_380px] gap-4 p-4 h-[calc(100vh-57px)] print:block">
      <section className="flex flex-col min-h-0 print:hidden">
        <div className="flex gap-2 mb-3">
          <input className="flex-1" placeholder="Search by name or exact SKU" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-2 mb-3 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full border text-sm ${category === c ? 'border-neon text-neon' : 'border-line text-slate-400'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto pr-1">
          {shown.map((p) => {
            const out = p.stock - qtyInCart(p._id) <= 0;
            return (
              <button key={p._id} onClick={() => add(p)} disabled={out}
                className="text-left bg-panel border border-line rounded p-3 hover:border-neon disabled:opacity-40 disabled:hover:border-line transition-colors">
                <div className="font-semibold">{p.name}</div>
                <div className="text-neon mt-1">{money(p.price)}</div>
                <div className={`text-xs mt-2 ${p.stock <= 5 ? 'text-pink' : 'text-slate-500'}`}>
                  {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                </div>
              </button>
            );
          })}
          {!shown.length && <p className="text-slate-500 col-span-full">No products match. Add some in Inventory.</p>}
        </div>
      </section>

      <aside className="flex flex-col bg-panel border border-line rounded-lg min-h-0 print:hidden">
        <h2 className="px-4 py-3 border-b border-line font-semibold">Current sale</h2>
        <div className="flex-1 overflow-y-auto divide-y divide-line">
          {!cart.length && <p className="p-4 text-slate-500">Tap a product to add it to the sale.</p>}
          {cart.map((l) => (
            <div key={l.product._id} className="flex items-center gap-2 px-4 py-2">
              <div className="flex-1">
                <div>{l.product.name}</div>
                <div className="text-xs text-slate-500">{money(l.product.price)} each</div>
              </div>
              <button className="btn !px-2 !py-0" onClick={() => change(l.product._id, -1)} aria-label={`Remove one ${l.product.name}`}>−</button>
              <span className="w-6 text-center">{l.qty}</span>
              <button className="btn !px-2 !py-0" onClick={() => change(l.product._id, 1)} aria-label={`Add one ${l.product.name}`}>+</button>
              <span className="w-20 text-right">{money(l.product.price * l.qty)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-line p-4 space-y-2 text-sm">
          <Row label="Subtotal" value={money(subtotal)} />
          <div className="flex items-center justify-between">
            <label htmlFor="disc">Discount</label>
            <input id="disc" type="number" min="0" className="w-28 text-right !py-1" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" />
          </div>
          {taxRate > 0 && <Row label={`Tax (${(taxRate * 100).toFixed(0)}%)`} value={money(tax)} />}
          <div className="flex justify-between text-xl font-bold pt-2 border-t border-line">
            <span>Total</span><span className="text-neon">{money(total)}</span>
          </div>
          <div className="flex gap-2 pt-2">
            {['cash', 'card', 'wallet'].map((m) => (
              <button key={m} onClick={() => setPayment(m)}
                className={`flex-1 rounded border py-1.5 capitalize ${payment === m ? 'border-neon text-neon' : 'border-line text-slate-400'}`}>{m}</button>
            ))}
          </div>
          {error && <p className="text-pink">{error}</p>}
          <button className="btn btn-neon w-full !py-3 text-base" disabled={!cart.length || busy} onClick={checkout}>
            {busy ? 'Processing…' : `Charge ${money(total)}`}
          </button>
          {!!cart.length && <button className="btn w-full" onClick={() => setCart([])}>Clear sale</button>}
        </div>
      </aside>

      {receipt && <Receipt order={receipt} onClose={() => setReceipt(null)} />}
    </main>
  );
}

const Row = ({ label, value }) => (
  <div className="flex justify-between text-slate-400"><span>{label}</span><span>{value}</span></div>
);

export function Receipt({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 grid place-items-center p-4 z-10 print:static print:block print:bg-transparent">
      <div className="bg-panel border border-neon rounded-lg w-full max-w-sm print:border-0 print:max-w-none">
        <div id="receipt" className="p-5 text-sm space-y-2">
          <h2 className="text-center text-lg font-bold">Receipt {order.receiptNo}</h2>
          <p className="text-center text-xs opacity-70">
            {new Date(order.createdAt).toLocaleString()} · Cashier: {order.cashier?.name}
          </p>
          <hr className="border-line" />
          {order.items.map((i, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{i.qty} × {i.name}</span><span>{money(i.price * i.qty)}</span>
            </div>
          ))}
          <hr className="border-line" />
          <div className="flex justify-between"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between"><span>Discount</span><span>−{money(order.discount)}</span></div>}
          {order.tax > 0 && <div className="flex justify-between"><span>Tax</span><span>{money(order.tax)}</span></div>}
          <div className="flex justify-between font-bold text-base"><span>Total ({order.paymentMethod})</span><span>{money(order.total)}</span></div>
          <p className="text-center pt-2">Thank you!</p>
        </div>
        <div className="flex gap-2 p-4 border-t border-line print:hidden">
          <button className="btn flex-1" onClick={() => window.print()}>Print</button>
          <button className="btn btn-neon flex-1" onClick={onClose}>New sale</button>
        </div>
      </div>
    </div>
  );
}
