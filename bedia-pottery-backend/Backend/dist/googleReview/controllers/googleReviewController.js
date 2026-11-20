"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncGoogleReviews = exports.getGoogleReviewById = exports.deleteGoogleReviewById = exports.updateGoogleReviewById = exports.createGoogleReview = exports.getAllGoogleReviewsForAdmin = exports.getAllGoogleReviews = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const googleReviewUseCase_1 = require("../useCases/googleReviewUseCase");
exports.getAllGoogleReviews = (0, express_async_handler_1.default)(async (req, res) => {
    const googleReviews = await (0, googleReviewUseCase_1.getAllGoogleReviewsUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All GoogleReviews successfully',
        result: googleReviews,
    });
});
exports.getAllGoogleReviewsForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const googleReviews = await (0, googleReviewUseCase_1.getAllGoogleReviewsForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All GoogleReviews successfully',
        result: googleReviews,
    });
});
exports.createGoogleReview = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, googleReviewUseCase_1.createGoogleReviewUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created GoogleReview successfully',
        result: true,
    });
});
exports.updateGoogleReviewById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, googleReviewUseCase_1.updateGoogleReviewByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated GoogleReview successfully',
        result: true,
    });
});
exports.deleteGoogleReviewById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, googleReviewUseCase_1.deleteGoogleReviewByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted GoogleReview successfully',
        result: true,
    });
});
exports.getGoogleReviewById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const googleReview = await (0, googleReviewUseCase_1.getGoogleReviewByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched GoogleReview successfully',
        result: googleReview,
    });
});
exports.syncGoogleReviews = (0, express_async_handler_1.default)(async (_req, res) => {
    await (0, googleReviewUseCase_1.syncGoogleReviewsUseCase)();
    res.status(200).json({
        success: true,
        message: 'Google reviews synced successfully',
    });
});
