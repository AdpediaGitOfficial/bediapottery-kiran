"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const propertyLeadSchema = new mongoose_1.Schema({}, {
    strict: false, // allow dynamic fields
    timestamps: true,
});
const propertyLeadModel = (0, mongoose_1.model)('property_lead', propertyLeadSchema);
exports.default = propertyLeadModel;
