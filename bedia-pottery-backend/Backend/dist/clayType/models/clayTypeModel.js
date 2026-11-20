"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const clayTypeSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    image: [{ type: String }],
    description: { type: String },
    shortDescription: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
const clayTypeModel = (0, mongoose_1.model)('clayType', clayTypeSchema);
exports.default = clayTypeModel;
