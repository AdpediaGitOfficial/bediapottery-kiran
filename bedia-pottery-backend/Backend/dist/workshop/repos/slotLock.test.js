"use strict";
/**
 * One booking owns a time window. Once any booking — a birthday party, a corporate
 * event, an ordinary workshop, a redeemed gift — is confirmed, or is being paid
 * for within its seat hold, nobody else may book that slot (or one overlapping
 * it), however few guests it has, and the website must show it as unavailable.
 *
 * The models are stubbed; the aggregate answers with whatever the test sets.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mockSlotId = '6a8d776872270315b88c5dde';
const mockWorkshopId = '6a8d776872270315b88c5000';
const mockSlot = {
    _id: { toString: () => mockSlotId, equals: (other) => String(other) === mockSlotId },
    label: 'slot 1',
    startTime: '10:30 AM',
    endTime: '12:00 PM',
    capacity: 12,
};
const mockWorkshop = {
    _id: mockWorkshopId,
    defaultSlots: [mockSlot],
    nonAvailabilityDates: [],
    nonAvailabilityDays: [],
};
jest.mock('../models/workshopModel', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(async () => mockWorkshop),
        find: jest.fn(async () => [mockWorkshop]),
    },
}));
jest.mock('../models/workshopBookingModel', () => ({
    __esModule: true,
    default: { aggregate: jest.fn(async () => []) },
}));
jest.mock('../models/workshopOrders', () => ({ __esModule: true, default: {} }));
jest.mock('../models/cartModel', () => ({ __esModule: true, default: {} }));
jest.mock('../../category/models/categoryModel', () => ({ __esModule: true, default: {} }));
jest.mock('../../studio/repos/blockedTimeRepo', () => ({
    findBlockForSlot: jest.fn(async () => null),
}));
const workshopRepo_1 = require("./workshopRepo");
const { SLOT_UNAVAILABLE_REASON } = require("../../utils/slotCapacity");
const bookingModel = require('../models/workshopBookingModel').default;
const DATE = '2099-03-02';
/** What the database reports for the slot: people holding seats, and how many bookings hold them. */
const slotHolds = (totalPeople, bookingCount) => bookingModel.aggregate.mockResolvedValue([{ totalPeople, bookingCount }]);
const request = (overrides = {}) => ({
    workshopId: mockWorkshopId,
    bookingDate: DATE,
    slotId: mockSlotId,
    guests: 2,
    bookingType: 'pottery',
    ...overrides,
});
beforeEach(() => {
    jest.clearAllMocks();
    bookingModel.aggregate.mockResolvedValue([]);
});
describe('any booking holding the slot', () => {
    it('counts the slot as full for anyone booking it, even for a small booking', async () => {
        slotHolds(8, 1);
        const booked = await (0, workshopRepo_1.getSlotBookedCount)(DATE, mockSlot.startTime, mockSlot.endTime);
        // 8 guests would leave 4 of the 12 seats; the booking owns the whole window.
        expect(booked).toBeGreaterThanOrEqual(25);
    });
    it('a booking of only two people closes the slot just the same', async () => {
        slotHolds(2, 1);
        const booked = await (0, workshopRepo_1.getSlotBookedCount)(DATE, mockSlot.startTime, mockSlot.endTime);
        expect(booked).toBeGreaterThanOrEqual(25);
    });
    it('keeps a large booking\'s own head count when it is already above that', async () => {
        slotHolds(30, 1);
        await expect((0, workshopRepo_1.getSlotBookedCount)(DATE, mockSlot.startTime, mockSlot.endTime)).resolves.toBe(30);
    });
    it('reports an empty slot as empty', async () => {
        await expect((0, workshopRepo_1.getSlotBookedCount)(DATE, mockSlot.startTime, mockSlot.endTime)).resolves.toBe(0);
    });
    it('the website availability check shows the slot as unavailable', async () => {
        slotHolds(2, 1);
        const result = await (0, workshopRepo_1.fetchPotteryWorkshopAvailability)(request());
        expect(result.available).toBe(false);
        expect(result.reason).toBe(SLOT_UNAVAILABLE_REASON);
        expect(result.remainingCapacity).toBe(0);
    });
    it.each(['pottery', 'normal', 'gift', 'events'])('a %s booking cannot take a slot that is already booked', async (bookingType) => {
        slotHolds(2, 1);
        const result = await (0, workshopRepo_1.fetchPotteryWorkshopAvailability)(request({ bookingType, guests: 1 }));
        expect(result.available).toBe(false);
    });
    it('an event cannot book the slot either', async () => {
        slotHolds(8, 1);
        const result = await (0, workshopRepo_1.fetchPotteryWorkshopAvailability)(request({ bookingType: 'events', guests: 12 }));
        expect(result.available).toBe(false);
    });
    it('the slot-capacity lookup shows no seats left', async () => {
        slotHolds(8, 1);
        const result = await (0, workshopRepo_1.fetchPotteryWorkshopCapacity)({
            bookingDate: DATE,
            startTime: mockSlot.startTime,
            endTime: mockSlot.endTime,
            bookingType: 'pottery',
        });
        expect(result.remainingCapacity).toBe(0);
    });
    it('the older availability check agrees', async () => {
        slotHolds(8, 1);
        const result = await (0, workshopRepo_1.fetchWorkshopAvailability)({
            workshopId: mockWorkshopId,
            bookingDate: DATE,
            slotId: mockSlotId,
            guests: 2,
        });
        expect(result.available).toBe(false);
    });
});
describe('a slot nobody holds', () => {
    it('is open, with all the studio\'s seats free', async () => {
        const result = await (0, workshopRepo_1.fetchPotteryWorkshopAvailability)(request({ guests: 4 }));
        expect(result.available).toBe(true);
        expect(result.remainingCapacity).toBe(12);
    });
    it('still refuses a single booking larger than the studio seats', async () => {
        const result = await (0, workshopRepo_1.fetchPotteryWorkshopAvailability)(request({ guests: 13 }));
        expect(result.available).toBe(false);
    });
});
describe('the check made right after a booking is written', () => {
    it('asks for the people held and for the bookings created before this one', async () => {
        const bookingId = '6a8d776872270315b88c5f10';
        bookingModel.aggregate.mockResolvedValue([{ totalPeople: 20, priorBookings: 1 }]);
        const result = await (0, workshopRepo_1.getSeatsHeldUpToBookingRepo)(DATE, mockSlot.startTime, mockSlot.endTime, bookingId);
        expect(result).toEqual({ people: 20, priorBookings: 1 });
        const group = bookingModel.aggregate.mock.calls[0][0].find((stage) => stage.$group).$group;
        expect(group.priorBookings).toBeDefined();
    });
    it('counts bookings of any type, not only events', async () => {
        await (0, workshopRepo_1.getSeatsHeldUpToBookingRepo)(DATE, mockSlot.startTime, mockSlot.endTime, '6a8d776872270315b88c5f10');
        const group = bookingModel.aggregate.mock.calls[0][0].find((stage) => stage.$group).$group;
        expect(JSON.stringify(group.priorBookings)).not.toContain('events');
    });
    it('reports nothing held when the slot is empty', async () => {
        const result = await (0, workshopRepo_1.getSeatsHeldUpToBookingRepo)(DATE, mockSlot.startTime, mockSlot.endTime, 'x');
        expect(result).toEqual({ people: 0, priorBookings: 0 });
    });
});
