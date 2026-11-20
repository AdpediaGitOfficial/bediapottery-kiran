"use strict";
/**
 * Stripe delivers each event at least once and retries slow or failed ones, so the
 * same `payment_intent.succeeded` can reach the webhook more than once. Only the
 * first delivery may confirm the bookings and send the emails.
 *
 * The repo, Stripe and the mail service are mocked; the real controller runs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ORDER_ID = '6a8d776872270315b88c5f01';
const BOOKING_ID = '6a8d776872270315b88c5f02';
jest.mock('../useCases/workshopUseCase', () => ({}));
jest.mock('../../config/stripe', () => ({
    stripe: { webhooks: { constructEvent: jest.fn() } },
}));
jest.mock('../../services/workshopBookingMailService', () => ({
    sendWorkshopBookingConfirmationMail: jest.fn().mockResolvedValue(undefined),
    sendPriveBookingConfirmationMail: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../utils/generateGiftVoucher', () => ({}));
jest.mock('../../utils/deriveClayType', () => ({}));
jest.mock('../models/workshopModel', () => ({
    __esModule: true,
    default: { find: jest.fn().mockResolvedValue([]) },
}));
jest.mock('../repos/workshopRepo', () => ({
    markOrderPaidIfPendingRepo: jest.fn(),
    orderExistsRepo: jest.fn(),
    revertOrderToPendingRepo: jest.fn().mockResolvedValue(undefined),
    updateBookingsPaymentStatusByIds: jest.fn().mockResolvedValue(undefined),
    getBookingsByIdsRepo: jest.fn(),
    updateBookingsSlotTimesByIds: jest.fn().mockResolvedValue(undefined),
    updateOrderItemsSlotTimes: jest.fn().mockResolvedValue(undefined),
    getCartByUserIdRepo: jest.fn().mockResolvedValue(null),
    clearCartRepo: jest.fn().mockResolvedValue(undefined),
}));
const workshopController_1 = require("./workshopController");
const stripe_1 = require("../../config/stripe");
const workshopRepo_1 = require("../repos/workshopRepo");
const mail = require("../../services/workshopBookingMailService");
const makeRes = () => {
    const res = { statusCode: 200, body: undefined };
    res.status = jest.fn((code) => {
        res.statusCode = code;
        return res;
    });
    res.send = jest.fn((body) => {
        res.body = body;
        return res;
    });
    res.json = jest.fn((body) => {
        res.body = body;
        return res;
    });
    return res;
};
const req = { headers: { 'stripe-signature': 'sig' }, body: Buffer.from('{}') };
const paidOrder = { _id: ORDER_ID, items: [{ bookingId: BOOKING_ID }] };
beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    stripe_1.stripe.webhooks.constructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_1', metadata: { orderId: ORDER_ID } } },
    });
    workshopRepo_1.markOrderPaidIfPendingRepo.mockResolvedValue(paidOrder);
    workshopRepo_1.orderExistsRepo.mockResolvedValue(true);
    workshopRepo_1.getBookingsByIdsRepo.mockResolvedValue([
        { _id: BOOKING_ID, bookingType: 'pottery', workshopId: 'w1', slotId: 's1', customer: {} },
    ]);
});
describe('stripeWebhookController — repeated delivery', () => {
    it('first delivery confirms the bookings and sends the confirmation email once', async () => {
        const res = makeRes();
        await (0, workshopController_1.stripeWebhookController)(req, res);
        expect(res.statusCode).toBe(200);
        expect(workshopRepo_1.updateBookingsPaymentStatusByIds).toHaveBeenCalledTimes(1);
        expect(mail.sendWorkshopBookingConfirmationMail).toHaveBeenCalledTimes(1);
    });
    it('a second delivery of the same payment does nothing and still answers 200', async () => {
        // The order is already paid, so the atomic claim finds nothing to update.
        workshopRepo_1.markOrderPaidIfPendingRepo.mockResolvedValue(null);
        const res = makeRes();
        await (0, workshopController_1.stripeWebhookController)(req, res);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ received: true });
        expect(workshopRepo_1.updateBookingsPaymentStatusByIds).not.toHaveBeenCalled();
        expect(mail.sendWorkshopBookingConfirmationMail).not.toHaveBeenCalled();
        expect(mail.sendPriveBookingConfirmationMail).not.toHaveBeenCalled();
    });
    it('an order that does not exist is an error, so Stripe keeps retrying', async () => {
        workshopRepo_1.markOrderPaidIfPendingRepo.mockResolvedValue(null);
        workshopRepo_1.orderExistsRepo.mockResolvedValue(false);
        const res = makeRes();
        await (0, workshopController_1.stripeWebhookController)(req, res);
        expect(res.statusCode).toBe(400);
        expect(mail.sendWorkshopBookingConfirmationMail).not.toHaveBeenCalled();
    });
    it('a failure before the bookings are confirmed hands the order back for the retry', async () => {
        workshopRepo_1.updateBookingsPaymentStatusByIds.mockRejectedValueOnce(new Error('db down'));
        const res = makeRes();
        await (0, workshopController_1.stripeWebhookController)(req, res);
        expect(res.statusCode).toBe(400);
        expect(workshopRepo_1.revertOrderToPendingRepo).toHaveBeenCalledWith(paidOrder._id);
        expect(mail.sendWorkshopBookingConfirmationMail).not.toHaveBeenCalled();
    });
    it('a failing email after payment is logged but does not trigger a retry', async () => {
        mail.sendWorkshopBookingConfirmationMail.mockRejectedValueOnce(new Error('smtp down'));
        const res = makeRes();
        await (0, workshopController_1.stripeWebhookController)(req, res);
        // A 400 here would make Stripe redeliver and the customer would be mailed twice.
        expect(res.statusCode).toBe(200);
        expect(workshopRepo_1.revertOrderToPendingRepo).not.toHaveBeenCalled();
    });
});
