"use strict";
/**
 * The three public availability endpoints must report a slot the studio has
 * closed on the dashboard's Block Slots page as unavailable:
 *
 *   POST /workshop/availability         -> fetchWorkshopAvailability
 *   POST /workshop/pottery-availability -> fetchPotteryWorkshopAvailability
 *   POST /workshop/pottery-capacity     -> fetchPotteryWorkshopCapacity
 *
 * The models are stubbed so the real repo logic runs without a database.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const SLOT_ID = '6a8d776872270315b88c5dde';
const WORKSHOP_ID = '6a8d776872270315b88c5000';
const DATE = '2026-10-05';
const slot1 = {
    _id: { toString: () => SLOT_ID },
    label: 'slot 1',
    startTime: '10:30 AM',
    endTime: '12:00 PM',
    capacity: 12,
};
const workshop = {
    _id: WORKSHOP_ID,
    defaultSlots: [slot1],
    nonAvailabilityDates: [],
    nonAvailabilityDays: [],
};
let blocks = [];
jest.mock('../models/workshopModel', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(async () => workshop),
        find: jest.fn(async () => [workshop]),
    },
}));
jest.mock('../models/workshopBookingModel', () => ({
    __esModule: true,
    default: { aggregate: jest.fn(async () => []) },
}));
jest.mock('../../studio/models/blockedTimeModel', () => ({
    __esModule: true,
    default: {
        find: jest.fn((query) => ({
            lean: async () => blocks.filter((block) => block.date === query.date),
        })),
    },
}));
jest.mock('../models/workshopOrders', () => ({ __esModule: true, default: {} }));
jest.mock('../models/cartModel', () => ({ __esModule: true, default: {} }));
jest.mock('../../category/models/categoryModel', () => ({ __esModule: true, default: {} }));
const workshopRepo_1 = require("./workshopRepo");
const blockedTimes_1 = require("../../utils/blockedTimes");
const availabilityRequest = {
    workshopId: WORKSHOP_ID,
    bookingDate: DATE,
    slotId: SLOT_ID,
    guests: 2,
};
const capacityRequest = { bookingDate: DATE, startTime: '10:30 AM', endTime: '12:00 PM' };
beforeEach(() => {
    blocks = [];
});
describe.each([
    ['a block on exactly that slot', { date: DATE, startTime: '10:30 AM', endTime: '12:00 PM' }],
    ['a block that overlaps part of it', { date: DATE, startTime: '11:00 AM', endTime: '1:00 PM' }],
    ['an all-slots block', { date: DATE, allSlots: true }],
])('with %s', (_label, block) => {
    beforeEach(() => {
        blocks = [{ reason: 'Private hire', ...block }];
    });
    it('/availability reports the slot unavailable', async () => {
        await expect((0, workshopRepo_1.fetchWorkshopAvailability)(availabilityRequest)).resolves.toEqual({
            available: false,
            isBlocked: true,
            reason: blockedTimes_1.SLOT_BLOCKED_REASON,
        });
    });
    it('/pottery-availability reports the slot unavailable with no seats', async () => {
        await expect((0, workshopRepo_1.fetchPotteryWorkshopAvailability)(availabilityRequest)).resolves.toMatchObject({
            available: false,
            isBlocked: true,
            reason: blockedTimes_1.SLOT_BLOCKED_REASON,
            remainingCapacity: 0,
        });
    });
    it('/pottery-capacity reports no remaining capacity', async () => {
        await expect((0, workshopRepo_1.fetchPotteryWorkshopCapacity)(capacityRequest)).resolves.toMatchObject({
            isBlocked: true,
            reason: blockedTimes_1.SLOT_BLOCKED_REASON,
            remainingCapacity: 0,
        });
    });
});
describe('without a covering block', () => {
    it.each([
        ['nothing blocked', []],
        ['a block on another date', [{ date: '2026-10-06', allSlots: true, reason: 'x' }]],
        [
            'a block that only touches the slot end',
            [{ date: DATE, startTime: '12:00 PM', endTime: '1:30 PM', reason: 'x' }],
        ],
    ])('all three endpoints stay open with %s', async (_label, list) => {
        blocks = list;
        await expect((0, workshopRepo_1.fetchWorkshopAvailability)(availabilityRequest)).resolves.toMatchObject({
            available: true,
            isBlocked: false,
        });
        await expect((0, workshopRepo_1.fetchPotteryWorkshopAvailability)(availabilityRequest)).resolves.toMatchObject({
            available: true,
            isBlocked: false,
            remainingCapacity: 12,
        });
        await expect((0, workshopRepo_1.fetchPotteryWorkshopCapacity)(capacityRequest)).resolves.toMatchObject({
            isBlocked: false,
            remainingCapacity: 12,
        });
    });
});
