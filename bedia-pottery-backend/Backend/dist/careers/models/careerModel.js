"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const careerSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    responsibilities: { type: String },
    roleSummary: { type: String },
    requirements: { type: String },
    jobType: { type: String, required: true, enum: ['Remote', 'Hybrid', 'In Person'] },
    workingHours: { type: String, required: true, enum: ['Full Time', 'Part Time'] },
    slug: { type: String, unique: true },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
// Pre-save hook to generate slug
careerSchema.pre('save', async function (next) {
    if (this.isModified('title') || this.isNew) {
        const baseSlug = (0, slugify_1.default)(this.title, {
            lower: true,
            strict: true,
            replacement: '-', // Replace every special character with hyphen
            remove: /[^a-zA-Z0-9 -]/g, // Remove everything except letters, numbers, and spaces
        });
        let slug = baseSlug;
        let suffix = 1;
        // Check if the slug already exists in the database
        while (await mongoose_1.default.model('career').exists({ slug })) {
            slug = `${baseSlug}-${suffix}`;
            suffix++;
        }
        this.slug = slug;
    }
    next();
});
const careerModel = (0, mongoose_1.model)('career', careerSchema);
exports.default = careerModel;
