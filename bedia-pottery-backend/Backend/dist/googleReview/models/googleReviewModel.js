"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const googleReviewSchema = new mongoose_1.Schema({
    placeId: {
        type: String,
        required: true,
        index: true,
    },
    reviewId: {
        type: String,
        unique: true,
        required: true,
    },
    authorName: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    text: {
        type: String,
        default: '',
    },
    profilePhotoUrl: {
        type: String,
    },
    reviewTime: {
        type: Number, // Unix timestamp from Google
        required: true,
    },
    media: {
        videos: [{ type: String }], // URLs from your storage
        images: [{ type: String }],
    },
    source: {
        type: String,
        enum: ['google', 'manual'],
        default: 'google',
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
// Prevent duplicate reviews
googleReviewSchema.index({ authorName: 1, reviewTime: 1 }, { unique: true });
const googleReviewModel = (0, mongoose_1.model)('googleReview', googleReviewSchema);
exports.default = googleReviewModel;
