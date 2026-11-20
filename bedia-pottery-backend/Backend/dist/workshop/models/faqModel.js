"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaqSchema = void 0;
const mongoose_1 = require("mongoose");
const FaqSchema = new mongoose_1.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
}, { timestamps: true });
exports.FaqSchema = FaqSchema;
