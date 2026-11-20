"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlockedTimeById = exports.createBlockedTime = exports.findBlockForSlot = exports.fetchBlockedTimesForDate = exports.fetchBlockedTimesInRange = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const blockedTimes_1 = require("../../utils/blockedTimes");
const blockedTimeModel_1 = __importDefault(require("../models/blockedTimeModel"));
const PUBLIC_FIELDS = { date: 1, allSlots: 1, startTime: 1, endTime: 1 };
/** Every live block between two "YYYY-MM-DD" days, inclusive. */
const fetchBlockedTimesInRange = async (from, to, { includeReason = true } = {}) => {
    const query = { isDeleted: false };
    // The dates are zero-padded "YYYY-MM-DD", so string order is calendar order.
    if (from || to) {
        query.date = {};
        if (from)
            query.date.$gte = from;
        if (to)
            query.date.$lte = to;
    }
    return await blockedTimeModel_1.default
        .find(query)
        .select(includeReason ? { isDeleted: 0, __v: 0 } : PUBLIC_FIELDS)
        .sort({ date: 1, startTime: 1 })
        .lean();
};
exports.fetchBlockedTimesInRange = fetchBlockedTimesInRange;
const fetchBlockedTimesForDate = async (date) => {
    return await blockedTimeModel_1.default.find({ date, isDeleted: false }).lean();
};
exports.fetchBlockedTimesForDate = fetchBlockedTimesForDate;
/**
 * The block closing this slot on this day, or null when it can be sold.
 * Every availability check and every booking path goes through here.
 */
const findBlockForSlot = async (bookingDate, range) => {
    const dateKey = (0, blockedTimes_1.toDateKey)(bookingDate);
    if (!dateKey)
        return null;
    const blocks = await (0, exports.fetchBlockedTimesForDate)(dateKey);
    return (0, blockedTimes_1.findCoveringBlock)(blocks, dateKey, range);
};
exports.findBlockForSlot = findBlockForSlot;
const createBlockedTime = async (data) => {
    return await blockedTimeModel_1.default.create(data);
};
exports.createBlockedTime = createBlockedTime;
/** Soft delete, like the rest of the admin data, so a removal can be traced. */
const deleteBlockedTimeById = async (id) => {
    return await blockedTimeModel_1.default.findOneAndUpdate({ _id: (0, objectIdParser_1.ObjectID)(id), isDeleted: false }, { isDeleted: true });
};
exports.deleteBlockedTimeById = deleteBlockedTimeById;
