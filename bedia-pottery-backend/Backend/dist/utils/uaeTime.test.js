"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uaeTime_1 = require("./uaeTime");
// 2026-03-10 14:00 UAE == 10:00 UTC
const UAE_2PM_ON_MAR_10 = Date.UTC(2026, 2, 10, 10, 0, 0);
describe('getUaeSlotInstant', () => {
    it('reads a stored date + slot time as UAE wall clock', () => {
        expect((0, uaeTime_1.getUaeSlotInstant)('2026-03-10', '2:00 PM')).toBe(UAE_2PM_ON_MAR_10);
        expect((0, uaeTime_1.getUaeSlotInstant)('2026-03-10', '14:00')).toBe(UAE_2PM_ON_MAR_10);
        expect((0, uaeTime_1.getUaeSlotInstant)('2026-03-10', '10:30 AM')).toBe(Date.UTC(2026, 2, 10, 6, 30));
    });
    it('accepts a full ISO date string', () => {
        expect((0, uaeTime_1.getUaeSlotInstant)('2026-03-10T00:00:00.000Z', '2:00 PM')).toBe(UAE_2PM_ON_MAR_10);
    });
    it('falls back to the end of the day when the slot time is unusable', () => {
        const endOfDay = Date.UTC(2026, 2, 10) + (23 * 60 + 59 - uaeTime_1.UAE_UTC_OFFSET_MINUTES) * 60 * 1000;
        expect((0, uaeTime_1.getUaeSlotInstant)('2026-03-10', null)).toBe(endOfDay);
        expect((0, uaeTime_1.getUaeSlotInstant)('2026-03-10', 'not a time')).toBe(endOfDay);
    });
    it('returns null for a date it cannot read', () => {
        expect((0, uaeTime_1.getUaeSlotInstant)('', '2:00 PM')).toBeNull();
        expect((0, uaeTime_1.getUaeSlotInstant)('10/03/2026', '2:00 PM')).toBeNull();
        expect((0, uaeTime_1.getUaeSlotInstant)(undefined, '2:00 PM')).toBeNull();
    });
});
describe('isUaeSlotInPast', () => {
    it('is past once the slot start time has been reached in UAE', () => {
        expect((0, uaeTime_1.isUaeSlotInPast)('2026-03-10', '2:00 PM', UAE_2PM_ON_MAR_10 - 1)).toBe(false);
        expect((0, uaeTime_1.isUaeSlotInPast)('2026-03-10', '2:00 PM', UAE_2PM_ON_MAR_10)).toBe(true);
        expect((0, uaeTime_1.isUaeSlotInPast)('2026-03-10', '2:00 PM', UAE_2PM_ON_MAR_10 + 1)).toBe(true);
    });
    it('judges against UAE time, not the server clock', () => {
        // 2026-03-10 23:30 UTC is already 2026-03-11 03:30 in the UAE, so the
        // morning slot of the 11th is still ahead while the 10th's has gone.
        const now = Date.UTC(2026, 2, 10, 23, 30);
        expect((0, uaeTime_1.isUaeSlotInPast)('2026-03-11', '10:30 AM', now)).toBe(false);
        expect((0, uaeTime_1.isUaeSlotInPast)('2026-03-10', '10:30 AM', now)).toBe(true);
    });
    it('keeps a same-day slot that has not started yet', () => {
        const now = Date.UTC(2026, 2, 10, 6, 0); // 10:00 AM UAE
        expect((0, uaeTime_1.isUaeSlotInPast)('2026-03-10', '10:30 AM', now)).toBe(false);
        expect((0, uaeTime_1.isUaeSlotInPast)('2026-03-10', '8:00 PM', now)).toBe(false);
    });
    it('treats a booking with no readable date as not past', () => {
        expect((0, uaeTime_1.isUaeSlotInPast)(null, '2:00 PM', UAE_2PM_ON_MAR_10)).toBe(false);
        expect((0, uaeTime_1.isUaeSlotInPast)(undefined, undefined, UAE_2PM_ON_MAR_10)).toBe(false);
    });
});
