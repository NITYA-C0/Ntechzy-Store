import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { apiWithRetry } from '../utils/api';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: "men's clothing", label: "Men's clothing" },
  { value: 'jewelery', label: 'Jewelry' },
  { value: 'electronics', label: 'Electronics' },
  { value: "women's clothing", label: "Women's clothing" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams();
        if (category !== 'all') params.set('category', category);
        if (search.trim()) params.set('search', search.trim());
        const qs = params.toString();
        const data = await apiWithRetry(`/products${qs ? `?${qs}` : ''}`);
        if (!cancelled) setProducts(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Something went wrong');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, search ? 250 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, category]);

  return (
    <div className="page home-page">
      <section className="hero">
        <h1>Welcome to Ntechzy Store</h1>
        <p>Discover amazing products at unbeatable prices.</p>
      </section>

      <div className="search-filter">
        <div className="search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
        </div>

        <div className="filter-chips" role="tablist" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              role="tab"
              aria-selected={category === cat.value}
              className={`chip ${category === cat.value ? 'active' : ''}`}
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <p className="showing-count">
        {loading ? 'Loading products...' : `Showing ${products.length} products`}
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {products.length === 0 && !error && (
            <p className="empty-filter">No products match your search or filter.</p>
          )}
        </div>
      )}
    </div>
  );
}
