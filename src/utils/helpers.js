export function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

export function truncate(text, max = 60) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export function capitalizeWords(str) {
  if (!str) return '';
  if (str.toLowerCase() === 'jewelery' || str.toLowerCase() === 'jewelry') {
    return 'Jewelry';
  }
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${id.slice(0, 2)}-${id.slice(2)}`;
}

export function getStars(rate = 0) {
  const full = Math.round(rate);
  return '★'.repeat(Math.min(full, 5)) + '☆'.repeat(Math.max(0, 5 - full));
}
