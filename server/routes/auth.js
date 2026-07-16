import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { Cart } from '../models/Cart.js';
import { authRequired, signToken } from '../middleware/auth.js';

const router = Router();

function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  return null;
}

router.post(
  '/register',
  body('name').trim().notEmpty().withMessage('Full name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  async (req, res) => {
    if (validate(req, res)) return;
    try {
      const { name, email, password } = req.body;
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      const user = await User.create({ name, email, password });
      const guestId = req.headers['x-guest-id'];

      if (guestId) {
        const guestCart = await Cart.findOne({ guestId: String(guestId) });
        if (guestCart?.items?.length) {
          let userCart = await Cart.findOne({ userId: user._id });
          if (!userCart) {
            userCart = await Cart.create({ userId: user._id, items: guestCart.items });
          } else {
            userCart.items = mergeItems(userCart.items, guestCart.items);
            await userCart.save();
          }
          await Cart.deleteOne({ _id: guestCart._id });
        }
      }

      const token = signToken(user);
      res.status(201).json({ token, user: user.toSafeJSON() });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Registration failed.' });
    }
  }
);

router.post(
  '/login',
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
  async (req, res) => {
    if (validate(req, res)) return;
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const guestId = req.headers['x-guest-id'];
      if (guestId) {
        const guestCart = await Cart.findOne({ guestId: String(guestId) });
        if (guestCart?.items?.length) {
          let userCart = await Cart.findOne({ userId: user._id });
          if (!userCart) {
            await Cart.create({ userId: user._id, items: guestCart.items });
          } else {
            userCart.items = mergeItems(userCart.items, guestCart.items);
            await userCart.save();
          }
          await Cart.deleteOne({ _id: guestCart._id });
        }
      }

      const token = signToken(user);
      res.json({ token, user: user.toSafeJSON() });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Login failed.' });
    }
  }
);

router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load profile.' });
  }
});

function mergeItems(existing, incoming) {
  const map = new Map();
  for (const item of existing) {
    map.set(item.productId, { ...item.toObject?.() ?? item });
  }
  for (const item of incoming) {
    const raw = item.toObject?.() ?? item;
    const prev = map.get(raw.productId);
    if (prev) {
      map.set(raw.productId, { ...prev, quantity: prev.quantity + raw.quantity });
    } else {
      map.set(raw.productId, { ...raw });
    }
  }
  return Array.from(map.values());
}

export default router;
