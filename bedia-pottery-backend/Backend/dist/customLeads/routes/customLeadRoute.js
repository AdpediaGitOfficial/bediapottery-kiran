"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/auth/authMiddleware");
const customLeadControllers_1 = require("../controllers/customLeadControllers");
const router = (0, express_1.Router)();
router.post('/:type', customLeadControllers_1.createLeadController);
router.get('/all/:type', authMiddleware_1.userAuthMiddleware, customLeadControllers_1.getLeadsController);
exports.default = router;
