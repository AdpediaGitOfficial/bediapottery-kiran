"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const contactLeadSchema = new mongoose_1.Schema({}, {
    strict: false, // dynamic fields
    timestamps: true,
});
const contactLeadModel = (0, mongoose_1.model)('contact_lead', contactLeadSchema);
exports.default = contactLeadModel;
