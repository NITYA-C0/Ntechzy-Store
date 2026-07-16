import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, default: '' },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    shipping: {
      fullName: String,
      email: String,
      street: String,
      city: String,
      zip: String,
      country: String,
    },
    payment: {
      nameOnCard: String,
      last4: String,
      // Never store full card number — demo only
    },
    items: { type: [orderItemSchema], default: [] },
    status: { type: String, default: 'placed' },
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
