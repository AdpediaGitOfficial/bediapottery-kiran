"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPageMetaByUrl = exports.getPageMetaById = exports.deletePageMetaById = exports.updatePageMetaById = exports.createPageMeta = exports.getAllPageMetasForAdmin = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const pageMetaUseCase_1 = require("../useCases/pageMetaUseCase");
exports.getAllPageMetasForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const metaDatas = await (0, pageMetaUseCase_1.getAllPageMetasForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All meta data successfully',
        result: metaDatas,
    });
});
exports.createPageMeta = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, pageMetaUseCase_1.createPageMetaUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created meta data successfully',
        result: true,
    });
});
exports.updatePageMetaById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, pageMetaUseCase_1.updatePageMetaByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated meta data successfully',
        result: true,
    });
});
exports.deletePageMetaById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, pageMetaUseCase_1.deletePageMetaByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted meta data successfully',
        result: true,
    });
});
exports.getPageMetaById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const metaData = await (0, pageMetaUseCase_1.getPageMetaByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched meta data successfully',
        result: metaData,
    });
});
exports.getPageMetaByUrl = (0, express_async_handler_1.default)(async (req, res) => {
    const { url } = req.body;
    const metaData = await (0, pageMetaUseCase_1.getPageMetaByUrlUseCase)(url);
    res.status(200).json({
        success: true,
        message: 'Fetched meta data successfully',
        result: metaData,
    });
});
