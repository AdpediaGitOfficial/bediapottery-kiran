import { Schema, model } from 'mongoose';
import { ICartModel } from '../../types/cartTypes';

const cartItemSchema = new Schema(
  {
    workshopId: {
      type: Schema.Types.ObjectId,
      ref: 'workshop',
      required: true,
    },

    bookingDate: { type: String, required: true },
    slotId: { type: Schema.Types.ObjectId, required: true },

    optionId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    people: { type: Number, required: true, min: 1 },

    price: { type: Number, required: true },
    subtotal: { type: Number, required: true },

    currency: { type: String, default: 'AED' },
  },
  { _id: false },
);

const cartSchema = new Schema<ICartModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },

    items: [cartItemSchema],

    totalPeople: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
  },
  { timestamps: true },
);

cartSchema.index({ userId: 1 }, { unique: true });

export default model('cart', cartSchema);
