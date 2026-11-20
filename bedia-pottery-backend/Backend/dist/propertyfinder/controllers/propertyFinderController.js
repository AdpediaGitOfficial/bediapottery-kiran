"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSinglePropertyFinderProperty = exports.getAllPropertyFinderProperties = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const propertyFinderUseCase_1 = require("../usecases/propertyFinderUseCase");
exports.getAllPropertyFinderProperties = (0, express_async_handler_1.default)(async (req, res) => {
    const perPage = req.query.perPage || 50;
    const page = req.query.page || 1;
    const queryParams = {
        ...req.query,
        perPage,
        page,
    };
    const allProperties = await (0, propertyFinderUseCase_1.fetchListingsWithLocations)(queryParams);
    res.status(200).json({
        success: true,
        message: 'Fetched All Properties successfully',
        data: allProperties,
    });
});
exports.getSinglePropertyFinderProperty = (0, express_async_handler_1.default)(async (req, res) => {
    const listingId = req.params.id;
    if (!listingId) {
        res.status(400).json({ success: false, message: 'Listing ID is required' });
        return;
    }
    try {
        const property = await (0, propertyFinderUseCase_1.fetchSingleListing)(listingId);
        res.status(200).json({
            success: true,
            message: `Fetched Property ${listingId} successfully`,
            data: property,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch property',
        });
    }
});
