"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_1 = require("../controllers/reportController");
const multer_1 = __importDefault(require("../../middleware/multer"));
const authMiddleware_1 = require("../../middleware/auth/authMiddleware");
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.userAuthMiddleware, multer_1.default.multipleFileUpload(), reportController_1.uploadReport);
router.get('/', authMiddleware_1.userAuthMiddleware, reportController_1.getReport);
exports.default = router;
