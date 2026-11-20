"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyNewUsersChartUseCase = exports.getDashboardStatsUseCase = void 0;
const dashboardRepo_1 = require("../repos/dashboardRepo");
const getDashboardStatsUseCase = async () => {
    const [totalUsers, newUsersThisMonth, currentMonthRevenue, previousMonthRevenue, totalBookings, totalOrders,] = await Promise.all([
        (0, dashboardRepo_1.getTotalUsers)(),
        (0, dashboardRepo_1.getNewUsersThisMonth)(),
        (0, dashboardRepo_1.getCurrentMonthRevenue)(),
        (0, dashboardRepo_1.getPreviousMonthRevenue)(),
        (0, dashboardRepo_1.getTotalBookings)(),
        (0, dashboardRepo_1.getTotalOrders)(),
    ]);
    let growthPercentage = 0;
    if (previousMonthRevenue > 0) {
        growthPercentage = parseFloat((((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(2));
    }
    else if (currentMonthRevenue > 0) {
        growthPercentage = 100;
    }
    return {
        totalUsers,
        newUsersThisMonth,
        currentMonthRevenue,
        previousMonthRevenue,
        growthPercentage,
        totalBookings,
        totalOrders,
    };
};
exports.getDashboardStatsUseCase = getDashboardStatsUseCase;
const getDailyNewUsersChartUseCase = async () => {
    return (0, dashboardRepo_1.getDailyNewUsersThisMonth)();
};
exports.getDailyNewUsersChartUseCase = getDailyNewUsersChartUseCase;
