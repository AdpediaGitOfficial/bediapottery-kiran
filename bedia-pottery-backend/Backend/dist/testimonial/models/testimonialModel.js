"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const testimonialSchema = new mongoose_1.Schema({
    content: { type: String, required: true },
    author: { type: String, required: true },
    designation: { type: String },
    authorImage: { type: String },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
const testimonialModel = (0, mongoose_1.model)('testimonial', testimonialSchema);
exports.default = testimonialModel;
