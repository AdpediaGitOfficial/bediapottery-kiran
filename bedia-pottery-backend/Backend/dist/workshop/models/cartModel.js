"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const cartItemSchema = new mongoose_1.Schema({
    workshopId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'workshop',
        required: true,
    },
    bookingDate: { type: String, required: false },
    slotId: { type: mongoose_1.Schema.Types.ObjectId, required: false },
    optionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    bookingType: {
        type: String,
        enum: ['normal', 'gift', 'pottery', 'events'],
        default: 'normal',
    },
    // 'family' means this line was quoted with party pricing, so checkout
    // prices it the same way (see utils/workshopOptionPricing.ts).
    workshopType: { type: String },
    giftDetails: {
        recipientName: { type: String },
        giftEmail: { type: String },
        giftPhone: { type: String },
        giftFor: { type: String },
        occasion: { type: String },
        personalMessage: { type: String },
    },
    people: { type: Number, required: true, min: 1 },
    adult: { type: Number },
    child: { type: Number },
    makingType: { type: String },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    currency: { type: String, default: 'AED' },
    handBuild: { type: Number },
    wheelPottery: { type: Number },
}, { _id: false });
const cartSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    items: [cartItemSchema],
    totalPeople: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
}, { timestamps: true });
cartSchema.index({ userId: 1 }, { unique: true });
exports.default = (0, mongoose_1.model)('cart', cartSchema);
