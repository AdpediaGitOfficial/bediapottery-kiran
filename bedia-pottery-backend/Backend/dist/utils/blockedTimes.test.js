"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blockedTimes_1 = require("./blockedTimes");
const DATE = '2026-10-05';
const block = (startTime, endTime, date = DATE) => ({
    date,
    startTime,
    endTime,
    reason: 'Private hire',
});
describe('toDateKey', () => {
    it('reads both stored date shapes as the same day', () => {
        expect((0, blockedTimes_1.toDateKey)('2026-10-05')).toBe('2026-10-05');
        expect((0, blockedTimes_1.toDateKey)('2026-10-05T00:00:00.000Z')).toBe('2026-10-05');
    });
    it('rejects anything that is not a date', () => {
        expect((0, blockedTimes_1.toDateKey)('')).toBeNull();
        expect((0, blockedTimes_1.toDateKey)('05/10/2026')).toBeNull();
        expect((0, blockedTimes_1.toDateKey)(null)).toBeNull();
    });
});
describe('doesBlockCoverSlot', () => {
    it('closes the regular slot it was made from', () => {
        expect((0, blockedTimes_1.doesBlockCoverSlot)(block('10:30 AM', '12:00 PM'), DATE, {
            startTime: '10:30 AM',
            endTime: '12:00 PM',
        })).toBe(true);
    });
    it('also closes an event slot that shares the room with it', () => {
        // 10:30 - 12:30 event is still running during the 10:30 - 12:00 block.
        expect((0, blockedTimes_1.doesBlockCoverSlot)(block('10:30 AM', '12:00 PM'), DATE, {
            startTime: '10:30 AM',
            endTime: '12:30 PM',
        })).toBe(true);
        // 1:30 - 3:30 event overlaps the 2:00 - 3:30 regular block.
        expect((0, blockedTimes_1.doesBlockCoverSlot)(block('2:00 PM', '3:30 PM'), DATE, {
            startTime: '1:30 PM',
            endTime: '3:30 PM',
        })).toBe(true);
    });
    it('leaves a slot that only touches the edge of the block open', () => {
        expect((0, blockedTimes_1.doesBlockCoverSlot)(block('4:00 PM', '5:30 PM'), DATE, {
            startTime: '5:30 PM',
            endTime: '7:00 PM',
        })).toBe(false);
    });
    it('only applies on its own date', () => {
        expect((0, blockedTimes_1.doesBlockCoverSlot)(block('10:30 AM', '12:00 PM'), '2026-10-06', {
            startTime: '10:30 AM',
            endTime: '12:00 PM',
        })).toBe(false);
    });
    it('matches a booking date stored as an ISO string', () => {
        expect((0, blockedTimes_1.doesBlockCoverSlot)(block('6:00 PM', '7:30 PM'), '2026-10-05T00:00:00.000Z', {
            startTime: '6:00 PM',
            endTime: '7:30 PM',
        })).toBe(true);
    });
    it('closes every slot of the day when it is an all-slots block', () => {
        const allDay = { date: DATE, allSlots: true, reason: 'Studio closed' };
        ['10:30 AM', '2:00 PM', '8:00 PM'].forEach((startTime) => expect((0, blockedTimes_1.doesBlockCoverSlot)(allDay, DATE, { startTime, endTime: '9:30 PM' })).toBe(true));
    });
});
describe('findCoveringBlock', () => {
    it('returns the block that closes the slot, or null', () => {
        const blocks = [block('10:30 AM', '12:00 PM'), block('6:00 PM', '7:30 PM')];
        expect((0, blockedTimes_1.findCoveringBlock)(blocks, DATE, { startTime: '6:30 PM', endTime: '8:30 PM' })).toBe(blocks[1]);
        expect((0, blockedTimes_1.findCoveringBlock)(blocks, DATE, { startTime: '2:00 PM', endTime: '3:30 PM' })).toBeNull();
    });
});
describe('validateBlockTimes', () => {
    it('accepts a timed block and an all-slots block', () => {
        expect((0, blockedTimes_1.validateBlockTimes)(block('10:30 AM', '12:00 PM'))).toBeNull();
        expect((0, blockedTimes_1.validateBlockTimes)({ date: DATE, allSlots: true })).toBeNull();
    });
    it('refuses a window that ends before it starts, or has no times', () => {
        expect((0, blockedTimes_1.validateBlockTimes)(block('3:30 PM', '2:00 PM'))).toMatch(/after the start/);
        expect((0, blockedTimes_1.validateBlockTimes)({ date: DATE })).toMatch(/start and end/);
    });
    it('refuses a malformed date', () => {
        expect((0, blockedTimes_1.validateBlockTimes)(block('10:30 AM', '12:00 PM', '5 Oct'))).toMatch(/YYYY-MM-DD/);
    });
});
describe('findClashingBlock', () => {
    const existing = [block('10:30 AM', '12:00 PM')];
    it('flags an overlapping window on the same day', () => {
        expect((0, blockedTimes_1.findClashingBlock)(existing, block('11:00 AM', '1:00 PM'))).toBe(existing[0]);
    });
    it('allows the next slot along and other days', () => {
        expect((0, blockedTimes_1.findClashingBlock)(existing, block('2:00 PM', '3:30 PM'))).toBeNull();
        expect((0, blockedTimes_1.findClashingBlock)(existing, block('10:30 AM', '12:00 PM', '2026-10-06'))).toBeNull();
    });
    it('treats an all-slots block as clashing with anything that day', () => {
        expect((0, blockedTimes_1.findClashingBlock)(existing, { date: DATE, allSlots: true })).toBe(existing[0]);
        expect((0, blockedTimes_1.findClashingBlock)([{ date: DATE, allSlots: true }], block('8:00 PM', '9:30 PM'))).not.toBeNull();
    });
});
