"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const gallerySchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    images: {
        type: [String],
        required: true,
        validate: [(v) => v.length > 0, 'At least one image is required'],
    },
    description: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
const galleryModel = (0, mongoose_1.model)('gallery', gallerySchema);
exports.default = galleryModel;
