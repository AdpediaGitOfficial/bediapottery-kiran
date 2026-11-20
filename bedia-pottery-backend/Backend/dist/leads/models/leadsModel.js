"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const leadsDataSchema = new mongoose_1.Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    preferredLanguage: { type: String },
    propertyType: { type: String },
    propertySlug: { type: String },
    message: { type: String },
    preferredArea: { type: String },
    idealBudget: { type: String },
    bedrooms: { type: String },
    userType: { type: String },
    expectedPurchaseTime: { type: String },
    preferredContactMethod: { type: String },
    preferredContactTime: { type: String },
    preferredDate: { type: String },
    propertyIdentifier: { type: String },
    leadType: { type: String, default: 'General' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
const leadModel = (0, mongoose_1.model)('leads', leadsDataSchema);
exports.default = leadModel;
