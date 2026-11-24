"use strict";
/**
 * The purchaser gets ONE email for every gift voucher bought in an order, with
 * each voucher's details in the message and every PDF attached. The standard
 * booking confirmation, used when a voucher is redeemed, shows the voucher code
 * and says the session was paid for by the voucher.
 *
 * Only the transport (sendEmail) is mocked; the real templates run.
 */
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('./mailService', () => ({
    sendEmail: jest.fn().mockResolvedValue(undefined),
    POTTERY_MAIL_NAME: 'Bedia Pottery',
}));
const mailService_1 = require("./mailService");
const mail = require("./workshopBookingMailService");
const voucher = (n, overrides = {}) => ({
    booking: {
        _id: `64f0c0ffee00000000000a0${n}`,
        customer: { firstName: 'Sara', lastName: 'Ali', email: 'sara@example.com' },
        totalPeople: n,
        giftValidity: '2027-10-16T00:00:00.000Z',
        giftDetails: { giftFor: n === 1 ? 'Kids' : 'Adults', recipientName: `Friend ${n}` },
        items: [{ optionTitle: 'Ceramic Clay - Kids', people: n }],
    },
    voucherPath: `/tmp/voucher-${n}.pdf`,
    voucherCode: `BPCODE000${n}`,
    ...overrides,
});
const sent = () => mailService_1.sendEmail.mock.calls[0];
// sendEmail(to, subject, text, html, attachments, cc, options)
const html = () => sent()[3];
beforeEach(() => {
    jest.clearAllMocks();
    process.env.CC_EMAIL = 'studio@example.com';
    process.env.FRONTEND_URL = 'https://bediapottery.ae';
});
describe('gift voucher purchase email', () => {
    it('one voucher: one email with the voucher details and one PDF', async () => {
        await mail.sendGiftVouchersMail({ vouchers: [voucher(1)] });
        expect(mailService_1.sendEmail).toHaveBeenCalledTimes(1);
        expect(sent()[0]).toBe('sara@example.com');
        expect(sent()[1]).toBe('Your Bedia Pottery Gift Card');
        expect(sent()[4]).toEqual([{ filename: 'gift-voucher.pdf', path: '/tmp/voucher-1.pdf' }]);
        expect(sent()[5]).toEqual(['studio@example.com']);
        expect(html()).toContain('BPCODE0001');
        expect(html()).toContain("Kids' Pottery Experience");
        expect(html()).toContain('16 October 2027');
        expect(html()).toContain('Friend 1');
        expect(html()).toContain('https://bediapottery.ae/redeem?ref=64f0c0ffee00000000000a01');
        expect(html()).not.toContain('Gift voucher 1 of');
    });
    it('several vouchers: still ONE email, every PDF attached and every voucher listed', async () => {
        await mail.sendGiftVouchersMail({ vouchers: [voucher(1), voucher(2), voucher(3)] });
        expect(mailService_1.sendEmail).toHaveBeenCalledTimes(1);
        expect(sent()[1]).toBe('Your Bedia Pottery Gift Cards');
        expect(sent()[4]).toEqual([
            { filename: 'gift-voucher-1.pdf', path: '/tmp/voucher-1.pdf' },
            { filename: 'gift-voucher-2.pdf', path: '/tmp/voucher-2.pdf' },
            { filename: 'gift-voucher-3.pdf', path: '/tmp/voucher-3.pdf' },
        ]);
        for (const code of ['BPCODE0001', 'BPCODE0002', 'BPCODE0003']) {
            expect(html()).toContain(code);
        }
        expect(html()).toContain('Gift voucher 2 of 3');
        expect(html()).toContain('3 gift cards');
    });
    it('writes what the buyer typed as text, never as markup', async () => {
        const v = voucher(1);
        v.booking.giftDetails.recipientName = '<img src=x onerror=alert(1)>';
        await mail.sendGiftVouchersMail({ vouchers: [v] });
        expect(html()).not.toContain('<img src=x');
        expect(html()).toContain('&lt;img src=x onerror=alert(1)&gt;');
    });
    it('sends nothing when there is no voucher file or no purchaser address', async () => {
        await mail.sendGiftVouchersMail({ vouchers: [] });
        await mail.sendGiftVouchersMail({ vouchers: [voucher(1, { voucherPath: undefined })] });
        const noEmail = voucher(1);
        noEmail.booking.customer.email = undefined;
        await mail.sendGiftVouchersMail({ vouchers: [noEmail] });
        expect(mailService_1.sendEmail).not.toHaveBeenCalled();
    });
    it('the single-voucher helper still works', async () => {
        const { booking, voucherPath, voucherCode } = voucher(1);
        await mail.sendGiftVoucherMail({ booking, voucherPath, voucherCode });
        expect(mailService_1.sendEmail).toHaveBeenCalledTimes(1);
        expect(html()).toContain('BPCODE0001');
    });
});
describe('standard booking confirmation after a voucher is redeemed', () => {
    const redeemed = {
        order: { orderNumber: 'WB-123', grandTotal: 249 },
        bookingsData: [
            {
                booking: {
                    customer: { firstName: 'Mia', lastName: 'K', phone: '050', email: 'mia@example.com' },
                    bookingDate: '2027-01-15',
                    totalPeople: 1,
                    items: [{ optionTitle: 'Ceramic Clay - Kids', people: 1 }],
                },
                workshop: { title: 'Pottery Wheel Experience' },
                slot: { startTime: '6:00 PM', endTime: '7:30 PM' },
            },
        ],
        to: 'mia@example.com',
        cc: ['sara@example.com'],
    };
    it('shows the voucher code, the date and time, and no price', async () => {
        await mail.sendWorkshopBookingConfirmationMail({ ...redeemed, voucherCode: 'BP966FD45A' });
        expect(html()).toContain('BP966FD45A');
        expect(html()).toContain('6:00 PM - 7:30 PM');
        expect(html()).toContain('January 15, 2027');
        expect(html()).toContain('Paid by gift voucher');
        expect(html()).not.toContain('249 AED');
        expect(sent()[5]).toEqual(['sara@example.com']);
    });
    it('an ordinary booking is unchanged: no voucher row, the amount is shown', async () => {
        await mail.sendWorkshopBookingConfirmationMail(redeemed);
        expect(html()).not.toContain('Voucher Code');
        expect(html()).toContain('Amount Paid');
        expect(html()).toContain('249 AED');
    });
});
