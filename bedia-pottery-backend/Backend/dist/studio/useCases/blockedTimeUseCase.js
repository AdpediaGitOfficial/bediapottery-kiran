"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertSlotNotBlocked = exports.deleteBlockedTimeUseCase = exports.createBlockedTimeUseCase = exports.getPublicBlockedTimesUseCase = exports.getBlockedTimesUseCase = void 0;
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const objectIdParser_1 = require("../../utils/objectIdParser");
const uaeTime_1 = require("../../utils/uaeTime");
const blockedTimes_1 = require("../../utils/blockedTimes");
const blockedTimeRepo_1 = require("../repos/blockedTimeRepo");
/** Today's calendar day in UAE, whatever zone the server runs in. */
const uaeTodayKey = (now = Date.now()) => new Date(now + uaeTime_1.UAE_UTC_OFFSET_MINUTES * 60 * 1000).toISOString().slice(0, 10);
const assertRange = ({ from, to }) => {
    if (from && !(0, blockedTimes_1.toDateKey)(from)) {
        throw new appError_1.default('from must be in YYYY-MM-DD format', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    if (to && !(0, blockedTimes_1.toDateKey)(to)) {
        throw new appError_1.default('to must be in YYYY-MM-DD format', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
};
/** The dashboard's view, reasons included. */
const getBlockedTimesUseCase = async (query) => {
    assertRange(query);
    return await (0, blockedTimeRepo_1.fetchBlockedTimesInRange)(query.from, query.to);
};
exports.getBlockedTimesUseCase = getBlockedTimesUseCase;
/**
 * The website's view — which windows are closed, without the studio's
 * internal reason — so a calendar can grey them out before the customer
 * picks one.
 */
const getPublicBlockedTimesUseCase = async (query) => {
    assertRange(query);
    return await (0, blockedTimeRepo_1.fetchBlockedTimesInRange)(query.from, query.to, { includeReason: false });
};
exports.getPublicBlockedTimesUseCase = getPublicBlockedTimesUseCase;
const createBlockedTimeUseCase = async (data) => {
    const date = (0, blockedTimes_1.toDateKey)(data.date);
    const reason = String(data.reason || '').trim();
    const candidate = data.allSlots
        ? { date: date, allSlots: true, reason }
        : {
            date: date,
            allSlots: false,
            startTime: String(data.startTime || '').trim(),
            endTime: String(data.endTime || '').trim(),
            reason,
        };
    const invalid = (0, blockedTimes_1.validateBlockTimes)(candidate);
    if (invalid)
        throw new appError_1.default(invalid, httpStatus_1.HttpStatus.BAD_REQUEST);
    if (!reason)
        throw new appError_1.default('A reason is required', httpStatus_1.HttpStatus.BAD_REQUEST);
    if (candidate.date < uaeTodayKey()) {
        throw new appError_1.default('A past date cannot be blocked', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const clash = (0, blockedTimes_1.findClashingBlock)(await (0, blockedTimeRepo_1.fetchBlockedTimesForDate)(candidate.date), candidate);
    if (clash) {
        throw new appError_1.default(clash.allSlots || candidate.allSlots
            ? 'This date already has an all-slots block'
            : `Overlaps a block already set for ${clash.startTime} – ${clash.endTime}`, httpStatus_1.HttpStatus.CONFLICT);
    }
    return await (0, blockedTimeRepo_1.createBlockedTime)(candidate);
};
exports.createBlockedTimeUseCase = createBlockedTimeUseCase;
const deleteBlockedTimeUseCase = async (id) => {
    if (!(0, objectIdParser_1.ObjectID)(id)) {
        throw new appError_1.default('Invalid blocked time id', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const removed = await (0, blockedTimeRepo_1.deleteBlockedTimeById)(id);
    if (!removed)
        throw new appError_1.default('No blocked time found', httpStatus_1.HttpStatus.NOT_FOUND);
    return true;
};
exports.deleteBlockedTimeUseCase = deleteBlockedTimeUseCase;
/* ---------------- guard used by the booking flows ---------------- */
/**
 * Refuses a booking for a slot the studio has closed. Called by every path
 * that takes a seat — direct booking, cart, pottery checkout and gift
 * redemption — so a block cannot be bypassed by whichever route the customer
 * happens to use.
 */
const assertSlotNotBlocked = async (bookingDate, range) => {
    if (await (0, blockedTimeRepo_1.findBlockForSlot)(bookingDate, range)) {
        throw new appError_1.default(blockedTimes_1.SLOT_BLOCKED_REASON, httpStatus_1.HttpStatus.BAD_REQUEST);
    }
};
exports.assertSlotNotBlocked = assertSlotNotBlocked;
