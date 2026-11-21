"use strict";
/**
 * A pending booking keeps its seats while its hold is running, so a second
 * visitor cannot reserve the same seats during the first one's payment. Once the
 * hold ends (or the booking is deleted) the seats are free again.
 *
 * The models are stubbed; what is checked is the query the repo sends.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mockSlotId = '6a8d776872270315b88c5dde';
const mockSlot = {
    _id: mockSlotId,
    startTime: '10:30 AM',
    endTime: '12:00 PM',
    capacity: 12,
};
const mockWorkshop = { _id: 'w1', defaultSlots: [mockSlot], nonAvailabilityDates: [], nonAvailabilityDays: [] };
jest.mock('../models/workshopModel', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(async () => mockWorkshop),
        find: jest.fn(async () => [mockWorkshop]),
    },
}));
jest.mock('../models/workshopBookingModel', () => ({
    __esModule: true,
    default: {
        aggregate: jest.fn(async () => []),
        updateMany: jest.fn(async () => ({})),
        updateOne: jest.fn(async () => ({})),
        findOneAndUpdate: jest.fn(async () => ({})),
    },
}));
jest.mock('../models/workshopOrders', () => ({
    __esModule: true,
    default: { findOneAndUpdate: jest.fn(), updateOne: jest.fn(async () => ({})) },
}));
jest.mock('../models/cartModel', () => ({ __esModule: true, default: {} }));
jest.mock('../../category/models/categoryModel', () => ({ __esModule: true, default: {} }));
jest.mock('../../studio/repos/blockedTimeRepo', () => ({ findBlockForSlot: jest.fn(async () => null) }));
const workshopRepo_1 = require("./workshopRepo");
const bookingModel = require('../models/workshopBookingModel').default;
const orderModel = require('../models/workshopOrders').default;
describe('seat holds', () => {
    beforeEach(() => jest.clearAllMocks());
    it('counts confirmed bookings and unexpired pending holds, nothing else', () => {
        const now = new Date('2099-01-01T10:00:00Z');
        const match = (0, workshopRepo_1.seatHoldMatch)(now);
        expect(match.$or).toEqual([
            { bookingStatus: { $in: ['confirmed', 'paid'] } },
            { bookingStatus: 'pending', paymentStatus: 'pending', holdExpiresAt: { $gt: now } },
        ]);
    });
    it('the booked-seat count used when creating a booking includes pending holds', async () => {
        await (0, workshopRepo_1.getSlotBookedCount)('2099-03-02', mockSlot.startTime, mockSlot.endTime);
        const pipeline = bookingModel.aggregate.mock.calls[0][0];
        const $match = pipeline[0].$match;
        expect($match.$or).toHaveLength(2);
        expect($match.$or[1].holdExpiresAt.$gt).toBeInstanceOf(Date);
        expect($match.isDeleted).toBe(false);
    });
    it('the seats-held-up-to-a-booking count only looks at bookings created at or before it', async () => {
        const bookingId = '6a8d776872270315b88c5f10';
        await (0, workshopRepo_1.getSeatsHeldUpToBookingRepo)('2099-03-02', mockSlot.startTime, mockSlot.endTime, bookingId);
        const $match = bookingModel.aggregate.mock.calls[0][0][0].$match;
        expect($match._id).toEqual({ $lte: bookingId });
        expect($match.$or).toHaveLength(2);
    });
    it('the hold lasts 30 minutes, the length of a Stripe Checkout session', () => {
        const from = Date.UTC(2099, 0, 1, 10, 0, 0);
        expect((0, workshopRepo_1.seatHoldExpiry)(from).getTime() - from).toBe(30 * 60 * 1000);
    });
    it('discarding a checkout never touches anything already paid', async () => {
        await (0, workshopRepo_1.discardPendingCheckoutRepo)({ bookingIds: ['b1'], orderId: 'o1' });
        expect(bookingModel.updateMany.mock.calls[0][0].paymentStatus).toEqual({ $ne: 'paid' });
        expect(orderModel.updateOne.mock.calls[0][0].paymentStatus).toEqual({ $ne: 'paid' });
    });
    it('a gift voucher can only be claimed once: paid, unredeemed, right code', async () => {
        await (0, workshopRepo_1.claimGiftVoucherRepo)('b1', 'BPAB12CD');
        const [filter, update] = bookingModel.findOneAndUpdate.mock.calls[0];
        expect(filter).toEqual({
            _id: 'b1',
            'giftDetails.voucherCode': 'BPAB12CD',
            bookingType: 'gift',
            isDeleted: false,
            paymentStatus: 'paid',
            giftStatus: { $ne: 'redeemed' },
        });
        expect(update.$set.giftStatus).toBe('redeemed');
        expect(update.$set.redeemedAt).toBeInstanceOf(Date);
    });
    it('a released claim makes the voucher usable again', async () => {
        await (0, workshopRepo_1.releaseGiftVoucherClaimRepo)('b1');
        const [filter, update] = bookingModel.updateOne.mock.calls[0];
        expect(filter).toEqual({ _id: 'b1' });
        expect(update.$set.giftStatus).toBe('completed');
        expect(update.$unset).toEqual({ redeemedAt: 1, redeemedBookingId: 1 });
    });
    it('marks an order paid only when it is not paid already', async () => {
        await (0, workshopRepo_1.markOrderPaidIfPendingRepo)('o1', 'pi_1');
        expect(orderModel.findOneAndUpdate.mock.calls[0][0]).toEqual({
            _id: 'o1',
            paymentStatus: { $ne: 'paid' },
        });
    });
});
