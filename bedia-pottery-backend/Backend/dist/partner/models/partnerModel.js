"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const partnerSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    logo: { type: String, required: true },
    websiteUrl: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
const partnerModel = (0, mongoose_1.model)('partner', partnerSchema);
exports.default = partnerModel;
