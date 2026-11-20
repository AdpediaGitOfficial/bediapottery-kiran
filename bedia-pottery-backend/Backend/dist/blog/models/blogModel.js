"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_2 = __importDefault(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const blogSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    bannerImage: { type: String, required: true },
    category: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    slug: { type: String, unique: true },
    writtenBy: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
// Pre-save hook to generate slug
blogSchema.pre('save', async function (next) {
    if (this.isModified('title') || this.isNew) {
        const baseSlug = (0, slugify_1.default)(this.title, {
            lower: true,
            strict: true,
            replacement: '-', // Replace every special character with hyphen
            remove: /[^a-zA-Z0-9 -]/g, // Remove everything except letters, numbers, and spaces
        });
        let suffix = 1;
        let slug = `${baseSlug}-1`;
        // Check if the slug already exists in the database
        while (await mongoose_2.default.model('blog').exists({ slug })) {
            suffix++;
            slug = `${baseSlug}-${suffix}`;
        }
        this.slug = slug;
    }
    next();
});
const blogModel = (0, mongoose_1.model)('blog', blogSchema);
exports.default = blogModel;
