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
const offPlanPropertySchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    bannerImage: { type: String, required: true },
    developer: { type: String, required: true },
    neighbourhood: { type: String, required: true },
    location: { type: String, required: true },
    startingPrice: { type: Number, required: true },
    handoverYear: { type: String, required: true },
    category: { type: String, required: true },
    images: { type: [String], required: true },
    floorPlans: { type: [{ name: String, path: String, size: String }], required: true },
    floorPlanPDF: { type: String },
    features: { type: [String], required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    brochure: { type: String, required: true },
    size: { type: String, required: true },
    // sizeUnit: { type: String, required: true },
    sizeUnit: { type: String },
    isExclusive: { type: Boolean, default: false },
    roi: { type: String },
    primeLocation: { type: String },
    design: { type: String },
    // communityFeatureTitle: { type: String, required: true },
    // communityFeatureDescription: { type: String, required: true },
    // communityFeatureImages: { type: [String], required: true },
    communityFeatureTitle: { type: String },
    communityFeatureDescription: { type: String },
    communityFeatureImages: { type: [String] },
    locationTitle: { type: String },
    locationDescription: { type: String },
    locationFeatures: { type: [String] },
    faq: { type: [{ question: String, answer: String }] },
    shortPaymentPlan: { type: String },
    featuredProperty: { type: Boolean },
    paymentPlanDetails: { type: [{ name: String, percentage: Number }] },
    slug: { type: String, unique: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isLuxury: { type: Boolean, default: false },
    propertyOffers: {
        type: [
            {
                icon: { type: String },
                title: { type: String, required: true },
                description: { type: String, required: true },
            },
        ],
        required: false,
        default: [],
    },
    propertyDetails: {
        type: [
            {
                title: { type: String },
                description: { type: String, required: true },
            },
        ],
        required: false,
        default: [],
    },
}, { timestamps: true });
// Pre-save hook to generate slug
offPlanPropertySchema.pre('save', async function (next) {
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
        while (await mongoose_1.default.model('offPlan').exists({ slug })) {
            slug = `${baseSlug}-${suffix}`;
            suffix++;
        }
        this.slug = slug;
    }
    next();
});
const propertyModel = (0, mongoose_1.model)('offPlan', offPlanPropertySchema);
exports.default = propertyModel;
