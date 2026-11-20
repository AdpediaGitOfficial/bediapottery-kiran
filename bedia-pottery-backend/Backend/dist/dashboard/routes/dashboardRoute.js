"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const authentication_1 = require("../../middleware/authentication");
const router = (0, express_1.Router)();
router.get('/stats', authentication_1.authenticateAdmin, dashboardController_1.getDashboardStats);
router.get('/chart/new-users', authentication_1.authenticateAdmin, dashboardController_1.getDailyNewUsersChart);
exports.default = router;
