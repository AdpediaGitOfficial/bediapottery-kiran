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
const areaGuideSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    subTitle: { type: String, required: true },
    image: { type: String, required: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    faq: {
        type: [
            {
                question: { type: String, required: true },
                answer: { type: String, required: true },
            },
        ],
        required: true,
    },
    isDeleted: { type: Boolean, default: false },
    slug: { type: String },
}, { timestamps: true });
// Pre-save hook to generate slug
areaGuideSchema.pre('save', async function (next) {
    if (this.isModified('name') || this.isNew) {
        const baseSlug = (0, slugify_1.default)(this.name, {
            lower: true,
            strict: true,
            replacement: '-', // Replace every special character with hyphen
            remove: /[^a-zA-Z0-9 -]/g, // Remove everything except letters, numbers, and spaces
        });
        let slug = baseSlug;
        let suffix = 1;
        // Check if the slug already exists in the database
        while (await mongoose_1.default.model('areaGuide').exists({ slug })) {
            slug = `${baseSlug}-${suffix}`;
            suffix++;
        }
        this.slug = slug;
    }
    next();
});
const areaGuideModel = (0, mongoose_1.model)('areaGuide', areaGuideSchema);
exports.default = areaGuideModel;
