"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const consultationLeadSchema = new mongoose_1.Schema({}, {
    strict: false, // dynamic fields
    timestamps: true,
});
const consultationLeadModel = (0, mongoose_1.model)('consultation_lead', consultationLeadSchema);
exports.default = consultationLeadModel;
