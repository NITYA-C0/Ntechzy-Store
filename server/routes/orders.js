import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${id.slice(0, 2)}-${id.slice(2)}`;
}

router.use(authRequired);

router.post(
  '/',
  body('shipping.fullName').notEmpty(),
  body('shipping.email').isEmail(),
  body('shipping.street').notEmpty(),
  body('shipping.city').notEmpty(),
  body('shipping.zip').notEmpty(),
  body('shipping.country').notEmpty(),
  body('payment.nameOnCard').notEmpty(),
  body('payment.cardNumber').isLength({ min: 16 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Please complete all shipping and payment fields.' });
    }

    try {
      const cart = await Cart.findOne({ userId: req.user.id });
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: 'Your cart is empty.' });
      }

      const amount = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const digits = String(req.body.payment.cardNumber).replace(/\D/g, '');
      const last4 = digits.slice(-4);

      const order = await Order.create({
        orderId: generateOrderId(),
        userId: req.user.id,
        email: req.body.shipping.email,
        amount,
        shipping: req.body.shipping,
        payment: {
          nameOnCard: req.body.payment.nameOnCard,
          last4,
        },
        items: cart.items.map((i) => ({
          productId: i.productId,
          title: i.title,
          price: i.price,
          image: i.image,
          category: i.category,
          quantity: i.quantity,
        })),
        status: 'placed',
      });

      cart.items = [];
      await cart.save();

      res.status(201).json({
        orderId: order.orderId,
        amount: order.amount,
        email: order.email,
        shipping: order.shipping,
        items: order.items.map((i) => ({
          id: i.productId,
          title: i.title,
          price: i.price,
          image: i.image,
          category: i.category,
          quantity: i.quantity,
        })),
        createdAt: order.createdAt,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to place order.' });
    }
  }
);

router.get('/latest', async (req, res) => {
  try {
    const order = await Order.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!order) return res.status(404).json({ error: 'No orders found.' });
    res.json({
      orderId: order.orderId,
      amount: order.amount,
      email: order.email,
      shipping: order.shipping,
      items: order.items.map((i) => ({
        id: i.productId,
        title: i.title,
        price: i.price,
        image: i.image,
        category: i.category,
        quantity: i.quantity,
      })),
      createdAt: order.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load order.' });
  }
});

export default router;
