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
exports.CommunityModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const PropertyFeatureSchema = new mongoose_1.Schema({
    image: { type: String, required: true },
    heading: { type: String, required: true },
    description: { type: String, required: true },
});
const NewLaunchProjectSchema = new mongoose_1.Schema({
    image: { type: String, required: true },
    heading: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    bedrooms: { type: String, required: true },
    shortTitle: { type: String, required: true },
    brochure: { type: String },
    paymentPlan: { type: String },
    highlightTitle: { type: String, required: true },
    highlightDescription: { type: String, required: true },
    bannerImage: { type: String },
    slug: { type: String, unique: true, index: true },
    floorPlan: { type: String },
}, { timestamps: true });
const TimeBasedLocationSchema = new mongoose_1.Schema({
    time: { type: String, required: true },
    location: { type: String, required: true },
});
const NearbyCommunitySchema = new mongoose_1.Schema({
    image: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
});
const CommunitySchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    shortTitle: { type: String },
    shortDescription: { type: String },
    developer: { type: String },
    bannerImage: { type: String },
    propertyImage: { type: String },
    propertyImages: [{ type: String }],
    brochure: { type: String },
    aboutCommunityTitle: { type: String },
    aboutCommunityDescription: { type: String },
    communityImage: { type: String },
    bedrooms: { type: Number },
    paymentPlan: { type: String },
    startingPrice: { type: Number },
    communityFloorPlan: { type: String },
    propertyFeatures: [PropertyFeatureSchema],
    timeBasedLocations: [TimeBasedLocationSchema],
    nearbyCommunities: [NearbyCommunitySchema],
    newLaunchProjects: [NewLaunchProjectSchema],
    slug: { type: String, unique: true, index: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
// ✅ Pre-save hook for slug generation
CommunitySchema.pre('save', async function (next) {
    if (this.isModified('title') || this.isNew) {
        const baseSlug = (0, slugify_1.default)(this.title, {
            lower: true,
            strict: true,
            replacement: '-',
            remove: /[^a-zA-Z0-9 -]/g,
        });
        let slug = baseSlug;
        let suffix = 1;
        // ✅ Ensure uniqueness
        while (await mongoose_1.default.model('Community').exists({ slug })) {
            slug = `${baseSlug}-${suffix}`;
            suffix++;
        }
        this.slug = slug;
    }
    if (this.newLaunchProjects && this.newLaunchProjects.length > 0) {
        for (const project of this.newLaunchProjects) {
            if (!project.slug && project.shortTitle) {
                const baseSlug = (0, slugify_1.default)(project.shortTitle, {
                    lower: true,
                    strict: true,
                    replacement: '-',
                    remove: /[^a-zA-Z0-9 -]/g,
                });
                let slug = baseSlug;
                let suffix = 1;
                while (await mongoose_1.default.model('Community').exists({
                    'newLaunchProjects.slug': slug,
                })) {
                    slug = `${baseSlug}-${suffix}`;
                    suffix++;
                }
                project.slug = slug;
            }
        }
    }
    next();
});
exports.CommunityModel = mongoose_1.default.models.Community || mongoose_1.default.model('Community', CommunitySchema);
