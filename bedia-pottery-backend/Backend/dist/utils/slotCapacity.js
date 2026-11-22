"use strict";
/**
 * The studio is one shared room, so a slot's capacity is a studio-wide fact
 * rather than a per-workshop one (see `slotOverlap.ts` for how overlapping
 * slots are gathered).
 *
 * Normally that room seats 12. An `events` booking may take 25 — but only by
 * taking the room for itself: the larger allowance is for a private group, so
 * it applies only while nothing else is booked in that day's overlapping slots.
 * The moment another confirmed booking shares the slot, an event is just
 * another guest group and the ordinary 12 applies to everyone in it.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_SLOT_NOT_EXCLUSIVE_REASON = exports.isEventBlockedByExistingBookings = exports.resolveSlotCapacity = exports.isEventsBooking = exports.EXCLUSIVE_EVENT_SLOT_CAPACITY = exports.STANDARD_SLOT_CAPACITY = void 0;
exports.STANDARD_SLOT_CAPACITY = 12;
exports.EXCLUSIVE_EVENT_SLOT_CAPACITY = 25;
const isEventsBooking = (bookingType) => String(bookingType ?? '')
    .trim()
    .toLowerCase() === 'events';
exports.isEventsBooking = isEventsBooking;
/**
 * Seats available for this slot, given what is already booked in it.
 *
 * `standardCapacity` lets a caller pass the slot's own configured capacity for
 * ordinary bookings; it is ignored for events, which are governed by the
 * studio-wide 25/12 rule above.
 */
const resolveSlotCapacity = (bookingType, bookedCount, standardCapacity) => {
    if ((0, exports.isEventsBooking)(bookingType)) {
        return bookedCount > 0 ? exports.STANDARD_SLOT_CAPACITY : exports.EXCLUSIVE_EVENT_SLOT_CAPACITY;
    }
    const configured = Number(standardCapacity);
    return Number.isFinite(configured) && configured > 0 ? configured : exports.STANDARD_SLOT_CAPACITY;
};
exports.resolveSlotCapacity = resolveSlotCapacity;
/**
 * True when an events booking is asking for more than the shared room holds
 * because someone else already has part of the slot. Used to explain the
 * refusal, which otherwise just reads as a plain seat shortage.
 */
const isEventBlockedByExistingBookings = (bookingType, bookedCount, guests) => (0, exports.isEventsBooking)(bookingType) && bookedCount > 0 && guests > exports.STANDARD_SLOT_CAPACITY;
exports.isEventBlockedByExistingBookings = isEventBlockedByExistingBookings;
/**
 * One booking owns a time window: once any booking is confirmed (or being paid
 * for, within its seat hold) for a date and slot, that slot — and every slot
 * overlapping it, in any workshop — is unavailable to everyone else.
 */
exports.SLOT_UNAVAILABLE_REASON = 'This time slot is unavailable.';
exports.EVENT_SLOT_NOT_EXCLUSIVE_REASON = `This slot already has another booking, so an event is limited to ${exports.STANDARD_SLOT_CAPACITY} guests. Bookings of up to ${exports.EXCLUSIVE_EVENT_SLOT_CAPACITY} need the slot to be free.`;
