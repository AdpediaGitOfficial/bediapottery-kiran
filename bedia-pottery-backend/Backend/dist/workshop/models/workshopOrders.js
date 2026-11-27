"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const orderItemSchema = new mongoose_1.Schema({
    bookingId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'workshopBookings',
        required: true,
    },
    workshopId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'workshop',
        required: true,
    },
    bookingDate: String,
    slotId: mongoose_1.default.Schema.Types.ObjectId,
    // Slot times copied from the workshop's defaultSlots when payment succeeds.
    startTime: String,
    endTime: String,
    totalAmount: { type: Number, required: true },
}, { _id: false });
const orderSchema = new mongoose_1.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'users',
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    currency: { type: String, default: 'AED' },
    paymentId: String,
    paymentMethod: String,
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    invoiceNumber: String,
    // Sent by the checkout page and reused on every retry of the same cart, so a
    // double click or a Back-and-retry gets the same order instead of a new one.
    // Unique (but only where set), so two requests racing with the same key cannot
    // both create an order.
    checkoutKey: { type: String, unique: true, sparse: true },
    stripeSessionId: String,
    stripeSessionUrl: String,
    holdExpiresAt: Date,
    // The payment check asks Stripe about orders still pending: when it last did, and
    // the session status it found ('expired' means no payment can ever arrive, so the
    // order is not asked about again).
    paymentCheckedAt: Date,
    stripeSessionStatus: String,
    paymentGatewayResponse: mongoose_1.Schema.Types.Mixed,
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('orders', orderSchema);
