"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slotCapacity_1 = require("./slotCapacity");
describe('isEventsBooking', () => {
    it('recognises the events type however it is cased or padded', () => {
        expect((0, slotCapacity_1.isEventsBooking)('events')).toBe(true);
        expect((0, slotCapacity_1.isEventsBooking)('Events')).toBe(true);
        expect((0, slotCapacity_1.isEventsBooking)(' EVENTS ')).toBe(true);
    });
    it('is false for every other booking type', () => {
        expect((0, slotCapacity_1.isEventsBooking)('normal')).toBe(false);
        expect((0, slotCapacity_1.isEventsBooking)('pottery')).toBe(false);
        expect((0, slotCapacity_1.isEventsBooking)('gift')).toBe(false);
        expect((0, slotCapacity_1.isEventsBooking)(undefined)).toBe(false);
        expect((0, slotCapacity_1.isEventsBooking)(null)).toBe(false);
    });
});
describe('resolveSlotCapacity', () => {
    it('gives an events booking 25 only when the slot is empty', () => {
        expect((0, slotCapacity_1.resolveSlotCapacity)('events', 0)).toBe(slotCapacity_1.EXCLUSIVE_EVENT_SLOT_CAPACITY);
        expect((0, slotCapacity_1.resolveSlotCapacity)('events', 1)).toBe(slotCapacity_1.STANDARD_SLOT_CAPACITY);
        expect((0, slotCapacity_1.resolveSlotCapacity)('events', 8)).toBe(slotCapacity_1.STANDARD_SLOT_CAPACITY);
    });
    it('ignores a configured slot capacity for events, which follow the studio rule', () => {
        expect((0, slotCapacity_1.resolveSlotCapacity)('events', 0, 25)).toBe(slotCapacity_1.EXCLUSIVE_EVENT_SLOT_CAPACITY);
        // A slot configured at 25 must not hand a non-exclusive event 25 seats.
        expect((0, slotCapacity_1.resolveSlotCapacity)('events', 2, 25)).toBe(slotCapacity_1.STANDARD_SLOT_CAPACITY);
    });
    it('never grants the larger allowance to a non-events booking', () => {
        expect((0, slotCapacity_1.resolveSlotCapacity)('normal', 0)).toBe(slotCapacity_1.STANDARD_SLOT_CAPACITY);
        expect((0, slotCapacity_1.resolveSlotCapacity)('pottery', 0)).toBe(slotCapacity_1.STANDARD_SLOT_CAPACITY);
        expect((0, slotCapacity_1.resolveSlotCapacity)(undefined, 0)).toBe(slotCapacity_1.STANDARD_SLOT_CAPACITY);
    });
    it('honours the configured capacity of a slot for ordinary bookings', () => {
        expect((0, slotCapacity_1.resolveSlotCapacity)('normal', 0, 8)).toBe(8);
        expect((0, slotCapacity_1.resolveSlotCapacity)('normal', 3, 15)).toBe(15);
    });
    it('falls back to the standard capacity when the slot has none set', () => {
        expect((0, slotCapacity_1.resolveSlotCapacity)('normal', 0, 0)).toBe(slotCapacity_1.STANDARD_SLOT_CAPACITY);
        expect((0, slotCapacity_1.resolveSlotCapacity)('normal', 0, null)).toBe(slotCapacity_1.STANDARD_SLOT_CAPACITY);
        expect((0, slotCapacity_1.resolveSlotCapacity)('normal', 0, NaN)).toBe(slotCapacity_1.STANDARD_SLOT_CAPACITY);
    });
});
describe('isEventBlockedByExistingBookings', () => {
    it('flags an oversized event whose slot is already shared', () => {
        expect((0, slotCapacity_1.isEventBlockedByExistingBookings)('events', 2, 20)).toBe(true);
    });
    it('leaves an event that still fits the shared room alone', () => {
        expect((0, slotCapacity_1.isEventBlockedByExistingBookings)('events', 2, 10)).toBe(false);
        expect((0, slotCapacity_1.isEventBlockedByExistingBookings)('events', 2, slotCapacity_1.STANDARD_SLOT_CAPACITY)).toBe(false);
    });
    it('does not apply to an exclusive event or to other booking types', () => {
        expect((0, slotCapacity_1.isEventBlockedByExistingBookings)('events', 0, 20)).toBe(false);
        expect((0, slotCapacity_1.isEventBlockedByExistingBookings)('normal', 5, 20)).toBe(false);
    });
});
describe('the studio rule end to end', () => {
    const seatsLeft = (bookingType, bookedCount) => Math.max(0, (0, slotCapacity_1.resolveSlotCapacity)(bookingType, bookedCount) - bookedCount);
    it('lets a 25-guest event have an untouched slot', () => {
        expect(seatsLeft('events', 0)).toBe(25);
    });
    it('drops an event to the shared room once anyone else books', () => {
        // One guest booked: the event may bring 11 more, not 24.
        expect(seatsLeft('events', 1)).toBe(11);
    });
    it('leaves no room once an exclusive event has taken the slot', () => {
        // A 20-person event is confirmed; nothing else fits that slot.
        expect(seatsLeft('normal', 20)).toBe(0);
        expect(seatsLeft('events', 20)).toBe(0);
    });
});
