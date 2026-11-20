"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyNewUsersThisMonth = exports.getTotalOrders = exports.getTotalBookings = exports.getPreviousMonthRevenue = exports.getCurrentMonthRevenue = exports.getNewUsersThisMonth = exports.getTotalUsers = void 0;
const userModel_1 = __importDefault(require("../../user/models/userModel"));
const workshopOrders_1 = __importDefault(require("../../workshop/models/workshopOrders"));
const workshopBookingModel_1 = __importDefault(require("../../workshop/models/workshopBookingModel"));
const getTotalUsers = async () => {
    return userModel_1.default.countDocuments({ role: 'user', isDeleted: false });
};
exports.getTotalUsers = getTotalUsers;
const getNewUsersThisMonth = async () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return userModel_1.default.countDocuments({
        role: 'user',
        isDeleted: false,
        createdAt: { $gte: start, $lt: end },
    });
};
exports.getNewUsersThisMonth = getNewUsersThisMonth;
const getCurrentMonthRevenue = async () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const result = await workshopOrders_1.default.aggregate([
        {
            $match: {
                paymentStatus: 'paid',
                isDeleted: false,
                createdAt: { $gte: start, $lt: end },
            },
        },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    return result[0]?.total ?? 0;
};
exports.getCurrentMonthRevenue = getCurrentMonthRevenue;
const getPreviousMonthRevenue = async () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    const result = await workshopOrders_1.default.aggregate([
        {
            $match: {
                paymentStatus: 'paid',
                isDeleted: false,
                createdAt: { $gte: start, $lt: end },
            },
        },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    return result[0]?.total ?? 0;
};
exports.getPreviousMonthRevenue = getPreviousMonthRevenue;
const getTotalBookings = async () => {
    return workshopBookingModel_1.default.countDocuments({ isDeleted: false });
};
exports.getTotalBookings = getTotalBookings;
const getTotalOrders = async () => {
    return workshopOrders_1.default.countDocuments({ isDeleted: false });
};
exports.getTotalOrders = getTotalOrders;
const getDailyNewUsersThisMonth = async () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const result = await userModel_1.default.aggregate([
        {
            $match: {
                role: 'user',
                isDeleted: false,
                createdAt: { $gte: start, $lt: end },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', count: 1 } },
    ]);
    return result;
};
exports.getDailyNewUsersThisMonth = getDailyNewUsersThisMonth;
