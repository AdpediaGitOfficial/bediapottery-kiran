"use strict";
/**
 * Redeeming a gift voucher makes a second booking.
 *
 *   - The voucher's own booking stays as the sale: paid, no date, no slot. It is
 *     marked redeemed and linked to the session.
 *   - The session is a new booking with the date and slot, the recipient's
 *     details, and no amount (so the payment is only counted once).
 *
 * The repo is replaced by an in-memory fake; the real use case runs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mockStore = {
    bookings: [],
    workshop: null,
    heldBeforeSession: 0,
    priorBookings: 0,
    nextId: 1,
};
const mockId = () => `6a8d7768722703150000${String(mockStore.nextId++).padStart(4, '0')}`;
jest.mock('../../careers/repos/careerRepo', () => ({}));
jest.mock('../../careers/repos/jobApplicationRepo', () => ({}));
jest.mock('../../category/repos/categoryRepo', () => ({}));
jest.mock('./potteryTrackingUseCase', () => ({}));
jest.mock('../../config/stripe', () => ({ stripe: {} }));
jest.mock('../../services/workshopBookingMailService', () => ({
    sendWorkshopBookingConfirmationMail: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../studio/useCases/blockedTimeUseCase', () => ({
    assertSlotNotBlocked: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../repos/workshopRepo', () => ({
    getBookingByVoucherCodeRepo: jest.fn(async (id, code) => mockStore.bookings.find((b) => b._id === id && b.giftDetails && b.giftDetails.voucherCode === code && b.bookingType === 'gift' && !b.isDeleted) || null),
    getWorkshopByIdRepo: jest.fn(async () => mockStore.workshop),
    getSlotBookedCount: jest.fn(async () => mockStore.heldBeforeSession),
    // One synchronous check-and-set, like the single database update it stands for.
    claimGiftVoucherRepo: jest.fn(async (id, code) => {
        const booking = mockStore.bookings.find((b) => b._id === String(id) && b.giftDetails.voucherCode === code);
        if (!booking || booking.paymentStatus !== 'paid' || booking.giftStatus === 'redeemed')
            return null;
        booking.giftStatus = 'redeemed';
        booking.redeemedAt = new Date();
        return booking;
    }),
    releaseGiftVoucherClaimRepo: jest.fn(async (id) => {
        const booking = mockStore.bookings.find((b) => b._id === String(id));
        booking.giftStatus = 'completed';
        delete booking.redeemedAt;
        delete booking.redeemedBookingId;
    }),
    createWorkshopBookingRepo: jest.fn(async (data) => {
        const booking = { _id: mockId(), isDeleted: false, ...data };
        mockStore.bookings.push(booking);
        return booking;
    }),
    getSeatsHeldUpToBookingRepo: jest.fn(async (date, start, end, id) => {
        const own = mockStore.bookings.find((b) => b._id === id);
        return {
            people: mockStore.heldBeforeSession + own.totalPeople,
            priorBookings: mockStore.priorBookings,
        };
    }),
    linkRedeemedGiftBookingRepo: jest.fn(async (purchaseId, sessionId) => {
        mockStore.bookings.find((b) => b._id === String(purchaseId)).redeemedBookingId = sessionId;
    }),
    discardGiftSessionBookingRepo: jest.fn(async (id) => {
        mockStore.bookings.find((b) => b._id === id).isDeleted = true;
    }),
}));
const workshopUseCase_1 = require("./workshopUseCase");
const { SLOT_UNAVAILABLE_REASON } = require("../../utils/slotCapacity");
const workshopRepo_1 = require("../repos/workshopRepo");
const mail = require("../../services/workshopBookingMailService");
const PURCHASE_ID = '6a8d776872270315b88c5f01';
const WORKSHOP_ID = '6a8d776872270315b88c5000';
const SLOT_ID = '6a8d776872270315b88c5dde';
const CODE = 'BPAB12CD';
const slot = {
    _id: { toString: () => SLOT_ID },
    label: 'slot 1',
    startTime: '10:30 AM',
    endTime: '12:00 PM',
    capacity: 12,
};
const makePurchase = (overrides = {}) => ({
    _id: PURCHASE_ID,
    isDeleted: false,
    workshopId: { toString: () => WORKSHOP_ID },
    bookingNumber: 'WB-111-1',
    bookingType: 'gift',
    bookingStatus: 'confirmed',
    paymentStatus: 'paid',
    giftStatus: 'completed',
    giftValidity: new Date(Date.now() + 86400000 * 300),
    giftDetails: {
        voucherCode: CODE,
        recipientName: 'Saved Recipient',
        giftEmail: 'saved@example.com',
        giftPhone: '+971500000001',
        giftFor: 'adult',
        occasion: 'Birthday',
        personalMessage: 'Enjoy!',
    },
    customer: {
        firstName: 'Bina',
        lastName: 'Buyer',
        phone: '+971500000009',
        email: 'buyer@example.com',
    },
    items: [
        { optionId: '6a8d776872270315b88c5e01', optionTitle: 'Air-Dry Clay', price: 235, people: 2, subtotal: 470 },
    ],
    totalPeople: 2,
    totalAmount: 470,
    taxAmount: 23.5,
    grandTotal: 493.5,
    currency: 'AED',
    ...overrides,
});
const request = (overrides = {}) => ({
    bookingId: PURCHASE_ID,
    voucherCode: CODE,
    bookingDate: '2099-03-02',
    slotId: SLOT_ID,
    recipientName: 'Sonia Khan',
    recipientPhone: '+971555555555',
    recipientEmail: 'sonia@example.com',
    recipientAddress: 'Dubai Marina',
    ...overrides,
});
const purchase = () => mockStore.bookings.find((b) => b._id === PURCHASE_ID);
const sessions = () => mockStore.bookings.filter((b) => b.redeemedFromBookingId && !b.isDeleted);
beforeEach(() => {
    jest.clearAllMocks();
    mockStore.bookings = [makePurchase()];
    mockStore.workshop = { _id: WORKSHOP_ID, title: 'Pottery Wheel Workshop', defaultSlots: [slot] };
    mockStore.heldBeforeSession = 0;
    mockStore.priorBookings = 0;
    mockStore.nextId = 1;
    process.env.CC_EMAIL = 'studio@example.com';
});
describe('redeeming a gift voucher makes a second booking', () => {
    it('adds a session booking and keeps the voucher booking as the sale', async () => {
        await (0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request());
        expect(mockStore.bookings).toHaveLength(2);
        expect(sessions()).toHaveLength(1);
    });
    it('the session has the date, slot, times and the recipient\'s details', async () => {
        await (0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request());
        const session = sessions()[0];
        expect(session).toMatchObject({
            bookingDate: '2099-03-02',
            slotId: SLOT_ID,
            startTime: '10:30 AM',
            endTime: '12:00 PM',
            totalPeople: 2,
            bookingStatus: 'confirmed',
            paymentStatus: 'paid',
            bookingType: 'gift',
            giftStatus: 'redeemed',
            redeemedFromBookingId: PURCHASE_ID,
        });
        expect(session.customer).toMatchObject({
            firstName: 'Sonia',
            lastName: 'Khan',
            phone: '+971555555555',
            email: 'sonia@example.com',
            address: 'Dubai Marina',
        });
        expect(session.bookingNumber).not.toBe('WB-111-1');
    });
    it('the session carries no amount, so the payment is counted once', async () => {
        await (0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request());
        const session = sessions()[0];
        expect(session.totalAmount).toBe(0);
        expect(session.taxAmount).toBe(0);
        expect(session.grandTotal).toBe(0);
        expect(session.items[0].subtotal).toBe(0);
        // The package itself is still described.
        expect(session.items[0].optionTitle).toBe('Air-Dry Clay');
    });
    it('the voucher booking stays the sale: still paid, still unscheduled, linked to the session', async () => {
        await (0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request());
        const sale = purchase();
        expect(sale.giftStatus).toBe('redeemed');
        expect(sale.redeemedAt).toBeInstanceOf(Date);
        expect(sale.redeemedBookingId).toBe(sessions()[0]._id);
        expect(sale.bookingDate).toBeUndefined();
        expect(sale.slotId).toBeUndefined();
        expect(sale.grandTotal).toBe(493.5);
        expect(sale.paymentStatus).toBe('paid');
        expect(sale.bookingNumber).toBe('WB-111-1');
    });
    it('answers with the session\'s booking number and the voucher\'s', async () => {
        const result = await (0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request());
        expect(result.bookingNumber).toBe(sessions()[0].bookingNumber);
        expect(result.voucherBookingNumber).toBe('WB-111-1');
    });
    it('emails the recipient about the session, copying the buyer and the studio', async () => {
        await (0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request());
        expect(mail.sendWorkshopBookingConfirmationMail).toHaveBeenCalledTimes(1);
        const call = mail.sendWorkshopBookingConfirmationMail.mock.calls[0][0];
        expect(call.to).toBe('sonia@example.com');
        expect(call.cc).toEqual(['buyer@example.com', 'studio@example.com']);
        expect(call.bookingsData[0].booking._id).toBe(sessions()[0]._id);
        expect(call.order.orderNumber).toBe(sessions()[0].bookingNumber);
        expect(call.order.grandTotal).toBe(493.5);
    });
});
describe('the booking it creates', () => {
    it('is accepted by the real booking model', async () => {
        const bookingModel = require('../models/workshopBookingModel').default;
        await (0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request());
        const document = new bookingModel(sessions()[0]);
        expect(document.validateSync()).toBeUndefined();
    });
    it('is accepted even when the recipient gave only a first name', async () => {
        const bookingModel = require('../models/workshopBookingModel').default;
        await (0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request({ recipientName: 'Sonia' }));
        expect(new bookingModel(sessions()[0]).validateSync()).toBeUndefined();
    });
});
describe('the recipient\'s details', () => {
    it('keeps a surname made of several words', async () => {
        await (0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request({ recipientName: 'Sonia  Al   Mansoori' }));
        expect(sessions()[0].customer).toMatchObject({ firstName: 'Sonia', lastName: 'Al Mansoori' });
    });
    it('copes with a single name', async () => {
        await (0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request({ recipientName: 'Sonia' }));
        expect(sessions()[0].customer.firstName).toBe('Sonia');
        expect(sessions()[0].customer.lastName).toBeTruthy();
    });
    it('falls back to what was saved with the gift, then to the buyer', async () => {
        await (0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request({
            recipientName: undefined,
            recipientPhone: undefined,
            recipientEmail: undefined,
            recipientAddress: undefined,
        }));
        const customer = sessions()[0].customer;
        expect(customer.firstName).toBe('Saved');
        expect(customer.lastName).toBe('Recipient');
        expect(customer.email).toBe('saved@example.com');
        expect(customer.phone).toBe('+971500000001');
    });
    it('uses the buyer when nothing else is known', async () => {
        mockStore.bookings = [makePurchase({ giftDetails: { voucherCode: CODE } })];
        await (0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request({ recipientName: '', recipientPhone: '', recipientEmail: '' }));
        const customer = sessions()[0].customer;
        expect(customer.firstName).toBe('Bina');
        expect(customer.email).toBe('buyer@example.com');
    });
});
describe('a voucher can be redeemed once', () => {
    it('a second redemption is refused and adds nothing', async () => {
        await (0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request());
        await expect((0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request())).rejects.toMatchObject({
            message: 'This gift voucher has already been redeemed',
        });
        expect(sessions()).toHaveLength(1);
        expect(mail.sendWorkshopBookingConfirmationMail).toHaveBeenCalledTimes(1);
    });
    it('two requests at the same moment still make a single session', async () => {
        const results = await Promise.allSettled([
            (0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request()),
            (0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request()),
        ]);
        expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
        expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);
        expect(sessions()).toHaveLength(1);
        expect(mail.sendWorkshopBookingConfirmationMail).toHaveBeenCalledTimes(1);
    });
});
describe('when the session cannot be kept', () => {
    it('gives the voucher back when someone else took the slot at the same moment', async () => {
        // The first count looks free; once the session exists, another booking is ahead of it.
        workshopRepo_1.getSlotBookedCount.mockResolvedValueOnce(0);
        mockStore.heldBeforeSession = 2;
        mockStore.priorBookings = 1;
        await expect((0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request())).rejects.toMatchObject({
            message: SLOT_UNAVAILABLE_REASON,
        });
        expect(sessions()).toHaveLength(0);
        expect(purchase().giftStatus).toBe('completed');
        expect(purchase().redeemedAt).toBeUndefined();
        expect(mail.sendWorkshopBookingConfirmationMail).not.toHaveBeenCalled();
        // The recipient can try again with another slot.
        mockStore.heldBeforeSession = 0;
        mockStore.priorBookings = 0;
        await expect((0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request())).resolves.toHaveProperty('bookingNumber');
    });
    it('gives the voucher back when a booking of any kind took the slot ahead of it', async () => {
        workshopRepo_1.getSlotBookedCount.mockResolvedValueOnce(0);
        mockStore.priorBookings = 1;
        await expect((0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request())).rejects.toBeTruthy();
        expect(sessions()).toHaveLength(0);
        expect(purchase().giftStatus).toBe('completed');
    });
    it('refuses a slot that already has a booking without touching the voucher', async () => {
        mockStore.heldBeforeSession = 2;
        await expect((0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request())).rejects.toMatchObject({
            message: SLOT_UNAVAILABLE_REASON,
        });
        expect(workshopRepo_1.claimGiftVoucherRepo).not.toHaveBeenCalled();
        expect(purchase().giftStatus).toBe('completed');
    });
});
describe('checks that were already there still apply', () => {
    it('rejects a wrong code', async () => {
        await expect((0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request({ voucherCode: 'WRONG' }))).rejects.toMatchObject({
            message: 'Invalid voucher code',
        });
    });
    it('rejects a code sent as an object, which could be a database operator', async () => {
        await expect((0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request({ voucherCode: { $ne: null } }))).rejects.toMatchObject({ message: 'Invalid voucher code' });
        expect(workshopRepo_1.getBookingByVoucherCodeRepo).not.toHaveBeenCalled();
    });
    it('rejects a voucher that is not paid', async () => {
        mockStore.bookings = [makePurchase({ paymentStatus: 'pending' })];
        await expect((0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request())).rejects.toMatchObject({
            message: 'This gift voucher is not yet active',
        });
    });
    it('rejects an expired voucher', async () => {
        mockStore.bookings = [makePurchase({ giftValidity: new Date(Date.now() - 1000) })];
        await expect((0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request())).rejects.toMatchObject({
            message: 'This gift voucher has expired',
        });
    });
    it('rejects a slot that does not exist', async () => {
        await expect((0, workshopUseCase_1.confirmGiftRedemptionUseCase)(request({ slotId: '6a8d776872270315b88c5fff' }))).rejects.toMatchObject({ message: 'Selected slot not found' });
    });
});
