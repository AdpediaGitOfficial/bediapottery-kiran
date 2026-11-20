"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("../../middleware/multer"));
const uploadFileCotroller_1 = require("../controllers/uploadFileCotroller");
const authMiddleware_1 = require("../../middleware/auth/authMiddleware");
const router = (0, express_1.Router)();
router.post('', authMiddleware_1.userAuthMiddleware, (req, res, next) => {
    multer_1.default.multipleFileUpload()(req, res, function (err) {
        if (err) {
            return res.status(400).json({
                status: 'fail',
                error: err.message,
            });
        }
        next();
    });
}, uploadFileCotroller_1.uploadFile);
//router.post('', userAuthMiddleware, multerConfig.multipleFileUpload(), uploadFile);
router.delete('/remove', authMiddleware_1.userAuthMiddleware, uploadFileCotroller_1.removeUploadedFile);
exports.default = router;
