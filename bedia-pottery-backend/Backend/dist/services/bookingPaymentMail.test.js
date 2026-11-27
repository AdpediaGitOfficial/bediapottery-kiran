"use strict";
/**
 * The booking confirmation shows the payment: what was paid for, the VAT, the
 * total, the payment date and the payment reference. An order without a
 * breakdown keeps its single amount line, and a voucher redemption shows no
 * amounts at all.
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
const customer = { firstName: 'Mia', lastName: 'Khan', phone: '+971 50 000 0000', email: 'mia@example.com' };
const sessionBooking = (overrides = {}) => ({
    customer,
    bookingDate: '2027-01-15',
    totalPeople: 3,
    totalAmount: 747,
    items: [{ optionTitle: 'Ceramic Clay - Adults', people: 3, price: 249, subtotal: 747 }],
    ...overrides,
});
const entry = (booking = sessionBooking(), title = 'Pottery Wheel Experience') => ({
    booking,
    workshop: { title },
    slot: { startTime: '6:00 PM', endTime: '7:30 PM' },
});
const order = (overrides = {}) => ({
    orderNumber: 'WB-1790000000-421',
    subtotal: 747,
    taxPercent: 5,
    taxAmount: 37.35,
    grandTotal: 784.35,
    currency: 'AED',
    paymentId: 'pi_3Test123',
    updatedAt: '2026-11-24T10:00:00.000Z',
    ...overrides,
});
const html = () => mailService_1.sendEmail.mock.calls[0][3];
beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
});
describe('standard booking confirmation: payment', () => {
    it('lists what was paid for, the VAT, the total, the date and the reference', async () => {
        await mail.sendWorkshopBookingConfirmationMail({ order: order(), bookingsData: [entry()] });
        const h = html();
        expect(h).toContain('Payment');
        expect(h).toContain('Ceramic Clay - Adults (3 guests)');
        expect(h).toContain('747.00 AED');
        expect(h).toContain('Subtotal');
        expect(h).toContain('VAT (5%)');
        expect(h).toContain('37.35 AED');
        expect(h).toContain('Total paid');
        expect(h).toContain('784.35 AED');
        expect(h).toContain('Payment date');
        expect(h).toContain('24 November 2026');
        expect(h).toContain('Payment reference');
        expect(h).toContain('pi_3Test123');
        // the total is shown once, in the payment section, not also as "Amount Paid"
        expect(h).not.toContain('Amount Paid');
        // the event details are still there
        expect(h).toContain('6:00 PM - 7:30 PM');
        expect(h).toContain('January 15, 2027');
    });
    it('leaves out the VAT line when there is no VAT, and the reference when there is none', async () => {
        await mail.sendWorkshopBookingConfirmationMail({
            order: order({ taxPercent: 0, taxAmount: 0, grandTotal: 747, paymentId: undefined }),
            bookingsData: [entry()],
        });
        expect(html()).not.toContain('VAT');
        expect(html()).not.toContain('Payment reference');
        expect(html()).toContain('Total paid');
    });
    it('two sessions in one order: each line says which workshop it belongs to', async () => {
        const second = sessionBooking({
            totalAmount: 249,
            totalPeople: 1,
            items: [{ optionTitle: 'Air-Dry Clay', people: 1, price: 249, subtotal: 249 }],
        });
        await mail.sendWorkshopBookingConfirmationMail({
            order: order({ subtotal: 996, taxAmount: 49.8, grandTotal: 1045.8 }),
            bookingsData: [entry(), entry(second, 'Birthday Package')],
        });
        expect(html()).toContain('Pottery Wheel Experience: Ceramic Clay - Adults (3 guests)');
        expect(html()).toContain('Birthday Package: Air-Dry Clay (1 guest)');
        expect(html()).toContain('1045.80 AED');
    });
    it('a session bought with a gift voucher: the voucher is one line, so the lines add up', async () => {
        await mail.sendWorkshopBookingConfirmationMail({
            order: order({ subtotal: 996, taxAmount: 49.8, grandTotal: 1045.8 }),
            bookingsData: [entry()],
        });
        expect(html()).toContain('Gift vouchers (sent in a separate email)');
        expect(html()).toContain('249.00 AED');
        expect(html()).toContain('Subtotal');
        expect(html()).toContain('996.00 AED');
    });
    it('writes what a customer or workshop is called as text, never as markup', async () => {
        const booking = sessionBooking({
            items: [{ optionTitle: '<b onmouseover=x>Clay</b>', people: 1, price: 747, subtotal: 747 }],
        });
        await mail.sendWorkshopBookingConfirmationMail({ order: order(), bookingsData: [entry(booking)] });
        expect(html()).not.toContain('<b onmouseover');
        expect(html()).toContain('&lt;b onmouseover=x&gt;Clay&lt;/b&gt;');
    });
    it('an order with only a total keeps its single "Amount Paid" line', async () => {
        await mail.sendWorkshopBookingConfirmationMail({
            order: { orderNumber: 'WB-1', grandTotal: 249 },
            bookingsData: [entry()],
        });
        expect(html()).toContain('Amount Paid');
        expect(html()).toContain('249 AED');
        expect(html()).not.toContain('Payment reference');
    });
    it('a voucher redemption shows no amounts, only that the voucher paid', async () => {
        await mail.sendWorkshopBookingConfirmationMail({
            order: order(),
            bookingsData: [entry()],
            voucherCode: 'BP966FD45A',
        });
        expect(html()).toContain('BP966FD45A');
        expect(html()).toContain('Paid by gift voucher');
        expect(html()).not.toContain('Subtotal');
        expect(html()).not.toContain('Total paid');
        expect(html()).not.toContain('784.35');
    });
});
describe('Bedia Prive confirmation: payment', () => {
    it('shows the same payment lines after the package', async () => {
        await mail.sendPriveBookingConfirmationMail({ order: order(), bookingsData: [entry()] });
        const h = html();
        expect(h).toContain('Package');
        expect(h).toContain('VAT (5%)');
        expect(h).toContain('Total paid');
        expect(h).toContain('784.35 AED');
        expect(h).toContain('pi_3Test123');
        expect(h).not.toContain('>Amount<');
    });
    it('an order with only a total keeps its single "Amount" line', async () => {
        await mail.sendPriveBookingConfirmationMail({
            order: { orderNumber: 'WB-1', grandTotal: 500 },
            bookingsData: [entry()],
        });
        expect(html()).toContain('>Amount<');
        expect(html()).toContain('500 AED');
    });
});
describe('standard booking confirmation: Air-Dry Clay session split', () => {
    const airDry = (extra = {}) => ({
        customer,
        bookingDate: '2027-01-15',
        totalPeople: 14,
        totalAmount: 3486,
        items: [{ optionTitle: 'Air-Dry Clay', people: 14, price: 249, subtotal: 3486, wheelPottery: 10, handBuild: 4, ...extra }],
    });
    const send = (booking) => mail.sendWorkshopBookingConfirmationMail({ order: order(), bookingsData: [entry(booking, 'Birthday Package')] });
    it('shows how many Wheel Pottery and how many Additional Handbuilding sessions were chosen', async () => {
        await send(airDry());
        const h = html();
        expect(h).toContain('Air-Dry Clay');
        expect(h).toMatch(/Wheel Pottery sessions<\/td>\s*<td[^>]*>10<\/td>/);
        expect(h).toMatch(/Additional Handbuilding sessions<\/td>\s*<td[^>]*>4<\/td>/);
    });
    it('shows a zero too, so the customer sees the whole split', async () => {
        await send(airDry({ wheelPottery: 12, handBuild: 0 }));
        expect(html()).toMatch(/Wheel Pottery sessions<\/td>\s*<td[^>]*>12<\/td>/);
        expect(html()).toMatch(/Additional Handbuilding sessions<\/td>\s*<td[^>]*>0<\/td>/);
    });
    it('recognises the clay however it is written', async () => {
        for (const title of ['Air Dry Clay', 'air-dry clay', 'Air-Dry Clay - Adults']) {
            mailService_1.sendEmail.mockClear();
            await send(airDry({ optionTitle: title }));
            expect(html()).toContain('Wheel Pottery sessions');
        }
    });
    it('adds nothing for another clay, even when it carries the same counts', async () => {
        await send(airDry({ optionTitle: 'Ceramic Clay' }));
        expect(html()).not.toContain('Wheel Pottery sessions');
        expect(html()).not.toContain('Additional Handbuilding sessions');
    });
    it('adds nothing for an Air-Dry booking that has no split', async () => {
        await send(airDry({ wheelPottery: undefined, handBuild: undefined }));
        expect(html()).not.toContain('Wheel Pottery sessions');
    });
    it('each Air-Dry line of a booking shows its own split', async () => {
        const booking = airDry();
        booking.items.push({ optionTitle: 'Air-Dry Clay', people: 2, price: 249, subtotal: 498, wheelPottery: 2, handBuild: 0 });
        await send(booking);
        expect(html().match(/Wheel Pottery sessions/g)).toHaveLength(2);
    });
});
