"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.deleteUserById = exports.updateUserById = exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.getDashboardData = exports.getAllUsers = exports.verifyToken = exports.loginUser = exports.registerUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const authUseCase_1 = require("../useCases/authUseCase");
exports.registerUser = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    const result = await (0, authUseCase_1.registerUserUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'User created successfully',
        result,
    });
});
exports.loginUser = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    const result = await (0, authUseCase_1.loginUserUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        result,
    });
});
exports.verifyToken = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    if (!data.token) {
        res.status(400).json({ success: false, message: 'Token is required' });
        return;
    }
    const result = await (0, authUseCase_1.verifyTokenUseCase)(data.token);
    res.status(200).json({ success: true, message: 'Token verified Successfully', result });
});
exports.getAllUsers = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, authUseCase_1.getAllUsersUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched all users successfully',
        result,
    });
});
exports.getDashboardData = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, authUseCase_1.getDashboardDataUseCase)();
    res.status(200).json({
        success: true,
        message: 'Fetched dashboard data successfully',
        result,
    });
});
exports.changePassword = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, authUseCase_1.changePasswordUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Changed Password successfully',
        result: true,
    });
});
exports.forgotPassword = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    const sentTo = await (0, authUseCase_1.forgotPasswordUseCase)(data);
    res.status(200).json({
        success: true,
        message: `Password reset link sent to ${sentTo}`,
        result: true,
    });
});
exports.resetPassword = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, authUseCase_1.resetPasswordUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Password reset successfully',
        result: true,
    });
});
exports.updateUserById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, authUseCase_1.updateUserByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated User successfully',
        result: true,
    });
});
exports.deleteUserById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, authUseCase_1.deleteUserByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted User successfully',
        result: true,
    });
});
exports.getUserById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const user = await (0, authUseCase_1.getUserByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched User successfully',
        result: user,
    });
});
