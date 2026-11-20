import mongoose, { Schema, model } from 'mongoose';
import { IWorkshopBooking } from '../../types/workshopTypes';

const bookingItemSchema = new Schema(
  {
    optionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    optionTitle: { type: String, required: true },
    price: { type: Number, required: true },
    people: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false },
);

const workshopBookingSchema = new Schema<IWorkshopBooking>(
  {
    workshopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'workshop',
      required: true,
    },

    bookingDate: { type: String, required: true },

    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    items: [bookingItemSchema],

    totalPeople: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    bookingNumber: { type: String, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    currency: { type: String, default: 'AED' },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    customer: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      companyName: { type: String },
      notes: { type: String },
      country: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
    },

    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    isDeleted: { type: Boolean, default: false },
    giftFor: { type: String },
    occasion: { type: String },
    personalMessage: { type: String },
  },
  { timestamps: true },
);

workshopBookingSchema.index({ workshopId: 1, bookingDate: 1, slotId: 1 });
workshopBookingSchema.index({ userId: 1 });
const workshopBookingModel = model<IWorkshopBooking>('workshopBookings', workshopBookingSchema);

export default workshopBookingModel;
