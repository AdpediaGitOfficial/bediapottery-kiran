"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLocalityCount = exports.fetchXMLFeed = exports.getPropertyMetaBySlug = exports.getPropertyBySlug = exports.getPropertyById = exports.getKeywordsList = exports.getPropertiesByFilter = exports.getAllPropertiesForAdmin = exports.getAllProperties = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const propertyUseCase_1 = require("../useCases/propertyUseCase");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
exports.getAllProperties = (0, express_async_handler_1.default)(async (req, res) => {
    const properties = await (0, propertyUseCase_1.getAllPropertiesUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched properties successfully',
        result: properties,
    });
});
exports.getAllPropertiesForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const properties = await (0, propertyUseCase_1.getAllPropertiesUseCase)(req.query, true);
    res.status(200).json({
        success: true,
        message: 'Fetched properties successfully',
        result: properties,
    });
});
exports.getPropertiesByFilter = (0, express_async_handler_1.default)(async (req, res) => {
    const properties = await (0, propertyUseCase_1.getPropertiesByFilterUseCase)(req.body);
    res.status(200).json({
        success: true,
        message: 'Fetched properties successfully',
        result: properties,
    });
});
exports.getKeywordsList = (0, express_async_handler_1.default)(async (req, res) => {
    const keywords = await (0, propertyUseCase_1.getKeywordsListUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched keywords successfully',
        result: keywords,
    });
});
exports.getPropertyById = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.params.id || typeof req.params.id !== 'string') {
        throw new appError_1.default('id is required', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const property = await (0, propertyUseCase_1.getPropertyByIdUseCase)(req.params.id);
    res.status(200).json({
        success: true,
        message: 'Fetched property successfully',
        result: property,
    });
});
exports.getPropertyBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const property = await (0, propertyUseCase_1.getPropertyBySlugUseCase)(slug);
    res.status(200).json({
        success: true,
        message: 'Fetched property successfully',
        result: property,
    });
});
exports.getPropertyMetaBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const property = await (0, propertyUseCase_1.getPropertyMetaBySlugUseCase)(slug);
    res.status(200).json({
        success: true,
        message: 'Fetched meta data successfully',
        result: property,
    });
});
exports.fetchXMLFeed = (0, express_async_handler_1.default)(async (req, res) => {
    const fetchXML = await (0, propertyUseCase_1.fetchXMLFeedUseCase)();
    res.status(200).json({
        success: true,
        message: 'Fetched and stored XML feed successfully',
        result: fetchXML,
    });
});
exports.fetchLocalityCount = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, propertyUseCase_1.fetchLocalityCountUseCase)();
    res.status(200).json({
        success: true,
        message: 'Fetched Locality Count successfully',
        result,
    });
});
