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
/**
 * How an item's subtotal was reached. A per-head option has a single line; a
 * package option has its base price plus one line per extra-adult/extra-child
 * add-on, which is what the confirmation mail and the studio need to show.
 */
const priceBreakdownSchema = new mongoose_1.Schema({
    label: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true },
}, { _id: false });
const bookingItemSchema = new mongoose_1.Schema({
    optionId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
    },
    optionTitle: { type: String, required: true },
    price: { type: Number, required: true },
    people: { type: Number, required: true },
    adult: { type: Number },
    child: { type: Number },
    handBuild: { type: Number },
    wheelPottery: { type: Number },
    subtotal: { type: Number, required: true },
    priceBreakdown: { type: [priceBreakdownSchema], default: [] },
}, { _id: false });
/**
 * Who moved a piece to which status and when. Kept so the studio can answer
 * "why is this still here?" without reading the mail logs.
 */
const trackingHistorySchema = new mongoose_1.Schema({
    status: { type: String, required: true },
    at: { type: Date, required: true },
    by: { type: String, enum: ['admin', 'system'], required: true },
    note: { type: String },
}, { _id: false });
const workshopBookingSchema = new mongoose_1.Schema({
    workshopId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'workshop',
        required: true,
    },
    bookingDate: { type: String },
    slotId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
    },
    // Slot times copied from the workshop's defaultSlots when payment succeeds,
    // so later reads don't have to resolve the slot from the workshop again.
    startTime: { type: String }, // "10:00"
    endTime: { type: String }, // "12:00"
    items: [bookingItemSchema],
    makingType: { type: String },
    totalPeople: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    bookingNumber: { type: String, unique: true },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        // `completed` means the workshop has been run. Fired-clay pieces then
        // stay in the studio and move on to `collected` only once the customer
        // picks them up; air-dry pieces go straight to `collected`.
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'collected'],
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    isDeleted: { type: Boolean, default: false },
    bookingType: {
        type: String,
        enum: ['normal', 'gift', 'pottery', 'events'],
        default: 'normal',
    },
    giftStatus: {
        type: String,
        enum: ['pending', 'completed', 'redeemed'],
        default: 'pending',
    },
    giftDetails: {
        recipientName: { type: String },
        giftEmail: { type: String },
        giftPhone: { type: String },
        giftFor: { type: String },
        occasion: { type: String },
        personalMessage: { type: String },
        voucherCode: { type: String },
        voucherPdf: { type: String },
        sentAt: { type: Date },
    },
    giftValidity: { type: Date },
    /**
     * The studio journey for Terracotta and Ceramic pieces.
     *
     * Absent until the admin completes the workshop and starts tracking, which
     * is what the cleanup query keys off to know a booking is live — so this
     * must stay undefined by default rather than get a `{}` default.
     *
     * One tracking record covers the whole booking even when several pieces
     * were made: a customer collects them together, and a crack in any one of
     * them delays the collection of all of them.
     */
    tracking: {
        status: {
            type: String,
            enum: [
                'created',
                'drying',
                'firing',
                'painting',
                'delay',
                'ready',
                'collected',
                'discarded',
            ],
        },
        // 'terracotta' | 'ceramic', resolved from the booked packages when
        // tracking starts and frozen here so the timeline cannot shift later.
        clayCategory: { type: String, enum: ['terracotta', 'ceramic'] },
        // Codes written on the pieces themselves; the customer quotes one of
        // these at reception. No default, so an untracked booking carries no
        // tracking sub-document at all — which is what the cleanup guard and
        // the dashboard both test for.
        itemCodes: { type: [String], default: undefined },
        // Unguessable id in the tracking link, so the page needs no login.
        token: { type: String },
        // Day 0 of the timeline — every estimate is counted from here.
        startedAt: { type: Date },
        dryingAt: { type: Date },
        firingAt: { type: Date },
        paintingAt: { type: Date },
        delayedAt: { type: Date },
        readyAt: { type: Date },
        collectedAt: { type: Date },
        discardedAt: { type: Date },
        // Sticky: a piece that was ever delayed keeps the later estimate even
        // after it moves on, which is what the "Updated Estimated Ready Date"
        // panel shows.
        isDelayed: { type: Boolean },
        delayNote: { type: String },
        // Timestamps of the five customer emails, so a retry or a second run of
        // the scheduler can never send one twice.
        emails: {
            createdSentAt: { type: Date },
            paintingSentAt: { type: Date },
            delaySentAt: { type: Date },
            readySentAt: { type: Date },
            discardWarningSentAt: { type: Date },
        },
        history: { type: [trackingHistorySchema], default: undefined },
    },
}, { timestamps: true });
workshopBookingSchema.index({ workshopId: 1, bookingDate: 1, slotId: 1 });
workshopBookingSchema.index({ userId: 1 });
// The public tracking page looks a booking up by nothing but this token.
workshopBookingSchema.index({ 'tracking.token': 1 }, { sparse: true });
// Every scheduler pass scans for tracked pieces that are still in progress.
workshopBookingSchema.index({ 'tracking.status': 1 }, { sparse: true });
const workshopBookingModel = (0, mongoose_1.model)('workshopBookings', workshopBookingSchema);
exports.default = workshopBookingModel;
