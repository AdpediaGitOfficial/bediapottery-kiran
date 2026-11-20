"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const achievementSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
const achievementModel = (0, mongoose_1.model)('achievement', achievementSchema);
exports.default = achievementModel;
