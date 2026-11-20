"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const jobApplicationSchema = new mongoose_1.Schema({
    applicantName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    resume: { type: String, required: true },
    coverLetter: { type: String },
    jobTitle: { type: String, required: true },
    jobSlug: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
const jobApplicationModel = (0, mongoose_1.model)('jobApplication', jobApplicationSchema);
exports.default = jobApplicationModel;
