"use strict";
/**
 * One booking owns a time window, so a cart cannot hold two different sessions at
 * overlapping times on the same day: the second one is refused when it is added,
 * not only at checkout. Lines for the same session (same workshop and slot) belong
 * together, back-to-back sessions do not overlap, and gifts have no time.
 *
 * The repo is faked; the real cart logic runs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const mockId = (n) => new mongoose.Types.ObjectId(String(n).padStart(24, '0'));
const mockStore = { workshops: {}, cart: null };
jest.mock('../../careers/repos/careerRepo', () => ({}));
jest.mock('../../careers/repos/jobApplicationRepo', () => ({}));
jest.mock('../../category/repos/categoryRepo', () => ({}));
jest.mock('../../services/workshopBookingMailService', () => ({}));
jest.mock('./potteryTrackingUseCase', () => ({}));
jest.mock('../../config/stripe', () => ({ stripe: {} }));
jest.mock('../../studio/useCases/blockedTimeUseCase', () => ({
    assertSlotNotBlocked: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../repos/workshopRepo', () => ({
    getWorkshopByIdRepo: jest.fn(async (id) => mockStore.workshops[String(id)] || null),
    getCartByUserIdRepo: jest.fn(async () => mockStore.cart),
    createCartRepo: jest.fn(async (data) => {
        mockStore.cart = { ...data, save: jest.fn().mockResolvedValue(undefined) };
        return mockStore.cart;
    }),
}));
const workshopUseCase_1 = require("./workshopUseCase");
const WORKSHOP_A = mockId(1);
const WORKSHOP_B = mockId(2);
const OPTION = mockId(10);
const DATE = '2099-03-23';
const slotOf = (n, startTime, endTime) => ({ _id: mockId(n), startTime, endTime, capacity: 12 });
// Workshop A (a normal workshop) and workshop B (the birthday package).
const SLOT_A1 = slotOf(100, '6:00 PM', '7:30 PM');
const SLOT_A2 = slotOf(101, '7:30 PM', '9:00 PM'); // starts exactly when A1 ends
const SLOT_A3 = slotOf(102, '2:00 PM', '3:30 PM');
const SLOT_B1 = slotOf(200, '6:30 PM', '8:30 PM'); // overlaps A1 and A2
const workshop = (id, slots) => ({
    _id: id,
    isActive: true,
    nonAvailabilityDays: [],
    nonAvailabilityDates: [],
    defaultSlots: slots,
    options: [{ _id: OPTION, title: 'Air-Dry Clay', price: 249, currency: 'AED' }],
});
const addRequest = (workshopId, slot, overrides = {}) => ({
    userId: 'u1',
    workshopId: String(workshopId),
    bookingDate: DATE,
    slotId: String(slot._id),
    optionId: String(OPTION),
    people: 1,
    ...overrides,
});
const cartLine = (workshopId, slot, overrides = {}) => ({
    workshopId,
    slotId: slot._id,
    bookingDate: DATE,
    optionId: OPTION,
    people: 1,
    price: 249,
    subtotal: 249,
    ...overrides,
});
const withCart = (...items) => {
    mockStore.cart = { userId: 'u1', items, save: jest.fn().mockResolvedValue(undefined) };
};
beforeEach(() => {
    jest.clearAllMocks();
    mockStore.workshops = {
        [String(WORKSHOP_A)]: workshop(WORKSHOP_A, [SLOT_A1, SLOT_A2, SLOT_A3]),
        [String(WORKSHOP_B)]: workshop(WORKSHOP_B, [SLOT_B1]),
    };
    mockStore.cart = null;
});
describe('adding a session to the cart', () => {
    it('is refused when the cart already has a different session at an overlapping time that day', async () => {
        // The cart in the screenshot: 6:00 - 7:30 PM, then the birthday package at 6:30 - 8:30 PM.
        withCart(cartLine(WORKSHOP_A, SLOT_A1));
        await expect((0, workshopUseCase_1.addToCartUseCase)(addRequest(WORKSHOP_B, SLOT_B1))).rejects.toMatchObject({
            message: workshopUseCase_1.CART_OVERLAP_MESSAGE,
        });
        expect(mockStore.cart.items).toHaveLength(1);
        expect(mockStore.cart.save).not.toHaveBeenCalled();
    });
    it('is refused the other way round too', async () => {
        withCart(cartLine(WORKSHOP_B, SLOT_B1));
        await expect((0, workshopUseCase_1.addToCartUseCase)(addRequest(WORKSHOP_A, SLOT_A1))).rejects.toMatchObject({
            message: workshopUseCase_1.CART_OVERLAP_MESSAGE,
        });
    });
    it('is refused for overlapping slots of the same workshop', async () => {
        mockStore.workshops[String(WORKSHOP_A)].defaultSlots.push(slotOf(103, '7:00 PM', '8:30 PM'));
        withCart(cartLine(WORKSHOP_A, SLOT_A1));
        await expect((0, workshopUseCase_1.addToCartUseCase)(addRequest(WORKSHOP_A, { _id: mockId(103) }))).rejects.toMatchObject({
            message: workshopUseCase_1.CART_OVERLAP_MESSAGE,
        });
    });
    it('is accepted at a different time the same day', async () => {
        withCart(cartLine(WORKSHOP_A, SLOT_A1));
        await (0, workshopUseCase_1.addToCartUseCase)(addRequest(WORKSHOP_A, SLOT_A3));
        expect(mockStore.cart.items).toHaveLength(2);
        expect(mockStore.cart.save).toHaveBeenCalled();
    });
    it('is accepted when it starts exactly when the other ends (back to back)', async () => {
        withCart(cartLine(WORKSHOP_A, SLOT_A1));
        await (0, workshopUseCase_1.addToCartUseCase)(addRequest(WORKSHOP_A, SLOT_A2));
        expect(mockStore.cart.items).toHaveLength(2);
    });
    it('is accepted on a different day', async () => {
        withCart(cartLine(WORKSHOP_A, SLOT_A1));
        await (0, workshopUseCase_1.addToCartUseCase)(addRequest(WORKSHOP_B, SLOT_B1, { bookingDate: '2099-03-24' }));
        expect(mockStore.cart.items).toHaveLength(2);
    });
    it('is accepted for the same session (same workshop and slot), as lines of one booking', async () => {
        withCart(cartLine(WORKSHOP_A, SLOT_A1));
        await (0, workshopUseCase_1.addToCartUseCase)(addRequest(WORKSHOP_A, SLOT_A1, { optionId: String(OPTION), people: 2 }));
        expect(mockStore.cart.save).toHaveBeenCalled();
    });
    it('is accepted into an empty cart', async () => {
        await (0, workshopUseCase_1.addToCartUseCase)(addRequest(WORKSHOP_A, SLOT_A1));
        expect(mockStore.cart.items).toHaveLength(1);
    });
    it('ignores a gift line already in the cart, which has no time', async () => {
        withCart({
            workshopId: WORKSHOP_A,
            bookingType: 'gift',
            optionId: OPTION,
            people: 1,
            price: 249,
            subtotal: 249,
        });
        await (0, workshopUseCase_1.addToCartUseCase)(addRequest(WORKSHOP_B, SLOT_B1));
        expect(mockStore.cart.items).toHaveLength(2);
    });
});
