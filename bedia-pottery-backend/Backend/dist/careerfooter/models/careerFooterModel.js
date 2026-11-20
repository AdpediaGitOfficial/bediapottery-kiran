"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const careerFooterSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
const careerFooterModel = (0, mongoose_1.model)('careerFooter', careerFooterSchema);
exports.default = careerFooterModel;
