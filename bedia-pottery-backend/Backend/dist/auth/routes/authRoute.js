"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const sanitizeMiddleware_1 = __importDefault(require("../../middleware/sanitizeMiddleware"));
const validate_1 = require("../../middleware/validate");
const login_1 = require("../routevalidators/login");
const reigster_1 = require("../routevalidators/reigster");
// import { updateUserSchema } from '../routevalidators/updateUser';
const getAllUsers_1 = require("../routevalidators/getAllUsers");
const authMiddleware_1 = require("../../middleware/auth/authMiddleware");
const changePassword_1 = require("../routevalidators/changePassword");
const forgotPassword_1 = require("../routevalidators/forgotPassword");
const resetPassword_1 = require("../routevalidators/resetPassword");
const rateLimiter_1 = require("../../middleware/rateLimiter");
const router = (0, express_1.Router)();
router.post('/login', rateLimiter_1.loginLimiter, sanitizeMiddleware_1.default, (0, validate_1.validateReqBody)(login_1.loginUserSchema), authController_1.loginUser);
router.post('/register', 
// adminAuthMiddleware,
// sanitizeBody,
(0, validate_1.validateReqBody)(reigster_1.registerUserSchema), authController_1.registerUser);
router.post('/verifyToken', authController_1.verifyToken);
router.get('/user/all', authMiddleware_1.adminAuthMiddleware, (0, validate_1.validateQuery)(getAllUsers_1.getAllUsersSchema), authController_1.getAllUsers);
router.put('/change-password', authMiddleware_1.userAuthMiddleware, sanitizeMiddleware_1.default, (0, validate_1.validateReqBody)(changePassword_1.changePasswordSchema), authController_1.changePassword);
router.post('/forgot-password', rateLimiter_1.loginLimiter, sanitizeMiddleware_1.default, (0, validate_1.validateReqBody)(forgotPassword_1.forgotPasswordSchema), authController_1.forgotPassword);
router.post('/reset-password', rateLimiter_1.loginLimiter, sanitizeMiddleware_1.default, (0, validate_1.validateReqBody)(resetPassword_1.resetPasswordSchema), authController_1.resetPassword);
router.delete('/user/:id', authMiddleware_1.adminAuthMiddleware, authController_1.deleteUserById);
router.get('/user/dashboard-data', authMiddleware_1.userAuthMiddleware, authController_1.getDashboardData);
// router.put(      // MAY BE USE LATER===========================================
//   '/user/:id',
//   sanitizeBody,
//   validateReqBody(updateUserSchema as JSONSchemaType<unknown>),
//   updateUserById,
// );
// router.get('/user/:id', getUserById);
exports.default = router;
