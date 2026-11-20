"use strict";
/**
 * The rules deciding which customer email goes out when.
 *
 * A duplicate here reaches a real inbox and a missed one strands a customer,
 * so the mail service is mocked and the decisions are asserted directly.
 */
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('../../services/potteryTrackingMailService', () => ({
    sendTrackingLinkMail: jest.fn(),
    sendPaintingReadyMail: jest.fn(),
    sendDelayMail: jest.fn(),
    sendReadyForCollectionMail: jest.fn(),
    sendCollectionWarningMail: jest.fn(),
}));
// The repos pull in mongoose models; the dispatcher never touches them, but the
// module graph does, so they are stubbed to keep this a pure unit test.
jest.mock('../repos/workshopRepo', () => ({
    findActiveTrackedBookingsRepo: jest.fn(),
    getBookingByTrackingTokenRepo: jest.fn(),
    getBookingForTrackingRepo: jest.fn(),
    trackingTokenExistsRepo: jest.fn(),
}));
const potteryTrackingUseCase_1 = require("./potteryTrackingUseCase");
const potteryTrackingMailService_1 = require("../../services/potteryTrackingMailService");
const potteryTracking_1 = require("../../utils/potteryTracking");
const START = new Date('2026-06-02T10:00:00.000Z');
const dayN = (day) => new Date(START.getTime() + day * potteryTracking_1.DAY_MS);
/** A booking part-way through its journey, with every email still unsent. */
const makeBooking = (tracking = {}) => ({
    customer: { firstName: 'Sonia', email: 'sonia@example.com' },
    tracking: {
        status: 'created',
        clayCategory: 'terracotta',
        token: 'TOKEN123',
        itemCodes: ['BP-1042'],
        startedAt: START,
        emails: {},
        ...tracking,
    },
});
beforeEach(() => jest.clearAllMocks());
describe('dispatchTrackingEmails', () => {
    it('sends the tracking link once and never again', async () => {
        const booking = makeBooking();
        expect(await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(booking, dayN(0))).toBe(true);
        expect(potteryTrackingMailService_1.sendTrackingLinkMail).toHaveBeenCalledTimes(1);
        // A second pass over the same booking must be a no-op.
        expect(await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(booking, dayN(1))).toBe(false);
        expect(potteryTrackingMailService_1.sendTrackingLinkMail).toHaveBeenCalledTimes(1);
    });
    it('builds the link from the stored token', async () => {
        process.env.POTTERY_FRONTEND_URL = 'https://bediapottery.ae/';
        await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(makeBooking(), dayN(0));
        expect(potteryTrackingMailService_1.sendTrackingLinkMail).toHaveBeenCalledWith(expect.objectContaining({
            trackingUrl: 'https://bediapottery.ae/tracking-order?ref=TOKEN123',
        }));
    });
    it('invites a ceramic piece to painting, and only a ceramic one', async () => {
        await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(makeBooking({
            clayCategory: 'ceramic',
            status: 'painting',
            paintingAt: dayN(15),
            emails: { createdSentAt: START },
        }), dayN(15));
        expect(potteryTrackingMailService_1.sendPaintingReadyMail).toHaveBeenCalledTimes(1);
        jest.clearAllMocks();
        await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(makeBooking({ status: 'firing', firingAt: dayN(15), emails: { createdSentAt: START } }), dayN(15));
        expect(potteryTrackingMailService_1.sendPaintingReadyMail).not.toHaveBeenCalled();
    });
    it('skips the painting email for a ceramic piece that went straight to ready', async () => {
        await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(makeBooking({
            clayCategory: 'ceramic',
            status: 'ready',
            readyAt: dayN(10),
            emails: { createdSentAt: START },
        }), dayN(10));
        expect(potteryTrackingMailService_1.sendPaintingReadyMail).not.toHaveBeenCalled();
        expect(potteryTrackingMailService_1.sendReadyForCollectionMail).toHaveBeenCalledTimes(1);
    });
    it('catches up on both emails when a piece crosses two stages in one pass', async () => {
        await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(makeBooking({
            clayCategory: 'ceramic',
            status: 'ready',
            paintingAt: dayN(15),
            readyAt: dayN(21),
            emails: { createdSentAt: START },
        }), dayN(21));
        expect(potteryTrackingMailService_1.sendPaintingReadyMail).toHaveBeenCalledTimes(1);
        expect(potteryTrackingMailService_1.sendReadyForCollectionMail).toHaveBeenCalledTimes(1);
    });
    it('tells the customer when to collect by', async () => {
        await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(makeBooking({ status: 'ready', readyAt: dayN(21), emails: { createdSentAt: START } }), dayN(21));
        // A week after ready.
        expect(potteryTrackingMailService_1.sendReadyForCollectionMail).toHaveBeenCalledWith(expect.objectContaining({ estimatedCollectionDate: dayN(28) }));
    });
    it('warns a week before the deadline, not before', async () => {
        const readyBooking = () => makeBooking({
            status: 'ready',
            readyAt: dayN(21),
            emails: { createdSentAt: START, readySentAt: dayN(21) },
        });
        // Deadline is day 58, so the warning is due on day 51.
        await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(readyBooking(), dayN(50));
        expect(potteryTrackingMailService_1.sendCollectionWarningMail).not.toHaveBeenCalled();
        await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(readyBooking(), dayN(51));
        expect(potteryTrackingMailService_1.sendCollectionWarningMail).toHaveBeenCalledWith(expect.objectContaining({ collectionDeadline: dayN(58) }));
    });
    it('does not warn about a piece that has already been collected', async () => {
        await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(makeBooking({
            status: 'collected',
            readyAt: dayN(21),
            collectedAt: dayN(25),
            emails: { createdSentAt: START, readySentAt: dayN(21) },
        }), dayN(55));
        expect(potteryTrackingMailService_1.sendCollectionWarningMail).not.toHaveBeenCalled();
    });
    it('tells the customer about a delay, with the pushed-out estimate', async () => {
        const booking = makeBooking({
            status: 'delay',
            isDelayed: true,
            delayedAt: dayN(16),
            delayNote: 'A hairline crack appeared during drying.',
            emails: { createdSentAt: START },
        });
        expect(await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(booking, dayN(16))).toBe(true);
        // Delayed pieces are estimated from day 25 rather than day 21.
        expect(potteryTrackingMailService_1.sendDelayMail).toHaveBeenCalledWith(expect.objectContaining({
            estimatedReadyFrom: dayN(25),
            estimatedReadyTo: dayN(32),
        }));
        // A second delay must not mail the customer again.
        expect(await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(booking, dayN(18))).toBe(false);
        expect(potteryTrackingMailService_1.sendDelayMail).toHaveBeenCalledTimes(1);
    });
    it('sends no delay email to a piece that was never delayed', async () => {
        await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(makeBooking({ status: 'firing', firingAt: dayN(15), emails: { createdSentAt: START } }), dayN(15));
        expect(potteryTrackingMailService_1.sendDelayMail).not.toHaveBeenCalled();
    });
    it('resumes the normal journey once a delayed piece is marked ready', async () => {
        const booking = makeBooking({
            status: 'delay',
            isDelayed: true,
            delayedAt: dayN(16),
            emails: { createdSentAt: START },
        });
        await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(booking, dayN(16));
        expect(potteryTrackingMailService_1.sendDelayMail).toHaveBeenCalledTimes(1);
        // The studio finishes the repair and marks it ready on day 26.
        booking.tracking.status = 'ready';
        booking.tracking.readyAt = dayN(26);
        await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(booking, dayN(26));
        expect(potteryTrackingMailService_1.sendReadyForCollectionMail).toHaveBeenCalledWith(expect.objectContaining({ estimatedCollectionDate: dayN(33) }));
        // Still only the one delay notice.
        expect(potteryTrackingMailService_1.sendDelayMail).toHaveBeenCalledTimes(1);
        // And the deadline clock now runs from the later ready date: day 33 + 30,
        // so the warning is due on day 56.
        await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(booking, dayN(55));
        expect(potteryTrackingMailService_1.sendCollectionWarningMail).not.toHaveBeenCalled();
        await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)(booking, dayN(56));
        expect(potteryTrackingMailService_1.sendCollectionWarningMail).toHaveBeenCalledWith(expect.objectContaining({ collectionDeadline: dayN(63) }));
    });
    it('ignores a booking whose journey has not started', async () => {
        expect(await (0, potteryTrackingUseCase_1.dispatchTrackingEmails)({ customer: {} }, dayN(0))).toBe(false);
        expect(potteryTrackingMailService_1.sendTrackingLinkMail).not.toHaveBeenCalled();
    });
});
