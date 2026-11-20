"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const reportsDataSchema = new mongoose_1.Schema({
    path: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
const leadModel = (0, mongoose_1.model)('reports', reportsDataSchema);
exports.default = leadModel;
