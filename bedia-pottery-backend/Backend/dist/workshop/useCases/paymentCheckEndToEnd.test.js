"use strict";
/**
 * From a pending order to the customer's email, through the real payment check and
 * the real confirmation steps. Only Stripe, the database and the mail transport are
 * faked.
 *
 * The point: an order Stripe says is paid is confirmed and emailed once, and when
 * the webhook and the payment check both arrive, the customer still gets one email.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ORDER_ID = '6a8d776872270315b88c5f01';
const BOOKING_ID = '6a8d776872270315b88c5f02';
jest.mock('../../config/stripe', () => ({
    stripe: { checkout: { sessions: { retrieve: jest.fn() } } },
}));
jest.mock('../../services/workshopBookingMailService', () => ({
    sendWorkshopBookingConfirmationMail: jest.fn().mockResolvedValue(undefined),
    sendPriveBookingConfirmationMail: jest.fn().mockResolvedValue(undefined),
    sendGiftVouchersMail: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../utils/generateGiftVoucher', () => ({ generateGiftVoucher: jest.fn() }));
jest.mock('../../utils/deriveClayType', () => ({ deriveClayType: (t) => String(t || '') }));
jest.mock('../models/workshopModel', () => ({
    __esModule: true,
    default: { find: jest.fn().mockResolvedValue([]) },
}));
jest.mock('../repos/workshopRepo', () => ({
    findOrdersAwaitingPaymentCheckRepo: jest.fn(),
    findOrderForPaymentCheckRepo: jest.fn(),
    markOrderPaymentCheckedRepo: jest.fn().mockResolvedValue(undefined),
    markOrderPaidIfPendingRepo: jest.fn(),
    orderExistsRepo: jest.fn().mockResolvedValue(true),
    revertOrderToPendingRepo: jest.fn().mockResolvedValue(undefined),
    updateBookingsPaymentStatusByIds: jest.fn().mockResolvedValue(undefined),
    getBookingsByIdsRepo: jest.fn(),
    updateBookingsSlotTimesByIds: jest.fn().mockResolvedValue(undefined),
    updateOrderItemsSlotTimes: jest.fn().mockResolvedValue(undefined),
    getCartByUserIdRepo: jest.fn().mockResolvedValue(null),
    clearCartRepo: jest.fn().mockResolvedValue(undefined),
}));
const stripe_1 = require("../../config/stripe");
const workshopRepo_1 = require("../repos/workshopRepo");
const mail = require("../../services/workshopBookingMailService");
const check = require("./orderPaymentCheckUseCase");
const pendingOrder = { _id: ORDER_ID, orderNumber: 'ORD-1', stripeSessionId: 'cs_1', grandTotal: 784.35, currency: 'AED', paymentStatus: 'pending' };
const paidSession = {
    id: 'cs_1',
    metadata: { orderId: ORDER_ID },
    payment_status: 'paid',
    status: 'complete',
    amount_total: 78435,
    currency: 'aed',
    payment_intent: 'pi_1',
};
beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    stripe_1.stripe.checkout.sessions.retrieve.mockResolvedValue(paidSession);
    workshopRepo_1.findOrdersAwaitingPaymentCheckRepo.mockResolvedValue([pendingOrder]);
    workshopRepo_1.findOrderForPaymentCheckRepo.mockResolvedValue(pendingOrder);
    workshopRepo_1.getBookingsByIdsRepo.mockResolvedValue([
        {
            _id: BOOKING_ID,
            bookingType: 'pottery',
            workshopId: 'w1',
            slotId: 's1',
            customer: { firstName: 'Mia', email: 'mia@example.com' },
        },
    ]);
    // the atomic claim: the first caller gets the order, anyone after gets null
    let claimed = false;
    workshopRepo_1.markOrderPaidIfPendingRepo.mockImplementation(async () => {
        if (claimed)
            return null;
        claimed = true;
        return { _id: ORDER_ID, items: [{ bookingId: BOOKING_ID }], subtotal: 747, grandTotal: 784.35, currency: 'AED' };
    });
});
describe('a paid order whose webhook never arrived', () => {
    it('the scheduled round confirms the booking and sends the confirmation email', async () => {
        const summary = await check.runPaymentCheckPass();
        expect(summary.confirmed).toBe(1);
        expect(workshopRepo_1.markOrderPaidIfPendingRepo).toHaveBeenCalledWith(ORDER_ID, 'pi_1');
        expect(workshopRepo_1.updateBookingsPaymentStatusByIds).toHaveBeenCalledWith([BOOKING_ID], 'paid');
        expect(mail.sendWorkshopBookingConfirmationMail).toHaveBeenCalledTimes(1);
        const { order, bookingsData } = mail.sendWorkshopBookingConfirmationMail.mock.calls[0][0];
        expect(order.grandTotal).toBe(784.35);
        expect(bookingsData[0].booking.customer.email).toBe('mia@example.com');
    });
    it('the success page confirms it at once, so the customer is emailed without waiting', async () => {
        await expect(check.checkOrderPaymentByIdUseCase(ORDER_ID)).resolves.toBe('paid');
        expect(mail.sendWorkshopBookingConfirmationMail).toHaveBeenCalledTimes(1);
    });
    it('the payment check and the webhook arriving together send ONE email', async () => {
        const { confirmPaidOrderUseCase } = require('./confirmPaidOrderUseCase');
        const [fromCheck, fromWebhook] = await Promise.all([
            check.checkOrderPaymentUseCase(pendingOrder),
            confirmPaidOrderUseCase(ORDER_ID, 'pi_1'),
        ]);
        expect([fromCheck, fromWebhook].sort()).toEqual(['already-processed', 'confirmed']);
        expect(mail.sendWorkshopBookingConfirmationMail).toHaveBeenCalledTimes(1);
    });
    it('a second round finds nothing left to confirm and sends nothing more', async () => {
        await check.runPaymentCheckPass();
        workshopRepo_1.findOrdersAwaitingPaymentCheckRepo.mockResolvedValue([]);
        await check.runPaymentCheckPass();
        expect(mail.sendWorkshopBookingConfirmationMail).toHaveBeenCalledTimes(1);
    });
    it('an order Stripe says is NOT paid is left pending and nothing is sent', async () => {
        stripe_1.stripe.checkout.sessions.retrieve.mockResolvedValue({ ...paidSession, payment_status: 'unpaid', status: 'open' });
        const summary = await check.runPaymentCheckPass();
        expect(summary.confirmed).toBe(0);
        expect(workshopRepo_1.markOrderPaidIfPendingRepo).not.toHaveBeenCalled();
        expect(mail.sendWorkshopBookingConfirmationMail).not.toHaveBeenCalled();
    });
    it('a failure before the bookings are confirmed hands the order back, so the next round tries again', async () => {
        workshopRepo_1.updateBookingsPaymentStatusByIds.mockRejectedValueOnce(new Error('db down'));
        const summary = await check.runPaymentCheckPass();
        expect(summary.errors).toBe(1);
        expect(workshopRepo_1.revertOrderToPendingRepo).toHaveBeenCalledWith(ORDER_ID);
        expect(mail.sendWorkshopBookingConfirmationMail).not.toHaveBeenCalled();
    });
});
