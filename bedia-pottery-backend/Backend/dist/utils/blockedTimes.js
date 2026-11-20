"use strict";
/**
 * Studio blocks — the rule that decides whether a window the studio closed on
 * the dashboard stops a slot from being sold.
 *
 * A block covers a slot when the two share any minute of the day, using the
 * same overlap rule as studio capacity (see `slotOverlap.ts`): blocking
 * 10:30 AM - 12:00 PM also closes the 10:30 AM - 12:30 PM event slot, while a
 * slot that only touches the block's edge (12:00 PM - 1:30 PM) stays open.
 *
 * Pure, so every availability and booking path can share it and it can be
 * tested without a database.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findClashingBlock = exports.validateBlockTimes = exports.findCoveringBlock = exports.doesBlockCoverSlot = exports.toDateKey = exports.SLOT_BLOCKED_REASON = void 0;
const slotOverlap_1 = require("./slotOverlap");
/**
 * What the website is told when a slot is closed. The admin's own reason
 * ("Private hire", "Instructor unavailable") stays on the dashboard.
 */
exports.SLOT_BLOCKED_REASON = 'This session is not available on the selected date';
/**
 * The calendar day a booking or block date refers to, as "YYYY-MM-DD".
 * Accepts the plain string bookings are stored as and ISO strings starting
 * with it; returns null for anything else.
 */
const toDateKey = (value) => {
    if (!value)
        return null;
    const raw = value instanceof Date ? value.toISOString() : String(value).trim();
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
};
exports.toDateKey = toDateKey;
/** True when `block` closes the slot described by `range` on `date`. */
const doesBlockCoverSlot = (block, date, range) => {
    const dateKey = (0, exports.toDateKey)(date);
    if (!dateKey || (0, exports.toDateKey)(block.date) !== dateKey)
        return false;
    if (block.allSlots)
        return true;
    return (0, slotOverlap_1.doSlotsOverlap)({ startTime: block.startTime, endTime: block.endTime }, range);
};
exports.doesBlockCoverSlot = doesBlockCoverSlot;
/** The first block that closes the slot, or null when it can be sold. */
const findCoveringBlock = (blocks, date, range) => blocks.find((block) => (0, exports.doesBlockCoverSlot)(block, date, range)) || null;
exports.findCoveringBlock = findCoveringBlock;
/**
 * Checks a block before it is saved: a timed block needs a real start before
 * its end, and an all-slots block needs no times at all. Returns the error to
 * show, or null when the block is valid.
 */
const validateBlockTimes = (block) => {
    if (!(0, exports.toDateKey)(block.date))
        return 'Date must be in YYYY-MM-DD format';
    if (block.allSlots)
        return null;
    const start = (0, slotOverlap_1.parseTimeToMinutes)(block.startTime);
    const end = (0, slotOverlap_1.parseTimeToMinutes)(block.endTime);
    if (start === null || end === null) {
        return 'Enter a start and end time, or choose All slots';
    }
    if (end <= start)
        return 'End time must be after the start time';
    return null;
};
exports.validateBlockTimes = validateBlockTimes;
/**
 * The existing block a new one would collide with, if any. Two blocks on the
 * same day clash when either closes the whole day or their windows overlap —
 * a duplicate would only make the later removal of one of them misleading.
 */
const findClashingBlock = (existing, candidate) => existing.find((block) => {
    if ((0, exports.toDateKey)(block.date) !== (0, exports.toDateKey)(candidate.date))
        return false;
    if (block.allSlots || candidate.allSlots)
        return true;
    return (0, slotOverlap_1.doSlotsOverlap)({ startTime: block.startTime, endTime: block.endTime }, { startTime: candidate.startTime, endTime: candidate.endTime });
}) || null;
exports.findClashingBlock = findClashingBlock;
