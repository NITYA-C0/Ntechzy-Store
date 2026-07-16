import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Router } from 'express';
import { Product } from '../models/Product.js';

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

function loadSeedProducts() {
  const raw = readFileSync(join(__dirname, '../data/products.json'), 'utf8');
  return JSON.parse(raw);
}

async function seedProductsIfEmpty() {
  const count = await Product.countDocuments();
  if (count > 0) return;

  const data = loadSeedProducts();
  const docs = data.map((p) => ({
    externalId: p.id,
    title: p.title,
    price: p.price,
    description: p.description,
    category: p.category,
    image: p.image,
    rating: p.rating || { rate: 0, count: 0 },
  }));

  await Product.insertMany(docs);
}

router.get('/', async (req, res) => {
  try {
    await seedProductsIfEmpty();

    const { search = '', category = 'all' } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search.trim()) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter).sort({ externalId: 1 }).lean();
    res.json(
      products.map((p) => ({
        id: p.externalId,
        title: p.title,
        price: p.price,
        description: p.description,
        category: p.category,
        image: p.image,
        rating: p.rating,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load products.' });
  }
});

router.get('/categories', async (_req, res) => {
  try {
    await seedProductsIfEmpty();
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load categories.' });
  }
});

export default router;
