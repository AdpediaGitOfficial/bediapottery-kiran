"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    designation: { type: String },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
const userModel = (0, mongoose_1.model)('user', userSchema);
exports.default = userModel;
