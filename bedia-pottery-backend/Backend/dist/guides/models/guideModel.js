"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const guideSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    image1: { type: String, required: true },
    image2: { type: String, required: true },
    content: { type: String, required: true },
    propertyType: { type: String, default: 'General' },
    propertyPurpose: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
const guideModel = (0, mongoose_1.model)('guide', guideSchema);
exports.default = guideModel;
