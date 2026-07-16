import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Cart } from '../models/Cart.js';
import { authOptional, getOwnerQuery } from '../middleware/auth.js';

const router = Router();

async function findOrCreateCart(req) {
  const owner = getOwnerQuery(req);
  if (!owner) {
    const err = new Error('Missing guest id. Send x-guest-id header.');
    err.status = 400;
    throw err;
  }

  let cart = await Cart.findOne(owner);
  if (!cart) {
    cart = await Cart.create({ ...owner, items: [] });
  }
  return cart;
}

function serialize(cart) {
  return {
    items: cart.items.map((i) => ({
      id: i.productId,
      title: i.title,
      price: i.price,
      image: i.image,
      category: i.category,
      quantity: i.quantity,
    })),
  };
}

router.use(authOptional);

router.get('/', async (req, res) => {
  try {
    const owner = getOwnerQuery(req);
    if (!owner) return res.json({ items: [] });
    const cart = await Cart.findOne(owner);
    res.json(cart ? serialize(cart) : { items: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load cart.' });
  }
});

router.post(
  '/items',
  body('productId').isNumeric(),
  body('title').notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('image').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    try {
      const cart = await findOrCreateCart(req);
      const { productId, title, price, image, category = '' } = req.body;
      const id = Number(productId);
      const existing = cart.items.find((i) => i.productId === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.items.push({ productId: id, title, price, image, category, quantity: 1 });
      }
      await cart.save();
      res.json(serialize(cart));
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ error: err.message || 'Failed to add item.' });
    }
  }
);

router.put('/items/:productId', async (req, res) => {
  try {
    const cart = await findOrCreateCart(req);
    const productId = Number(req.params.productId);
    const quantity = Number(req.body.quantity);

    if (!Number.isFinite(quantity)) {
      return res.status(400).json({ error: 'Invalid quantity.' });
    }

    if (quantity < 1) {
      cart.items = cart.items.filter((i) => i.productId !== productId);
    } else {
      const item = cart.items.find((i) => i.productId === productId);
      if (!item) return res.status(404).json({ error: 'Item not found.' });
      item.quantity = quantity;
    }

    await cart.save();
    res.json(serialize(cart));
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Failed to update item.' });
  }
});

router.delete('/items/:productId', async (req, res) => {
  try {
    const cart = await findOrCreateCart(req);
    const productId = Number(req.params.productId);
    cart.items = cart.items.filter((i) => i.productId !== productId);
    await cart.save();
    res.json(serialize(cart));
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Failed to remove item.' });
  }
});

router.delete('/', async (req, res) => {
  try {
    const cart = await findOrCreateCart(req);
    cart.items = [];
    await cart.save();
    res.json(serialize(cart));
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Failed to clear cart.' });
  }
});

export default router;
