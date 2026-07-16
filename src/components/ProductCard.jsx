import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { capitalizeWords, formatPrice, getStars, truncate } from '../utils/helpers';

export default function ProductCard({ product }) {
  const { addToCart, isInCart } = useCart();
  const [busy, setBusy] = useState(false);
  const inCart = isInCart(product.id);
  const rating = product.rating?.rate ?? 4;
  const count = product.rating?.count ?? 0;

  const handleAdd = async () => {
    if (inCart || busy) return;
    setBusy(true);
    try {
      await addToCart(product);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to add to cart');
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="product-card">
      <div className="product-card-image">
        <img src={product.image} alt={product.title} loading="lazy" />
      </div>
      <div className="product-card-body">
        <span className="category-badge">{capitalizeWords(product.category)}</span>
        <h3 className="product-title" title={product.title}>
          {truncate(product.title, 55)}
        </h3>
        <p className="product-desc">{truncate(product.description, 90)}</p>
        <div className="product-rating" aria-label={`Rating ${rating} out of 5`}>
          <span className="stars">{getStars(rating)}</span>
          <span className="rating-count">({count})</span>
        </div>
        <div className="product-footer">
          <span className="product-price">{formatPrice(product.price)}</span>
          <button
            type="button"
            className={`btn btn-sm ${inCart ? 'btn-success' : 'btn-primary'}`}
            onClick={handleAdd}
            disabled={inCart || busy}
          >
            {inCart ? '✓ Added' : busy ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}
