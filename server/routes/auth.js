import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect, adminOnly, wrap } from '../middleware/auth.js';

const router = Router();
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role });

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password || '', user.password)))
    return res.status(401).json({ message: 'Wrong email or password' });
  res.json({ token: sign(user), user: publicUser(user) });
}));

router.get('/me', protect, (req, res) => res.json(publicUser(req.user)));

// Admin creates cashier (or admin) accounts
router.post('/register', protect, adminOnly, wrap(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already in use' });
  const user = await User.create({ name, email, role, password: await bcrypt.hash(password, 10) });
  res.status(201).json(publicUser(user));
}));

export default router;
