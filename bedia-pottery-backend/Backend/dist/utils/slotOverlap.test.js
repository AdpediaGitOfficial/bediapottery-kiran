"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slotOverlap_1 = require("./slotOverlap");
const REGULAR_SLOTS = [
    { startTime: '10:30 AM', endTime: '12:00 PM' },
    { startTime: '2:00 PM', endTime: '3:30 PM' },
    { startTime: '4:00 PM', endTime: '5:30 PM' },
    { startTime: '6:00 PM', endTime: '7:30 PM' },
    { startTime: '8:00 PM', endTime: '9:30 PM' },
];
const EVENT_SLOTS = [
    { startTime: '10:30 AM', endTime: '12:30 PM' },
    { startTime: '1:30 PM', endTime: '3:30 PM' },
    { startTime: '4:00 PM', endTime: '6:00 PM' },
    { startTime: '6:30 PM', endTime: '8:30 PM' },
];
const overlappingLabels = (target) => [...REGULAR_SLOTS, ...EVENT_SLOTS]
    .filter((slot) => (0, slotOverlap_1.doSlotsOverlap)(slot, target))
    .map((slot) => `${slot.startTime} - ${slot.endTime}`);
describe('parseTimeToMinutes', () => {
    it('parses the 12-hour format slots are stored in', () => {
        expect((0, slotOverlap_1.parseTimeToMinutes)('10:30 AM')).toBe(630);
        expect((0, slotOverlap_1.parseTimeToMinutes)('6:30 PM')).toBe(1110);
        expect((0, slotOverlap_1.parseTimeToMinutes)('12:00 PM')).toBe(720);
        expect((0, slotOverlap_1.parseTimeToMinutes)('12:15 AM')).toBe(15);
    });
    it('accepts dotted, padded and unspaced variants', () => {
        expect((0, slotOverlap_1.parseTimeToMinutes)('06:30 P.M.')).toBe(1110);
        expect((0, slotOverlap_1.parseTimeToMinutes)('10:30a.m.')).toBe(630);
        expect((0, slotOverlap_1.parseTimeToMinutes)('  8:00   pm  ')).toBe(1200);
    });
    it('accepts 24-hour times', () => {
        expect((0, slotOverlap_1.parseTimeToMinutes)('18:30')).toBe(1110);
        expect((0, slotOverlap_1.parseTimeToMinutes)('09:30:00')).toBe(570);
    });
    it('returns null for missing or unreadable values', () => {
        expect((0, slotOverlap_1.parseTimeToMinutes)(undefined)).toBeNull();
        expect((0, slotOverlap_1.parseTimeToMinutes)('')).toBeNull();
        expect((0, slotOverlap_1.parseTimeToMinutes)('evening')).toBeNull();
        expect((0, slotOverlap_1.parseTimeToMinutes)('13:00 PM')).toBeNull();
        expect((0, slotOverlap_1.parseTimeToMinutes)('10:75 AM')).toBeNull();
    });
});
describe('doSlotsOverlap', () => {
    it('matches the event slot against itself and both regular slots it runs into', () => {
        expect(overlappingLabels({ startTime: '6:30 PM', endTime: '8:30 PM' })).toEqual([
            '6:00 PM - 7:30 PM',
            '8:00 PM - 9:30 PM',
            '6:30 PM - 8:30 PM',
        ]);
    });
    it('treats back-to-back slots as separate', () => {
        // The event slot ends exactly when the regular slot begins.
        expect((0, slotOverlap_1.doSlotsOverlap)({ startTime: '4:00 PM', endTime: '6:00 PM' }, { startTime: '6:00 PM', endTime: '7:30 PM' })).toBe(false);
    });
    it('matches slots that share only a partial window', () => {
        expect((0, slotOverlap_1.doSlotsOverlap)({ startTime: '1:30 PM', endTime: '3:30 PM' }, { startTime: '2:00 PM', endTime: '3:30 PM' })).toBe(true);
    });
    it('matches a slot fully contained in another', () => {
        expect((0, slotOverlap_1.doSlotsOverlap)({ startTime: '10:30 AM', endTime: '12:30 PM' }, { startTime: '10:30 AM', endTime: '12:00 PM' })).toBe(true);
    });
    it('does not match slots on opposite ends of the day', () => {
        expect((0, slotOverlap_1.doSlotsOverlap)({ startTime: '10:30 AM', endTime: '12:00 PM' }, { startTime: '8:00 PM', endTime: '9:30 PM' })).toBe(false);
    });
    it('is unaffected by the way a time is written', () => {
        expect((0, slotOverlap_1.doSlotsOverlap)({ startTime: '06:00 P.M.', endTime: '07:30 P.M.' }, { startTime: '18:30', endTime: '20:30' })).toBe(true);
    });
    it('matches every regular slot an event slot spans', () => {
        expect(overlappingLabels({ startTime: '10:30 AM', endTime: '12:30 PM' })).toEqual([
            '10:30 AM - 12:00 PM',
            '10:30 AM - 12:30 PM',
        ]);
        expect(overlappingLabels({ startTime: '1:30 PM', endTime: '3:30 PM' })).toEqual([
            '2:00 PM - 3:30 PM',
            '1:30 PM - 3:30 PM',
        ]);
        expect(overlappingLabels({ startTime: '4:00 PM', endTime: '6:00 PM' })).toEqual([
            '4:00 PM - 5:30 PM',
            '4:00 PM - 6:00 PM',
        ]);
    });
    it('handles a slot that runs past midnight', () => {
        expect((0, slotOverlap_1.doSlotsOverlap)({ startTime: '11:00 PM', endTime: '1:00 AM' }, { startTime: '12:30 AM', endTime: '2:00 AM' })).toBe(true);
    });
    it('falls back to comparing start times when an end time is unusable', () => {
        expect((0, slotOverlap_1.doSlotsOverlap)({ startTime: '6:00 PM', endTime: '' }, { startTime: '18:00', endTime: '7:30 PM' })).toBe(true);
        expect((0, slotOverlap_1.doSlotsOverlap)({ startTime: '6:00 PM', endTime: '' }, { startTime: '6:30 PM', endTime: '8:30 PM' })).toBe(false);
    });
});
