"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkInsertBlogs = exports.createBlog = exports.updateBlogById = exports.deleteBlogById = exports.fetchBlogMetaBySlug = exports.fetchBlogBySlug = exports.fetchBlogById = exports.fetchAllBlogsForAdmin = exports.fetchAllBlogs = exports.getBlogsCount = void 0;
const slugify_1 = __importDefault(require("slugify"));
const objectIdParser_1 = require("../../utils/objectIdParser");
const blogModel_1 = __importDefault(require("../models/blogModel"));
const getBlogsCount = async (query) => {
    return await blogModel_1.default.countDocuments(query);
};
exports.getBlogsCount = getBlogsCount;
const fetchAllBlogs = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await blogModel_1.default
        .find(dbQuery)
        .select({ isDeleted: 0, __v: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllBlogs = fetchAllBlogs;
const fetchAllBlogsForAdmin = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await blogModel_1.default
        .find(dbQuery)
        .select({ _id: 1, title: 1, category: 1, bannerImage: 1, writtenBy: 1 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllBlogsForAdmin = fetchAllBlogsForAdmin;
const fetchBlogById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await blogModel_1.default
        .findOne(dbQuery)
        .select({ _id: 0, isDeleted: 0, createdAt: 0, __v: 0 })
        .lean();
};
exports.fetchBlogById = fetchBlogById;
const fetchBlogBySlug = async (query) => {
    return await blogModel_1.default.findOne(query).select({ _id: 0, isDeleted: 0, __v: 0 }).lean();
};
exports.fetchBlogBySlug = fetchBlogBySlug;
const fetchBlogMetaBySlug = async (query) => {
    return await blogModel_1.default
        .findOne(query)
        .select({ metaTitle: 1, metaDescription: 1, bannerImage: 1, _id: 0 })
        .lean();
};
exports.fetchBlogMetaBySlug = fetchBlogMetaBySlug;
const deleteBlogById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await blogModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteBlogById = deleteBlogById;
const updateBlogById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await blogModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateBlogById = updateBlogById;
const createBlog = async (data) => {
    return await blogModel_1.default.create(data);
};
exports.createBlog = createBlog;
const bulkInsertBlogs = async (data) => {
    const bulkOps = await Promise.all(data.map(async (blog) => {
        const slug = await generateSlug(blog.title);
        return {
            insertOne: {
                document: { ...blog, slug },
            },
        };
    }));
    // const newData = data.map((d) => ({ insertOne: { document: d } }));
    await blogModel_1.default.bulkWrite(bulkOps);
    return true;
};
exports.bulkInsertBlogs = bulkInsertBlogs;
const generateSlug = async (title) => {
    const baseSlug = (0, slugify_1.default)(title, {
        lower: true,
        strict: true,
        replacement: '-', // Replace every special character with hyphen
        remove: /[^a-zA-Z0-9 -]/g, // Remove everything except letters, numbers, and spaces
    });
    let suffix = 1;
    let slug = `${baseSlug}-1`;
    // Check if the slug already exists in the database
    while (await blogModel_1.default.exists({ slug })) {
        suffix++;
        slug = `${baseSlug}-${suffix}`;
    }
    return slug;
};
