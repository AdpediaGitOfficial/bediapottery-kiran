"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlogMetaBySlug = exports.getBlogBySlug = exports.getBlogById = exports.deleteBlogById = exports.updateBlogById = exports.fetchFromXml = exports.createBlog = exports.getAllBlogsForAdmin = exports.getAllBlogs = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const blogUseCase_1 = require("../useCases/blogUseCase");
exports.getAllBlogs = (0, express_async_handler_1.default)(async (req, res) => {
    const blogs = await (0, blogUseCase_1.getAllBlogsUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Blogs successfully',
        result: blogs,
    });
});
exports.getAllBlogsForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const blogs = await (0, blogUseCase_1.getAllBlogsForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Blogs successfully',
        result: blogs,
    });
});
exports.createBlog = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, blogUseCase_1.createBlogUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created Blog successfully',
        result: true,
    });
});
exports.fetchFromXml = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        res.status(400).json({ status: 'fail', error: 'No file uploaded.' });
        return;
    }
    const data = await (0, blogUseCase_1.fetchBlogFromXmlUseCase)(req.files);
    res.status(200).json({
        success: true,
        message: 'Fetched Blogs successfully',
        result: data,
    });
});
exports.updateBlogById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, blogUseCase_1.updateBlogByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated Blog successfully',
        result: true,
    });
});
exports.deleteBlogById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, blogUseCase_1.deleteBlogByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted Blog successfully',
        result: true,
    });
});
exports.getBlogById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const blog = await (0, blogUseCase_1.getBlogByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched Blog successfully',
        result: blog,
    });
});
exports.getBlogBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const blog = await (0, blogUseCase_1.getBlogBySlugUseCase)(slug);
    res.status(200).json({
        success: true,
        message: 'Fetched Blog successfully',
        result: blog,
    });
});
exports.getBlogMetaBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const blog = await (0, blogUseCase_1.getBlogMetaBySlugUseCase)(slug);
    res.status(200).json({
        success: true,
        message: 'Fetched meta data successfully',
        result: blog,
    });
});
