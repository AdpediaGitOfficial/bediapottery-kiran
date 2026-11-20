"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTrackingAutomation = exports.getTrackingCounts = exports.getTrackingByToken = exports.markBookingCollected = exports.updateTrackingStatus = exports.updateTrackingItemCodes = exports.startBookingTracking = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const potteryTrackingUseCase_1 = require("../useCases/potteryTrackingUseCase");
const workshopRepo_1 = require("../repos/workshopRepo");
/**
 * Admin: the workshop is over. Closes the booking as completed, stores the
 * codes written on the pieces and mails the customer their tracking link.
 */
exports.startBookingTracking = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, potteryTrackingUseCase_1.startBookingTrackingUseCase)({
        bookingId: req.params.id,
        itemCodes: req.body?.itemCodes,
    });
    res.status(200).json({
        success: true,
        message: 'Tracking started and the tracking link has been emailed to the customer',
        result,
    });
});
/** Admin: correct the item codes after tracking has already started. */
exports.updateTrackingItemCodes = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, potteryTrackingUseCase_1.updateTrackingItemCodesUseCase)({
        bookingId: req.params.id,
        itemCodes: req.body?.itemCodes,
    });
    res.status(200).json({
        success: true,
        message: 'Item codes updated successfully',
        result,
    });
});
/** Admin: delay, ready, collected or discarded. */
exports.updateTrackingStatus = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, potteryTrackingUseCase_1.updateTrackingStatusUseCase)({
        bookingId: req.params.id,
        status: req.body?.status,
        note: req.body?.note,
    });
    res.status(200).json({
        success: true,
        message: 'Tracking status updated successfully',
        result,
    });
});
/** Admin: close out an Air-Dry booking, which has no journey to track. */
exports.markBookingCollected = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, potteryTrackingUseCase_1.markBookingCollectedUseCase)({ bookingId: req.params.id });
    res.status(200).json({
        success: true,
        message: 'Booking marked as collected',
        result,
    });
});
/**
 * Public: the journey behind a tracking link. The token is the only
 * credential, so nothing here is gated on a session.
 */
exports.getTrackingByToken = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, potteryTrackingUseCase_1.getTrackingByTokenUseCase)(req.params.token);
    res.status(200).json({
        success: true,
        message: 'Fetched tracking details successfully',
        result,
    });
});
/** Admin: how many pieces are sitting at each stage right now. */
exports.getTrackingCounts = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, workshopRepo_1.countTrackedBookingsByStatusRepo)();
    res.status(200).json({
        success: true,
        message: 'Fetched tracking counts successfully',
        result,
    });
});
/**
 * Admin: run the automation now rather than waiting for the next scheduled
 * pass. Useful after a restart, and the only way to see what the job would do
 * without watching the logs.
 */
exports.runTrackingAutomation = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, potteryTrackingUseCase_1.runTrackingAutomationUseCase)();
    res.status(200).json({
        success: true,
        message: 'Tracking automation run completed',
        result,
    });
});
