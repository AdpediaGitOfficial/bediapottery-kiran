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
const defaultSlotSchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        auto: true,
    },
    label: { type: String, required: true }, // Morning / Evening
    startTime: { type: String, required: true }, // "10:00"
    endTime: { type: String, required: true }, // "12:00"
    capacity: { type: Number, default: 12 },
});
const workshopOptionSchema = new mongoose_1.Schema({
    clayTypeId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'clayType',
    },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'AED' },
    // For a family workshop this is the party the price covers, e.g.
    // "1 Adult + 1 Child" — read when pricing a `workshopType: 'family'` booking
    // (see utils/workshopOptionPricing.ts).
    priceDescription: { type: String },
    description: { type: String },
    inclusions: {
        type: [String],
        default: [],
    },
    image: { type: String },
    // Thumbnail for this workshop option
    clayTypethumbnailImage: {
        type: String,
        default: '',
    },
    // Video for this workshop option
    clayTypeVideo: {
        type: String,
        default: '',
    },
});
const workshopImageSchema = new mongoose_1.Schema({
    image: { type: String, required: true },
    title: { type: String },
}, { _id: true });
const workshopIncludeSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    icon: { type: String },
}, { _id: true });
const workshopMoreDetailsSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    icon: { type: String },
    description: { type: String },
}, { _id: true });
const workshopSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    bannerImage: { type: String },
    images: [workshopImageSchema],
    categoryId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'category',
        required: true,
    },
    shortDescription: { type: String, required: false },
    description: { type: String, required: true },
    overview: { type: String },
    defaultSlots: [defaultSlotSchema],
    includes: [workshopIncludeSchema],
    moreDetails: [workshopMoreDetailsSchema],
    nonAvailabilityDates: { type: [String], default: [] }, // "2026-01-26"
    nonAvailabilityDays: { type: [String], default: [] }, // "Sunday"
    options: [workshopOptionSchema],
    //faq: { type: [String], default: [] },
    //termsAndConditions: { type: String, default: '' },
    showOnHomepage: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    type: { type: String },
    journeyImage: { type: [String], default: [] },
}, { timestamps: true });
workshopSchema.pre('save', async function (next) {
    if (this.isModified('title') || this.isNew) {
        const baseSlug = (0, slugify_1.default)(this.title, {
            lower: true,
            strict: true,
            trim: true,
        });
        let slug = baseSlug;
        let counter = 1;
        while (await mongoose_1.default.model('workshop').exists({ slug })) {
            slug = `${baseSlug}-${counter++}`;
        }
        this.slug = slug;
    }
    next();
});
workshopSchema.index({ slug: 1 });
workshopSchema.index({ categoryId: 1 });
workshopSchema.index({ isActive: 1 });
const workshopModel = (0, mongoose_1.model)('workshop', workshopSchema);
exports.default = workshopModel;
