"use strict";
/**
 * Duplicate-booking protection on POST /workshop/pottery-booking.
 *
 * What these guard against:
 *   - the same cart submitted twice (double click, Back from Stripe, a retry)
 *     creating a second order, second bookings and a second Stripe session;
 *   - two checkouts racing for the last seats of a slot and both succeeding;
 *   - a failed checkout leaving pending bookings behind that keep holding seats.
 *
 * The repo and Stripe are replaced with an in-memory fake, so the real use case
 * runs without a database. The fake refuses a second order for the same
 * checkoutKey with the same duplicate-key error MongoDB's unique index raises.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mockStore = {
    orders: [],
    bookings: [],
    heldBeforeNewBooking: 0,
    priorBookings: 0,
    nextId: 1,
};
const mockId = () => String(mockStore.nextId++).padStart(24, '0');
jest.mock('../../careers/repos/careerRepo', () => ({}));
jest.mock('../../careers/repos/jobApplicationRepo', () => ({}));
jest.mock('../../category/repos/categoryRepo', () => ({}));
jest.mock('../../services/workshopBookingMailService', () => ({}));
jest.mock('./potteryTrackingUseCase', () => ({}));
jest.mock('../../studio/useCases/blockedTimeUseCase', () => ({
    assertSlotNotBlocked: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../config/stripe', () => ({
    stripe: {
        checkout: {
            sessions: {
                create: jest.fn(),
                expire: jest.fn().mockResolvedValue({}),
            },
        },
    },
}));
jest.mock('../repos/workshopRepo', () => ({
    seatHoldExpiry: (from = Date.now()) => new Date(from + 30 * 60 * 1000),
    getWorkshopByIdRepo: jest.fn(async () => mockStore.workshop),
    getSlotBookedCount: jest.fn(async () => mockStore.heldBeforeNewBooking),
    createWorkshopBookingRepo: jest.fn(async (data) => {
        const booking = { _id: mockId(), isDeleted: false, ...data };
        mockStore.bookings.push(booking);
        return booking;
    }),
    createWorkshopOrderRepo: jest.fn(async (data) => {
        if (data.checkoutKey && mockStore.orders.some((o) => o.checkoutKey === data.checkoutKey)) {
            const error = new Error('E11000 duplicate key');
            error.code = 11000;
            error.keyPattern = { checkoutKey: 1 };
            throw error;
        }
        const order = { _id: mockId(), isDeleted: false, ...data };
        mockStore.orders.push(order);
        return order;
    }),
    findOrderByCheckoutKeyRepo: jest.fn(async (key) => mockStore.orders.find((o) => o.checkoutKey === key && !o.isDeleted) || null),
    releaseCheckoutKeyRepo: jest.fn(async (orderId) => {
        const order = mockStore.orders.find((o) => o._id === orderId);
        if (order)
            delete order.checkoutKey;
    }),
    saveOrderStripeSessionRepo: jest.fn(async (orderId, session) => {
        const order = mockStore.orders.find((o) => o._id === orderId);
        order.stripeSessionId = session.id;
        order.stripeSessionUrl = session.url;
        order.holdExpiresAt = session.holdExpiresAt;
    }),
    updateBookingsCustomerRepo: jest.fn(async (ids, customer) => {
        mockStore.bookings.filter((b) => ids.includes(b._id)).forEach((b) => (b.customer = customer));
    }),
    discardPendingCheckoutRepo: jest.fn(async ({ bookingIds = [], orderId }) => {
        mockStore.bookings.filter((b) => bookingIds.includes(b._id)).forEach((b) => (b.isDeleted = true));
        const order = mockStore.orders.find((o) => o._id === orderId);
        if (order) {
            order.isDeleted = true;
            delete order.checkoutKey;
        }
    }),
    getSeatsHeldUpToBookingRepo: jest.fn(async (date, start, end, bookingId) => {
        const own = mockStore.bookings.find((b) => b._id === bookingId);
        return {
            people: mockStore.heldBeforeNewBooking + own.totalPeople,
            priorBookings: mockStore.priorBookings,
        };
    }),
}));
const workshopUseCase_1 = require("./workshopUseCase");
const { SLOT_UNAVAILABLE_REASON } = require("../../utils/slotCapacity");
const stripe_1 = require("../../config/stripe");
const WORKSHOP_ID = '6a8d776872270315b88c5000';
const SLOT_ID = '6a8d776872270315b88c5dde';
const OPTION_ID = '6a8d776872270315b88c5e01';
const KEY = 'b6c1f0de-3a52-4b9e-9f43-1d2c3e4f5a6b';
const idOf = (value) => ({ toString: () => value, equals: (other) => String(other) === value });
const buildWorkshop = () => ({
    _id: WORKSHOP_ID,
    isActive: true,
    nonAvailabilityDays: [],
    nonAvailabilityDates: [],
    defaultSlots: [
        { _id: idOf(SLOT_ID), startTime: '10:30 AM', endTime: '12:00 PM', capacity: 12 },
    ],
    options: [{ _id: OPTION_ID, title: 'Air-Dry Clay', price: 100, currency: 'AED' }],
});
const request = (overrides = {}) => ({
    checkoutKey: KEY,
    customer: {
        firstName: 'Sonia',
        lastName: 'Khan',
        phone: '+971500000000',
        email: 'sonia@example.com',
    },
    workshops: [
        {
            workshopId: WORKSHOP_ID,
            bookingType: 'pottery',
            bookingDate: '2099-03-02',
            slotId: SLOT_ID,
            items: [{ optionId: OPTION_ID, people: 2 }],
        },
    ],
    ...overrides,
});
beforeEach(() => {
    mockStore.orders = [];
    mockStore.bookings = [];
    mockStore.heldBeforeNewBooking = 0;
    mockStore.priorBookings = 0;
    mockStore.nextId = 1;
    mockStore.workshop = buildWorkshop();
    jest.clearAllMocks();
    stripe_1.stripe.checkout.sessions.create.mockImplementation(async () => ({
        id: `cs_${mockStore.orders.length}`,
        url: `https://checkout.stripe.test/pay/${mockStore.orders.length}`,
    }));
});
describe('potteryBookingUseCase — duplicate submits', () => {
    it('creates one order, one booking and one Stripe session for a fresh cart', async () => {
        const result = await (0, workshopUseCase_1.potteryBookingUseCase)(request());
        expect(mockStore.orders).toHaveLength(1);
        expect(mockStore.bookings).toHaveLength(1);
        expect(stripe_1.stripe.checkout.sessions.create).toHaveBeenCalledTimes(1);
        expect(result.checkoutUrl).toBe(mockStore.orders[0].stripeSessionUrl);
        // The booking holds its seats until the hold runs out.
        expect(mockStore.bookings[0].holdExpiresAt.getTime()).toBeGreaterThan(Date.now());
        // The Stripe session ends together with the hold.
        const params = stripe_1.stripe.checkout.sessions.create.mock.calls[0][0];
        expect(params.expires_at).toBe(Math.floor(mockStore.orders[0].holdExpiresAt.getTime() / 1000));
    });
    it('submitting the same cart twice returns the first checkout and writes nothing new', async () => {
        const first = await (0, workshopUseCase_1.potteryBookingUseCase)(request());
        const second = await (0, workshopUseCase_1.potteryBookingUseCase)(request());
        expect(second.checkoutUrl).toBe(first.checkoutUrl);
        expect(second.orderId).toBe(first.orderId);
        expect(mockStore.orders).toHaveLength(1);
        expect(mockStore.bookings).toHaveLength(1);
        expect(stripe_1.stripe.checkout.sessions.create).toHaveBeenCalledTimes(1);
    });
    it('a retry carrying corrected contact details updates the pending bookings', async () => {
        await (0, workshopUseCase_1.potteryBookingUseCase)(request());
        const corrected = request();
        corrected.customer = { ...corrected.customer, email: 'sonia.new@example.com' };
        await (0, workshopUseCase_1.potteryBookingUseCase)(corrected);
        expect(mockStore.bookings).toHaveLength(1);
        expect(mockStore.bookings[0].customer.email).toBe('sonia.new@example.com');
    });
    it('two simultaneous submits of the same cart still produce a single order', async () => {
        const [a, b] = await Promise.all([
            (0, workshopUseCase_1.potteryBookingUseCase)(request()),
            (0, workshopUseCase_1.potteryBookingUseCase)(request()),
        ]);
        expect(mockStore.orders.filter((o) => !o.isDeleted)).toHaveLength(1);
        // The request that lost the race backs out of its booking, so only one is live.
        expect(mockStore.bookings.filter((b) => !b.isDeleted)).toHaveLength(1);
        expect(a.checkoutUrl).toBe(b.checkoutUrl);
    });
    it('refuses to start a new checkout for a key whose order is already paid', async () => {
        await (0, workshopUseCase_1.potteryBookingUseCase)(request());
        mockStore.orders[0].paymentStatus = 'paid';
        await expect((0, workshopUseCase_1.potteryBookingUseCase)(request())).rejects.toMatchObject({
            message: 'This booking has already been paid.',
        });
        expect(mockStore.orders).toHaveLength(1);
    });
    it('starts a fresh checkout when the earlier one expired without payment', async () => {
        await (0, workshopUseCase_1.potteryBookingUseCase)(request());
        mockStore.orders[0].holdExpiresAt = new Date(Date.now() - 1000);
        await (0, workshopUseCase_1.potteryBookingUseCase)(request());
        expect(mockStore.orders).toHaveLength(2);
        expect(stripe_1.stripe.checkout.sessions.create).toHaveBeenCalledTimes(2);
    });
    it('different carts (different keys) are independent checkouts', async () => {
        await (0, workshopUseCase_1.potteryBookingUseCase)(request());
        await (0, workshopUseCase_1.potteryBookingUseCase)(request({ checkoutKey: 'another-cart-key-0001' }));
        expect(mockStore.orders).toHaveLength(2);
    });
});
describe('potteryBookingUseCase — seats', () => {
    it('rejects up front when the slot already has a booking, however small', async () => {
        mockStore.heldBeforeNewBooking = 2;
        await expect((0, workshopUseCase_1.potteryBookingUseCase)(request())).rejects.toMatchObject({
            message: SLOT_UNAVAILABLE_REASON,
        });
        expect(mockStore.bookings).toHaveLength(0);
    });
    it('backs out when a racing checkout took the slot between the check and the write', async () => {
        const repo = require('../repos/workshopRepo');
        // The first count still looks free (nobody had written yet) ...
        repo.getSlotBookedCount.mockResolvedValueOnce(0);
        // ... but once this booking exists, another one was created ahead of it.
        mockStore.heldBeforeNewBooking = 2;
        mockStore.priorBookings = 1;
        await expect((0, workshopUseCase_1.potteryBookingUseCase)(request())).rejects.toMatchObject({
            message: SLOT_UNAVAILABLE_REASON,
        });
        expect(mockStore.bookings.every((b) => b.isDeleted)).toBe(true);
        expect(stripe_1.stripe.checkout.sessions.create).not.toHaveBeenCalled();
    });
    it('backs out when any booking was created ahead of it in the same slot, even with seats to spare', async () => {
        const repo = require('../repos/workshopRepo');
        repo.getSlotBookedCount.mockResolvedValueOnce(0);
        // Only 2 people held in total, so there are seats — but the slot belongs to the earlier booking.
        mockStore.priorBookings = 1;
        await expect((0, workshopUseCase_1.potteryBookingUseCase)(request())).rejects.toMatchObject({
            message: SLOT_UNAVAILABLE_REASON,
        });
        expect(mockStore.bookings.every((b) => b.isDeleted)).toBe(true);
        expect(stripe_1.stripe.checkout.sessions.create).not.toHaveBeenCalled();
    });
    it('an event booking is not blocked by itself', async () => {
        const events = request();
        events.workshops[0].bookingType = 'events';
        events.workshops[0].items[0].people = 12;
        await expect((0, workshopUseCase_1.potteryBookingUseCase)(events)).resolves.toHaveProperty('checkoutUrl');
        expect(mockStore.bookings.filter((b) => !b.isDeleted)).toHaveLength(1);
    });
    describe('two sessions in the same cart', () => {
        const SLOT_B = '6a8d776872270315b88c5ddf';
        const SLOT_C = '6a8d776872270315b88c5de0';
        const secondEntry = (slotId) => {
            const second = JSON.parse(JSON.stringify(request().workshops[0]));
            second.slotId = slotId;
            return second;
        };
        beforeEach(() => {
            // B overlaps the first slot (10:30 - 12:00); C is in the afternoon.
            mockStore.workshop.defaultSlots.push({ _id: idOf(SLOT_B), startTime: '11:00 AM', endTime: '1:00 PM', capacity: 12 }, { _id: idOf(SLOT_C), startTime: '2:00 PM', endTime: '3:30 PM', capacity: 12 });
        });
        it('are refused when they are at overlapping times on the same day, as one booking owns a window', async () => {
            const cart = request();
            cart.workshops.push(secondEntry(SLOT_B));
            await expect((0, workshopUseCase_1.potteryBookingUseCase)(cart)).rejects.toMatchObject({
                message: 'Two of the selected sessions are at the same time. Please book them separately.',
            });
            expect(mockStore.bookings).toHaveLength(0);
            expect(stripe_1.stripe.checkout.sessions.create).not.toHaveBeenCalled();
        });
        it('are accepted when they are at different times', async () => {
            const cart = request();
            cart.workshops.push(secondEntry(SLOT_C));
            await expect((0, workshopUseCase_1.potteryBookingUseCase)(cart)).resolves.toHaveProperty('checkoutUrl');
            expect(mockStore.bookings.filter((b) => !b.isDeleted)).toHaveLength(2);
        });
        it('are accepted when they are on different days', async () => {
            const cart = request();
            const later = secondEntry(SLOT_B);
            later.bookingDate = '2099-03-03';
            cart.workshops.push(later);
            await expect((0, workshopUseCase_1.potteryBookingUseCase)(cart)).resolves.toHaveProperty('checkoutUrl');
        });
    });
    it('gives the seats back when the Stripe session cannot be created', async () => {
        stripe_1.stripe.checkout.sessions.create.mockRejectedValueOnce(new Error('stripe is down'));
        await expect((0, workshopUseCase_1.potteryBookingUseCase)(request())).rejects.toBeTruthy();
        expect(mockStore.bookings.every((b) => b.isDeleted)).toBe(true);
        expect(mockStore.orders.every((o) => o.isDeleted)).toBe(true);
        // The key is free again, so the visitor's next attempt is a normal one.
        expect(mockStore.orders.some((o) => o.checkoutKey)).toBe(false);
    });
});
