import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    externalId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: '', index: true },
    image: { type: String, required: true },
    rating: {
      rate: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
