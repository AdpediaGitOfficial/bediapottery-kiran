"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blockedTimeController_1 = require("../controllers/blockedTimeController");
const sanitizeMiddleware_1 = __importDefault(require("../../middleware/sanitizeMiddleware"));
const validate_1 = require("../../middleware/validate");
const authMiddleware_1 = require("../../middleware/auth/authMiddleware");
const blockedTimeSchemas_1 = require("../routevalidators/blockedTimeSchemas");
const router = (0, express_1.Router)();
// Public: the website greys out closed windows. Declared before `/:id` so
// "public" is never read as an id.
router.get('/blocked-times/public', (0, validate_1.validateQuery)(blockedTimeSchemas_1.blockedTimeRangeSchema), blockedTimeController_1.getPublicBlockedTimes);
router.get('/blocked-times', authMiddleware_1.userAuthMiddleware, (0, validate_1.validateQuery)(blockedTimeSchemas_1.blockedTimeRangeSchema), blockedTimeController_1.getBlockedTimes);
router.post('/blocked-times', authMiddleware_1.userAuthMiddleware, (0, validate_1.validateReqBody)(blockedTimeSchemas_1.createBlockedTimeSchema), sanitizeMiddleware_1.default, blockedTimeController_1.createBlockedTime);
router.delete('/blocked-times/:id', authMiddleware_1.userAuthMiddleware, blockedTimeController_1.deleteBlockedTime);
exports.default = router;
