import { useEffect, useState } from 'react';
import { api, money } from '../api.js';
import { Receipt } from './POS.jsx';

export default function Sales() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({ orders: 0, revenue: 0 });
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api('/orders').then(setOrders);
    api('/orders/summary').then(setSummary);
  }, []);

  return (
    <main className="p-4 max-w-5xl mx-auto space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-panel border border-line rounded-lg p-4">
          <div className="text-slate-400 text-sm">Orders today</div>
          <div className="text-3xl font-bold">{summary.orders}</div>
        </div>
        <div className="bg-panel border border-line rounded-lg p-4">
          <div className="text-slate-400 text-sm">Revenue today</div>
          <div className="text-3xl font-bold text-neon">{money(summary.revenue)}</div>
        </div>
      </div>

      <div className="bg-panel border border-line rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-slate-400 border-b border-line">
            <tr><th className="p-3">Receipt</th><th>Date</th><th>Cashier</th><th>Payment</th><th>Total</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} onClick={() => setOpen(o)} className="border-b border-line last:border-0 cursor-pointer hover:bg-ink/60">
                <td className="p-3 text-neon">{o.receiptNo}</td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
                <td>{o.cashier?.name}</td>
                <td className="capitalize">{o.paymentMethod}</td>
                <td>{money(o.total)}</td>
              </tr>
            ))}
            {!orders.length && <tr><td className="p-4 text-slate-500" colSpan="5">No sales yet. Completed sales show up here.</td></tr>}
          </tbody>
        </table>
      </div>
      {open && <Receipt order={open} onClose={() => setOpen(null)} />}
    </main>
  );
}
