"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const usersSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true },
    mobileNumber: { type: Number, required: true },
    email: { type: String, required: false },
    avatar: { type: String, default: '' },
    otp: { type: String },
    fixedOtp: { type: String, default: '' },
    mobileNumberVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    status: { type: Number, default: 1 },
    password: { type: String, default: '' },
    role: { type: String },
}, { timestamps: true });
const usersModel = (0, mongoose_1.model)('Users', usersSchema);
exports.default = usersModel;
