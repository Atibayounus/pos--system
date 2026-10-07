import { Router } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, adminOnly, wrap } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// Checkout: prices and totals are computed on the server, never trusted from the client
router.post('/', wrap(async (req, res) => {
  const { items = [], discount = 0, paymentMethod = 'cash' } = req.body;
  if (!items.length) return res.status(400).json({ message: 'Cart is empty' });

  const products = await Product.find({ _id: { $in: items.map((i) => i.product) } });
  const lines = items.map((i) => {
    const p = products.find((x) => String(x._id) === String(i.product));
    const qty = Math.floor(Number(i.qty));
    if (!p || !(qty > 0)) throw Object.assign(new Error('Invalid item in cart'), { status: 400 });
    return { product: p._id, name: p.name, price: p.price, qty };
  });

  // Reserve stock atomically; undo if any line is short
  const taken = [];
  try {
    for (const l of lines) {
      const r = await Product.updateOne({ _id: l.product, stock: { $gte: l.qty } }, { $inc: { stock: -l.qty } });
      if (!r.modifiedCount) throw Object.assign(new Error(`Not enough stock for ${l.name}`), { status: 409 });
      taken.push(l);
    }
  } catch (err) {
    await Promise.all(taken.map((l) => Product.updateOne({ _id: l.product }, { $inc: { stock: l.qty } })));
    throw err;
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const disc = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
  const tax = Math.round((subtotal - disc) * (Number(process.env.TAX_RATE) || 0) * 100) / 100;
  const order = await Order.create({
    receiptNo: 'R' + Date.now().toString(36).toUpperCase(),
    items: lines, subtotal, discount: disc, tax,
    total: subtotal - disc + tax,
    paymentMethod, cashier: req.user._id,
  });
  res.status(201).json(await order.populate('cashier', 'name'));
}));

router.get('/', adminOnly, wrap(async (req, res) => {
  res.json(await Order.find().sort({ createdAt: -1 }).limit(100).populate('cashier', 'name'));
}));

router.get('/summary', adminOnly, wrap(async (req, res) => {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const [row] = await Order.aggregate([
    { $match: { createdAt: { $gte: start } } },
    { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
  ]);
  res.json({ orders: row?.orders || 0, revenue: row?.revenue || 0 });
}));

export default router;
