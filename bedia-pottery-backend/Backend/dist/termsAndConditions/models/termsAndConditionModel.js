"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const termsAndConditionSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true, // "Terms & Conditions"
    },
    content: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('terms_and_conditions', termsAndConditionSchema);
