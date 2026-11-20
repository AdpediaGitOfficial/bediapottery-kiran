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
const propertySchema = new mongoose_1.Schema({
    propertySizeUnit: { type: String },
    lastUpdated: { type: Date },
    features: { type: [String] },
    images: { type: [String] },
    permitNumber: { type: String },
    propertyTitle: { type: String },
    propertyDescription: { type: String },
    propertyTitleAR: { type: String },
    propertyDescriptionAR: { type: String },
    price: { type: Number },
    propertyPurpose: { type: String },
    offPlan: { type: String },
    portals: { type: [String] },
    city: { type: String },
    locality: { type: String },
    subLocality: { type: String },
    towerName: { type: String },
    videos: { type: [String] },
    propertyStatus: { type: String },
    bathrooms: { type: Number },
    bedrooms: { type: Number },
    propertyRefNo: { type: String },
    propertySize: { type: Number },
    furnished: { type: String },
    propertyType: { type: String },
    listingAgent: { type: String },
    listingAgentEmail: { type: String },
    listingAgentPhone: { type: String },
    slug: { type: String, unique: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
// Pre-save hook to generate slug
propertySchema.pre('save', async function (next) {
    if (this.isModified('propertyTitle') || this.isNew) {
        const baseSlug = (0, slugify_1.default)(this.propertyTitle, {
            lower: true,
            strict: true,
            replacement: '-', // Replace every special character with hyphen
            remove: /[^a-zA-Z0-9 -]/g, // Remove everything except letters, numbers, and spaces
        });
        let suffix = 1;
        let slug = `${baseSlug}-1`;
        // Check if the slug already exists in the database
        while (await mongoose_1.default.model('property').exists({ slug })) {
            suffix++;
            slug = `${baseSlug}-${suffix}`;
        }
        this.slug = slug;
    }
    next();
});
const propertyModel = (0, mongoose_1.model)('property', propertySchema);
exports.default = propertyModel;
