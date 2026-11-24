"use strict";
/**
 * Paying for gift vouchers: the purchaser gets ONE email carrying every voucher
 * of the order, and no "booking confirmed" email for them. In a cart that mixes
 * sessions and vouchers the booking confirmation covers the sessions only.
 *
 * Stripe, the repo and the mail service are mocked; the real controller runs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ORDER_ID = '6a8d776872270315b88c5f01';
jest.mock('../useCases/workshopUseCase', () => ({}));
jest.mock('../../config/stripe', () => ({
    stripe: { webhooks: { constructEvent: jest.fn() } },
}));
jest.mock('../../services/workshopBookingMailService', () => ({
    sendWorkshopBookingConfirmationMail: jest.fn().mockResolvedValue(undefined),
    sendPriveBookingConfirmationMail: jest.fn().mockResolvedValue(undefined),
    sendGiftVouchersMail: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../utils/generateGiftVoucher', () => ({
    generateGiftVoucher: jest.fn(),
}));
jest.mock('../../utils/deriveClayType', () => ({
    deriveClayType: (title) => String(title || '').replace(/\s*-\s*(Kids|Adults)\s*$/i, ''),
}));
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
const generateGiftVoucher_1 = require("../../utils/generateGiftVoucher");
const mail = require("../../services/workshopBookingMailService");
const res = () => {
    const r = { statusCode: 200 };
    r.status = jest.fn((c) => ((r.statusCode = c), r));
    r.send = jest.fn(() => r);
    r.json = jest.fn(() => r);
    return r;
};
const req = { headers: { 'stripe-signature': 'sig' }, body: Buffer.from('{}') };
const gift = (n, overrides = {}) => ({
    _id: `6a8d776872270315b88c5f1${n}`,
    bookingType: 'gift',
    workshopId: 'w1',
    totalPeople: n,
    customer: { firstName: 'Sara', email: 'sara@example.com' },
    giftDetails: { giftFor: 'Kids', personalMessage: '' },
    items: [{ optionTitle: 'Ceramic Clay - Kids', child: n }],
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
});
const session = () => ({
    _id: '6a8d776872270315b88c5f20',
    bookingType: 'pottery',
    workshopId: 'w1',
    slotId: 's1',
    customer: { firstName: 'Sara', email: 'sara@example.com' },
});
const orderWith = (bookings) => ({
    _id: ORDER_ID,
    items: bookings.map((b) => ({ bookingId: b._id })),
});
const run = async (bookings) => {
    workshopRepo_1.markOrderPaidIfPendingRepo.mockResolvedValue(orderWith(bookings));
    workshopRepo_1.getBookingsByIdsRepo.mockResolvedValue(bookings);
    const response = res();
    await (0, workshopController_1.stripeWebhookController)(req, response);
    return response;
};
beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    process.env.FRONTEND_URL = 'https://bediapottery.ae';
    stripe_1.stripe.webhooks.constructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_1', metadata: { orderId: ORDER_ID } } },
    });
    let n = 0;
    generateGiftVoucher_1.generateGiftVoucher.mockImplementation(async () => {
        n += 1;
        return { outputPath: `/tmp/v${n}.pdf`, fileName: `v${n}.pdf` };
    });
});
describe('paying for gift vouchers', () => {
    it('three vouchers in one order: one email with all three, and no booking confirmation', async () => {
        const response = await run([gift(1), gift(2), gift(3)]);
        expect(response.statusCode).toBe(200);
        expect(mail.sendGiftVouchersMail).toHaveBeenCalledTimes(1);
        const { vouchers } = mail.sendGiftVouchersMail.mock.calls[0][0];
        expect(vouchers).toHaveLength(3);
        expect(vouchers.map((v) => v.voucherPath)).toEqual(['/tmp/v1.pdf', '/tmp/v2.pdf', '/tmp/v3.pdf']);
        // every voucher has its own code, saved on its own booking
        const codes = vouchers.map((v) => v.voucherCode);
        expect(new Set(codes).size).toBe(3);
        codes.forEach((code) => expect(code).toMatch(/^BP[0-9A-F]{8}$/));
        vouchers.forEach((v) => {
            expect(v.booking.save).toHaveBeenCalledTimes(1);
            expect(v.booking.giftStatus).toBe('completed');
            expect(v.booking.giftDetails.voucherCode).toBe(v.voucherCode);
            expect(v.redeemUrl).toBe(`https://bediapottery.ae/redeem?ref=${v.booking._id}`);
        });
        expect(mail.sendWorkshopBookingConfirmationMail).not.toHaveBeenCalled();
        expect(mail.sendPriveBookingConfirmationMail).not.toHaveBeenCalled();
    });
    it('a cart with a session and a voucher: confirmation for the session only, one voucher email', async () => {
        const response = await run([session(), gift(1)]);
        expect(response.statusCode).toBe(200);
        expect(mail.sendWorkshopBookingConfirmationMail).toHaveBeenCalledTimes(1);
        const { bookingsData } = mail.sendWorkshopBookingConfirmationMail.mock.calls[0][0];
        expect(bookingsData).toHaveLength(1);
        expect(bookingsData[0].booking.bookingType).toBe('pottery');
        expect(mail.sendGiftVouchersMail).toHaveBeenCalledTimes(1);
        expect(mail.sendGiftVouchersMail.mock.calls[0][0].vouchers).toHaveLength(1);
    });
    it('a voucher listed before the session does not change the confirmation', async () => {
        await run([gift(1), session()]);
        expect(mail.sendWorkshopBookingConfirmationMail).toHaveBeenCalledTimes(1);
        expect(mail.sendWorkshopBookingConfirmationMail.mock.calls[0][0].bookingsData).toHaveLength(1);
        expect(mail.sendGiftVouchersMail).toHaveBeenCalledTimes(1);
    });
    it('an order with sessions only sends no voucher email', async () => {
        await run([session()]);
        expect(mail.sendWorkshopBookingConfirmationMail).toHaveBeenCalledTimes(1);
        expect(mail.sendGiftVouchersMail).not.toHaveBeenCalled();
    });
    it('one voucher that cannot be made is left out; the others are still emailed', async () => {
        generateGiftVoucher_1.generateGiftVoucher
            .mockReset()
            .mockResolvedValueOnce({ outputPath: '/tmp/ok1.pdf', fileName: 'ok1.pdf' })
            .mockRejectedValueOnce(new Error('pdf broke'))
            .mockResolvedValueOnce({ outputPath: '/tmp/ok3.pdf', fileName: 'ok3.pdf' });
        const response = await run([gift(1), gift(2), gift(3)]);
        expect(response.statusCode).toBe(200);
        const { vouchers } = mail.sendGiftVouchersMail.mock.calls[0][0];
        expect(vouchers.map((v) => v.voucherPath)).toEqual(['/tmp/ok1.pdf', '/tmp/ok3.pdf']);
    });
    it('a failing voucher email is logged and does not make Stripe retry the payment', async () => {
        mail.sendGiftVouchersMail.mockRejectedValueOnce(new Error('smtp down'));
        const response = await run([gift(1)]);
        expect(response.statusCode).toBe(200);
        expect(workshopRepo_1.revertOrderToPendingRepo).not.toHaveBeenCalled();
    });
});
