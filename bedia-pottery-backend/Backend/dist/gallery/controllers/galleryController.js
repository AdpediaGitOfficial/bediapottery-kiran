"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGalleryById = exports.deleteGalleryById = exports.updateGalleryById = exports.createGallery = exports.getAllGalleriesForAdmin = exports.getAllGalleries = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const galleryUseCase_1 = require("../useCases/galleryUseCase");
exports.getAllGalleries = (0, express_async_handler_1.default)(async (req, res) => {
    const galleries = await (0, galleryUseCase_1.getAllGalleriesUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Galleries successfully',
        result: galleries,
    });
});
exports.getAllGalleriesForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const galleries = await (0, galleryUseCase_1.getAllGalleriesForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Galleries successfully',
        result: galleries,
    });
});
exports.createGallery = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, galleryUseCase_1.createGalleryUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created Gallery successfully',
        result: true,
    });
});
exports.updateGalleryById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, galleryUseCase_1.updateGalleryByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated Gallery successfully',
        result: true,
    });
});
exports.deleteGalleryById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, galleryUseCase_1.deleteGalleryByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted Gallery successfully',
        result: true,
    });
});
exports.getGalleryById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const gallery = await (0, galleryUseCase_1.getGalleryByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched Gallery successfully',
        result: gallery,
    });
});
