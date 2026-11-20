"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getUserById = exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.deleteAccount = exports.logout = exports.registerAdmin = exports.userLogin = exports.login = exports.getUsers = exports.updateProfile = exports.getProfile = exports.sendOtp = exports.uploadAvatar = exports.verifyOtp = exports.registerUser = void 0;
const userUseCase_1 = require("../useCases/userUseCase");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const localization_1 = require("../../config/localization");
const httpStatus_1 = require("../../common/httpStatus");
const express_validator_1 = require("express-validator");
const appError_1 = __importDefault(require("../../common/appError"));
exports.registerUser = (0, express_async_handler_1.default)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            errors: errors.array(),
        });
        return;
    }
    const data = req.body;
    const result = await (0, userUseCase_1.registerUserUseCase)(data);
    res.status(200).json({
        success: true,
        message: localization_1.responseMessages.registration_success,
        result: result,
    });
});
exports.verifyOtp = (0, express_async_handler_1.default)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            errors: errors.array(),
        });
        return;
    }
    const data = req.body;
    const result = await (0, userUseCase_1.verifyOtpUseCase)(data);
    res.status(200).json({
        success: true,
        message: localization_1.responseMessages.otp_verify_success,
        result,
    });
});
const uploadAvatar = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: 'fail', error: 'No file uploaded.' });
    }
    if (!['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
        return res.status(400).json({ status: 'fail', error: 'Unsupported file type' });
    }
    if (req.file.size > 2 * 1024 * 1024) {
        return res.status(400).json({ status: 'fail', error: 'file size exceeded' });
    }
    /*
    const userId = res.locals.userId as string;
    if (!userId || userId === '') {
      return res.status(401).send('Unauthorized');
    }
    */
    const { studentId } = req.params;
    if (!studentId || studentId === '') {
        return res.status(401).send('Unauthorized');
    }
    const imageUrl = await (0, userUseCase_1.uploadAvatarUseCase)(req.file, studentId);
    res.status(200).json({
        status: 'success',
        message: 'image uploaded successfully',
        result: imageUrl,
    });
};
exports.uploadAvatar = uploadAvatar;
exports.sendOtp = (0, express_async_handler_1.default)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            errors: errors.array(),
        });
        return;
    }
    const data = req.body;
    const result = await (0, userUseCase_1.sendOtpUseCase)(data);
    res.status(200).json({
        success: true,
        message: localization_1.responseMessages.otp_send_success,
        result,
    });
});
const getProfile = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            errors: errors.array(),
        });
        return;
    }
    try {
        const { userId } = req.params;
        const result = await (0, userUseCase_1.getProfileUseCase)(userId);
        return res.status(200).json({
            success: true,
            message: localization_1.responseMessages.response_success_get,
            result: result,
        });
    }
    catch (error) {
        if (error instanceof appError_1.default) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }
        return res.status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: localization_1.responseMessages.unexpected_error,
        });
    }
};
exports.getProfile = getProfile;
exports.updateProfile = (0, express_async_handler_1.default)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            errors: errors.array(),
        });
        return;
    }
    const { userId } = req.params;
    const data = req.body;
    const result = await (0, userUseCase_1.updateUserUseCase)(userId, data);
    res.status(200).json({
        success: true,
        message: localization_1.responseMessages.response_success_put,
        result: result,
    });
});
const getUsers = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            errors: errors.array(),
        });
    }
    try {
        const filters = {
            fullName: req.query.fullName,
            mobileNumber: req.query.mobileNumber
                ? parseInt(req.query.mobileNumber, 10)
                : undefined,
            status: req.query.status ? parseInt(req.query.status) : undefined,
            role: req.query.role,
        };
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const result = await (0, userUseCase_1.getUsersUseCase)(filters, limit, page);
        return res.status(200).json({
            success: true,
            message: 'Fetch users successfully',
            result,
        });
    }
    catch (error) {
        if (error instanceof appError_1.default) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: 'An error occurred',
        });
    }
};
exports.getUsers = getUsers;
exports.login = (0, express_async_handler_1.default)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            errors: errors.array(),
        });
        return;
    }
    const data = req.body;
    const result = await (0, userUseCase_1.loginUseCase)(data);
    res.status(200).json({
        success: true,
        message: localization_1.responseMessages.login_success,
        result,
    });
});
exports.userLogin = (0, express_async_handler_1.default)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            errors: errors.array(),
        });
        return;
    }
    const data = req.body;
    const result = await (0, userUseCase_1.userLoginUseCase)(data);
    res.status(200).json({
        success: true,
        message: localization_1.responseMessages.login_success,
        result,
    });
});
exports.registerAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            errors: errors.array(),
        });
        return;
    }
    const data = req.body;
    const result = await (0, userUseCase_1.registerAdminUseCase)(data);
    res.status(200).json({
        success: true,
        message: localization_1.responseMessages.registration_success,
        result: result,
    });
});
exports.logout = (0, express_async_handler_1.default)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            errors: errors.array(),
        });
        return;
    }
    const { deviceType } = req.body;
    const userId = res.locals.userId;
    const result = await (0, userUseCase_1.logoutUseCase)(userId, deviceType);
    res.clearCookie('token');
    res.setHeader('Clear-Site-Data', '"cookies"');
    res.status(200).json({
        success: true,
        message: localization_1.responseMessages.logout_success,
        result,
    });
});
exports.deleteAccount = (0, express_async_handler_1.default)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            errors: errors.array(),
        });
        return;
    }
    const userId = res.locals.userId;
    const result = await (0, userUseCase_1.deleteAccountUseCase)(userId);
    res.status(200).json({
        success: true,
        message: localization_1.responseMessages.msg_success,
        result,
    });
});
exports.changePassword = (0, express_async_handler_1.default)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            errors: errors.array(),
        });
        return;
    }
    const userId = res.locals.userId;
    const data = req.body;
    const result = await (0, userUseCase_1.changePasswordUseCase)(userId, data);
    res.status(200).json({
        success: true,
        message: localization_1.responseMessages.password_change_success,
        result,
    });
});
exports.forgotPassword = (0, express_async_handler_1.default)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            errors: errors.array(),
        });
        return;
    }
    const data = req.body;
    const sentTo = await (0, userUseCase_1.forgotPasswordUseCase)(data);
    res.status(200).json({
        success: true,
        message: `Password reset link sent to ${sentTo}`,
        result: true,
    });
});
exports.resetPassword = (0, express_async_handler_1.default)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            errors: errors.array(),
        });
        return;
    }
    const data = req.body;
    const result = await (0, userUseCase_1.resetPasswordUseCase)(data);
    res.status(200).json({
        success: true,
        message: localization_1.responseMessages.password_change_success,
        result,
    });
});
exports.getUserById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const user = await (0, userUseCase_1.getUserByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched User successfully',
        result: user,
    });
});
exports.deleteUser = (0, express_async_handler_1.default)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            errors: errors.array(),
        });
        return;
    }
    const { userId } = req.params;
    const result = await (0, userUseCase_1.deleteAccountUseCase)(userId);
    res.status(200).json({
        success: true,
        message: localization_1.responseMessages.msg_success,
        result,
    });
});
