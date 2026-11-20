"use strict";
/**
 * The studio runs on UAE time (Asia/Dubai). Booking dates are stored as plain
 * "YYYY-MM-DD" strings and slot times as wall-clock strings ("10:30 AM"), so
 * neither carries a zone — they are always meant as UAE local time, while the
 * server clock may be anywhere.
 *
 * These helpers pin that interpretation down: a stored date + slot time is
 * converted to the absolute instant it represents in UAE, which can then be
 * compared against the real current time regardless of where the code runs.
 *
 * The UAE has no daylight saving, so a fixed UTC+4 offset is exact.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUaeSlotInPast = exports.getUaeSlotInstant = exports.UAE_UTC_OFFSET_MINUTES = void 0;
const slotOverlap_1 = require("./slotOverlap");
exports.UAE_UTC_OFFSET_MINUTES = 4 * 60;
const MS_PER_MINUTE = 60 * 1000;
/** Last minute of the day, used when a booking has no usable slot time. */
const END_OF_DAY_MINUTES = 23 * 60 + 59;
/**
 * Extracts the calendar day from a stored booking date.
 *
 * Accepts "2026-01-26" as well as any ISO string starting with that shape
 * (e.g. "2026-01-26T00:00:00.000Z"), since both forms appear in the data.
 */
const parseBookingDate = (bookingDate) => {
    if (!bookingDate)
        return null;
    const raw = bookingDate instanceof Date ? bookingDate.toISOString() : String(bookingDate).trim();
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match)
        return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31)
        return null;
    return { year, month, day };
};
/**
 * The absolute instant (epoch ms) a booking date + slot time falls on, reading
 * both as UAE wall-clock time. Returns null when the date cannot be understood.
 *
 * A missing or unparseable slot time falls back to the end of that day, so a
 * booking is only ever treated as past once the whole day has gone by — the
 * lenient side, since dropping a still-valid item is worse than keeping one.
 */
const getUaeSlotInstant = (bookingDate, slotTime) => {
    const date = parseBookingDate(bookingDate);
    if (!date)
        return null;
    const minutesIntoDay = (0, slotOverlap_1.parseTimeToMinutes)(slotTime) ?? END_OF_DAY_MINUTES;
    return (Date.UTC(date.year, date.month - 1, date.day) +
        (minutesIntoDay - exports.UAE_UTC_OFFSET_MINUTES) * MS_PER_MINUTE);
};
exports.getUaeSlotInstant = getUaeSlotInstant;
/**
 * True when the slot's start time has already passed in UAE.
 *
 * Bookings without a date (gift vouchers, which are scheduled later by the
 * recipient) are never past. An unrecognisable date is also treated as not
 * past so bad data is never silently deleted from a cart.
 */
const isUaeSlotInPast = (bookingDate, slotTime, now = Date.now()) => {
    const instant = (0, exports.getUaeSlotInstant)(bookingDate, slotTime);
    if (instant === null)
        return false;
    return instant <= now;
};
exports.isUaeSlotInPast = isUaeSlotInPast;
