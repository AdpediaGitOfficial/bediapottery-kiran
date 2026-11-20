"use strict";
/**
 * The admin status actions, and the guards that stop the journey contradicting
 * itself — a piece walked backwards past a stage, or given a stage its clay
 * does not have.
 */
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('../../services/potteryTrackingMailService', () => ({
    sendTrackingLinkMail: jest.fn(),
    sendPaintingReadyMail: jest.fn(),
    sendDelayMail: jest.fn(),
    sendReadyForCollectionMail: jest.fn(),
    sendCollectionWarningMail: jest.fn(),
}));
jest.mock('../repos/workshopRepo', () => ({
    findActiveTrackedBookingsRepo: jest.fn(),
    getBookingByTrackingTokenRepo: jest.fn(),
    getBookingForTrackingRepo: jest.fn(),
    trackingTokenExistsRepo: jest.fn(),
}));
const potteryTrackingUseCase_1 = require("./potteryTrackingUseCase");
const workshopRepo_1 = require("../repos/workshopRepo");
const potteryTrackingMailService_1 = require("../../services/potteryTrackingMailService");
const BOOKING_ID = '6650f1b2c3d4e5f6a7b8c9d0';
const START = new Date('2026-06-02T10:00:00.000Z');
const makeBooking = (tracking = {}) => ({
    customer: { firstName: 'Sonia', email: 'sonia@example.com' },
    bookingStatus: 'completed',
    items: [],
    tracking: {
        status: 'firing',
        clayCategory: 'ceramic',
        token: 'TOKEN123',
        itemCodes: ['BP-1042'],
        startedAt: START,
        // The link email has already gone out, so only the painting invitation is
        // still in play.
        emails: { createdSentAt: START },
        history: [],
        ...tracking,
    },
    markModified: jest.fn(),
    save: jest.fn().mockResolvedValue(undefined),
});
const given = (booking) => workshopRepo_1.getBookingForTrackingRepo.mockResolvedValue(booking);
beforeEach(() => jest.clearAllMocks());
describe('updateTrackingStatusUseCase — painting', () => {
    it('opens painting on a ceramic piece and invites the customer', async () => {
        const booking = makeBooking();
        given(booking);
        const summary = await (0, potteryTrackingUseCase_1.updateTrackingStatusUseCase)({
            bookingId: BOOKING_ID,
            status: 'painting',
        });
        expect(summary.status).toBe('painting');
        expect(booking.tracking.paintingAt).toBeInstanceOf(Date);
        expect(potteryTrackingMailService_1.sendPaintingReadyMail).toHaveBeenCalledTimes(1);
    });
    it('refuses a terracotta piece, which has no painting stage', async () => {
        given(makeBooking({ clayCategory: 'terracotta' }));
        await expect((0, potteryTrackingUseCase_1.updateTrackingStatusUseCase)({ bookingId: BOOKING_ID, status: 'painting' })).rejects.toThrow('Only a ceramic piece has a painting stage');
        expect(potteryTrackingMailService_1.sendPaintingReadyMail).not.toHaveBeenCalled();
    });
    it('refuses to reopen painting once the piece is ready', async () => {
        given(makeBooking({ status: 'ready', readyAt: START }));
        await expect((0, potteryTrackingUseCase_1.updateTrackingStatusUseCase)({ bookingId: BOOKING_ID, status: 'painting' })).rejects.toThrow('painting has closed');
        expect(potteryTrackingMailService_1.sendPaintingReadyMail).not.toHaveBeenCalled();
    });
});
