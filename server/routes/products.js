import { Router } from 'express';
import Product from '../models/Product.js';
import { protect, adminOnly, wrap } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', wrap(async (req, res) => {
  const { q, category } = req.query;
  const filter = {};
  if (q) filter.$or = [{ name: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }, { sku: q }];
  if (category) filter.category = category;
  res.json(await Product.find(filter).sort({ name: 1 }));
}));

router.post('/', adminOnly, wrap(async (req, res) => {
  const { sku, ...rest } = req.body;
  res.status(201).json(await Product.create({ ...rest, ...(sku ? { sku } : {}) }));
}));

router.put('/:id', adminOnly, wrap(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
}));

router.delete('/:id', adminOnly, wrap(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

export default router;
