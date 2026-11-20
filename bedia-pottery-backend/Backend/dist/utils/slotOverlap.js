"use strict";
/**
 * Studio capacity is shared by every workshop, so a slot is occupied whenever
 * ANY slot running at the same time already has bookings — not only when the
 * two slots begin at the same minute.
 *
 * Regular slots run 1.5h and event slots run 2h, and the two grids are
 * staggered:
 *
 *   Regular: 10:30 AM - 12:00 PM, 02:00 PM - 03:30 PM, 04:00 PM - 05:30 PM,
 *            06:00 PM - 07:30 PM, 08:00 PM - 09:30 PM
 *   Events:  10:30 AM - 12:30 PM, 01:30 PM - 03:30 PM, 04:00 PM - 06:00 PM,
 *            06:30 PM - 08:30 PM
 *
 * So booking the 06:30 PM - 08:30 PM event slot must also count the bookings of
 * 06:00 PM - 07:30 PM (it is still running at 06:30 PM) and 08:00 PM - 09:30 PM
 * (it starts before the event ends at 08:30 PM). Comparing start times alone
 * misses both.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.doSlotsOverlap = exports.parseTimeToMinutes = void 0;
const MINUTES_IN_DAY = 24 * 60;
/**
 * Parses a slot time into minutes since midnight.
 *
 * Accepts every shape a slot time is stored or posted in — "10:30 AM",
 * "6:30 PM", "06:30 P.M.", "10:30a.m." and 24-hour "18:30" / "18:30:00".
 * Returns null when the value cannot be understood.
 */
const parseTimeToMinutes = (time) => {
    if (!time)
        return null;
    // Drop the dots of "P.M." and every space so one pattern covers all variants.
    const normalized = String(time).trim().toLowerCase().replace(/\./g, '').replace(/\s+/g, '');
    const match = normalized.match(/^(\d{1,2}):(\d{2})(?::\d{2})?(am|pm)?$/);
    if (!match)
        return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3];
    if (minutes > 59)
        return null;
    if (meridiem) {
        if (hours < 1 || hours > 12)
            return null;
        if (meridiem === 'pm' && hours !== 12)
            hours += 12;
        if (meridiem === 'am' && hours === 12)
            hours = 0;
    }
    else if (hours > 23) {
        return null;
    }
    return hours * 60 + minutes;
};
exports.parseTimeToMinutes = parseTimeToMinutes;
/**
 * Converts a slot to a [start, end) span in minutes. A slot whose end is not
 * after its start is treated as running past midnight.
 */
const toMinuteSpan = (range) => {
    const start = (0, exports.parseTimeToMinutes)(range.startTime);
    const end = (0, exports.parseTimeToMinutes)(range.endTime);
    if (start === null || end === null)
        return null;
    return { start, end: end <= start ? end + MINUTES_IN_DAY : end };
};
const spansOverlap = (a, b) => a.start < b.end && b.start < a.end;
const normalizeForCompare = (time) => String(time || '')
    .trim()
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, '');
/**
 * True when two slots share any part of the studio's day.
 *
 * Back-to-back slots do not overlap: 04:00 PM - 06:00 PM and 06:00 PM - 07:30 PM
 * only touch at 06:00 PM, so they are counted separately.
 *
 * When either slot has no usable end time we cannot compare spans, so the old
 * start-time rule is used as a fallback rather than matching nothing.
 */
const doSlotsOverlap = (a, b) => {
    const spanA = toMinuteSpan(a);
    const spanB = toMinuteSpan(b);
    if (!spanA || !spanB) {
        const startA = (0, exports.parseTimeToMinutes)(a.startTime);
        const startB = (0, exports.parseTimeToMinutes)(b.startTime);
        if (startA !== null && startB !== null)
            return startA === startB;
        return normalizeForCompare(a.startTime) === normalizeForCompare(b.startTime);
    }
    // Also compare against the neighbouring days so a slot that runs past
    // midnight still lines up with the early slots of the other grid.
    return (spansOverlap(spanA, spanB) ||
        spansOverlap(spanA, { start: spanB.start + MINUTES_IN_DAY, end: spanB.end + MINUTES_IN_DAY }) ||
        spansOverlap(spanA, { start: spanB.start - MINUTES_IN_DAY, end: spanB.end - MINUTES_IN_DAY }));
};
exports.doSlotsOverlap = doSlotsOverlap;
