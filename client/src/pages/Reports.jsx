import { useEffect, useState } from 'react';
import { api, money } from '../api.js';

export default function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api('/orders/report').then(setData).catch((e) => setError(e.message)); }, []);

  if (error) return <p className="p-4 text-pink">{error}</p>;
  if (!data) return <p className="p-4 text-slate-500">Loading report…</p>;

  const max = Math.max(...data.days.map((d) => d.revenue), 1);
  const week = data.days.reduce((s, d) => s + d.revenue, 0);
  const orders = data.days.reduce((s, d) => s + d.orders, 0);

  return (
    <main className="p-4 max-w-5xl mx-auto space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card label="Revenue, last 7 days" value={money(week)} neon />
        <Card label="Orders, last 7 days" value={orders} />
      </div>

      <section className="bg-panel border border-line rounded-lg p-4">
        <h2 className="font-semibold mb-4">Daily revenue</h2>
        <div className="flex items-end gap-2 h-52">
          {data.days.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full gap-1" title={`${d.orders} orders`}>
              <span className="text-xs text-slate-400">{d.revenue ? money(d.revenue) : ''}</span>
              <div className="w-full bg-neon rounded-t" style={{ height: `${(d.revenue / max) * 80}%`, minHeight: d.revenue ? 4 : 1, opacity: d.revenue ? 1 : 0.2 }} />
              <span className="text-xs text-slate-500">{d.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-panel border border-line rounded-lg p-4">
          <h2 className="font-semibold mb-3">Top products</h2>
          {!data.top.length && <p className="text-slate-500">No sales in the last 7 days.</p>}
          {data.top.map((t) => (
            <div key={t._id} className="flex justify-between py-1.5 border-b border-line last:border-0">
              <span>{t._id}</span><span className="text-slate-400">{t.qty} sold · {money(t.revenue)}</span>
            </div>
          ))}
        </section>
        <section className="bg-panel border border-line rounded-lg p-4">
          <h2 className="font-semibold mb-3">Payment methods</h2>
          {!data.payments.length && <p className="text-slate-500">No sales in the last 7 days.</p>}
          {data.payments.map((p) => (
            <div key={p._id} className="flex justify-between py-1.5 border-b border-line last:border-0">
              <span className="capitalize">{p._id}</span><span className="text-slate-400">{p.orders} orders · {money(p.total)}</span>
            </div>
          ))}
        </section>
      </div>
      <p className="text-xs text-slate-500">Refunded orders are not counted.</p>
    </main>
  );
}

const Card = ({ label, value, neon }) => (
  <div className="bg-panel border border-line rounded-lg p-4">
    <div className="text-slate-400 text-sm">{label}</div>
    <div className={`text-3xl font-bold ${neon ? 'text-neon' : ''}`}>{value}</div>
  </div>
);
