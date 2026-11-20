"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const openingHoursSchema = new mongoose_1.Schema({
    title: { type: String, default: 'Opening Hours' },
    days: { type: String, required: true },
    openTime: { type: String, required: true },
    closeTime: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
const OpeningHoursModel = (0, mongoose_1.model)('opening_hours', openingHoursSchema);
exports.default = OpeningHoursModel;
