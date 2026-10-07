import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    receiptNo: { type: String, unique: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        qty: Number,
      },
    ],
    subtotal: Number,
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: Number,
    paymentMethod: { type: String, enum: ['cash', 'card', 'wallet'], default: 'cash' },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
