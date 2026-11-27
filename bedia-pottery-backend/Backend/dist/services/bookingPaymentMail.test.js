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
        expect(h).not.toContain('Subtotal');
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
        expect(html()).not.toContain('Subtotal');
        expect(html()).toContain('1045.80 AED');
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
describe('standard booking confirmation: Air-Dry Clay Wheel Pottery and Handbuilding sessions', () => {
    const airDry = (extra = {}) => ({
        customer,
        bookingDate: '2027-01-15',
        totalPeople: 14,
        totalAmount: 3486,
        items: [{ optionTitle: 'Air-Dry Clay', people: 14, price: 249, subtotal: 3486, wheelPottery: 10, handBuild: 4, ...extra }],
    });
    const send = (booking) => mail.sendWorkshopBookingConfirmationMail({ order: order(), bookingsData: [entry(booking, 'Birthday Package')] });
    it('shows how many Wheel Pottery and how many Handbuilding sessions were chosen', async () => {
        await send(airDry());
        const h = html();
        expect(h).toContain('Air-Dry Clay');
        expect(h).toMatch(/Wheel Pottery sessions<\/td>\s*<td[^>]*>10<\/td>/);
        expect(h).toMatch(/Handbuilding sessions<\/td>\s*<td[^>]*>4<\/td>/);
        expect(h).not.toContain('Additional Handbuilding');
    });
    it('shows both counts together, a zero included', async () => {
        await send(airDry({ wheelPottery: 12, handBuild: 0 }));
        expect(html()).toMatch(/Wheel Pottery sessions<\/td>\s*<td[^>]*>12<\/td>/);
        expect(html()).toMatch(/Handbuilding sessions<\/td>\s*<td[^>]*>0<\/td>/);
        mailService_1.sendEmail.mockClear();
        await send(airDry({ wheelPottery: 0, handBuild: 14 }));
        expect(html()).toMatch(/Wheel Pottery sessions<\/td>\s*<td[^>]*>0<\/td>/);
        expect(html()).toMatch(/Handbuilding sessions<\/td>\s*<td[^>]*>14<\/td>/);
    });
    it('treats a count that is missing as zero when the other one is given', async () => {
        await send(airDry({ wheelPottery: 5, handBuild: undefined }));
        expect(html()).toMatch(/Wheel Pottery sessions<\/td>\s*<td[^>]*>5<\/td>/);
        expect(html()).toMatch(/Handbuilding sessions<\/td>\s*<td[^>]*>0<\/td>/);
    });
    it('recognises the clay however it is written', async () => {
        for (const title of ['Air Dry Clay', 'air-dry clay', 'Air-Dry Clay - Adults']) {
            mailService_1.sendEmail.mockClear();
            await send(airDry({ optionTitle: title }));
            expect(html()).toContain('Wheel Pottery sessions');
            expect(html()).toContain('Handbuilding sessions');
        }
    });
    it('adds nothing for another clay, even when it carries the same counts', async () => {
        await send(airDry({ optionTitle: 'Ceramic Clay' }));
        expect(html()).not.toContain('Wheel Pottery sessions');
        expect(html()).not.toContain('Handbuilding sessions');
    });
    it('adds nothing for an Air-Dry booking that has no split', async () => {
        await send(airDry({ wheelPottery: undefined, handBuild: undefined }));
        expect(html()).not.toContain('Wheel Pottery sessions');
        expect(html()).not.toContain('Handbuilding sessions');
    });
    it('each Air-Dry line of a booking shows its own counts', async () => {
        const booking = airDry();
        booking.items.push({ optionTitle: 'Air-Dry Clay', people: 2, price: 249, subtotal: 498, wheelPottery: 2, handBuild: 0 });
        await send(booking);
        expect(html().match(/Wheel Pottery sessions/g)).toHaveLength(2);
        expect(html().match(/Handbuilding sessions/g)).toHaveLength(2);
    });
});
describe('standard booking confirmation: Family Pottery Workshop', () => {
    // Two adults and one kid: the package covers one adult and one kid, the second adult is an extra.
    const airDryWheel = {
        optionTitle: 'Air-Dry Clay',
        people: 3,
        adult: 2,
        child: 1,
        wheelPottery: 3,
        handBuild: 0,
        price: 400,
        subtotal: 635,
        priceBreakdown: [
            { label: 'Air-Dry Clay (1 Adult + 1 Child)', unitPrice: 400, quantity: 1, amount: 400 },
            { label: 'Air-Dry Clay Extra Adult', unitPrice: 235, quantity: 1, amount: 235 },
        ],
    };
    const terracottaHand = {
        optionTitle: 'Terracotta Clay',
        people: 3,
        adult: 2,
        child: 1,
        wheelPottery: 0,
        handBuild: 3,
        price: 450,
        subtotal: 695,
        priceBreakdown: [
            { label: 'Terracotta Clay (1 Adult + 1 Child)', unitPrice: 450, quantity: 1, amount: 450 },
            { label: 'Terracotta Clay Extra Adult', unitPrice: 245, quantity: 1, amount: 245 },
        ],
    };
    const family = (items) => ({
        customer,
        bookingDate: '2026-12-01',
        totalPeople: items.reduce((sum, i) => sum + i.people, 0),
        totalAmount: items.reduce((sum, i) => sum + i.subtotal, 0),
        items,
    });
    const send = (items, orderOverrides = {}) => mail.sendWorkshopBookingConfirmationMail({
        order: order({ subtotal: 1330, taxAmount: 66.5, grandTotal: 1396.5, ...orderOverrides }),
        bookingsData: [entry(family(items), 'Family Pottery Workshop')],
    });
    // the text of a row, ignoring the markup
    const rows = () => html()
        .replace(/<style[\s\S]*?<\/style>/g, '')
        .replace(/<[^>]+>/g, '|')
        .replace(/\s+/g, ' ');
    it("says whether each line is for the wheel or for handbuilding, and how many adults and kids", async () => {
        await send([airDryWheel, terracottaHand]);
        const text = rows();
        expect(text).toMatch(/Air-Dry Clay &ndash; Wheel[\s|]*2 Adults, 1 Kid/);
        expect(text).toMatch(/Terracotta Clay &ndash; Handbuilding[\s|]*2 Adults, 1 Kid/);
    });
    it('does not print a bare guest total or the Birthday wheel and handbuilding lines for a family', async () => {
        await send([airDryWheel, terracottaHand]);
        expect(html()).not.toContain('3 Guests');
        expect(html()).not.toContain('Wheel Pottery sessions');
        expect(html()).not.toContain('Handbuilding sessions');
    });
    it('shows the package and the extra adult as their own price lines, adding up to the total', async () => {
        await send([airDryWheel, terracottaHand]);
        const h = html();
        expect(h).toContain('Air-Dry Clay (1 Adult + 1 Child)');
        expect(h).toContain('400.00 AED');
        expect(h).toContain('Air-Dry Clay Extra Adult');
        expect(h).toContain('235.00 AED');
        expect(h).toContain('Terracotta Clay (1 Adult + 1 Child)');
        expect(h).toContain('450.00 AED');
        expect(h).toContain('Terracotta Clay Extra Adult');
        expect(h).toContain('245.00 AED');
        expect(h).toContain('VAT (5%)');
        expect(h).toContain('1396.50 AED');
        // 400 + 235 + 450 + 245 = 1330, the order's subtotal
        expect(400 + 235 + 450 + 245).toBe(1330);
    });
    it('says "× 2" when an extra is charged twice', async () => {
        const twoKidsExtra = {
            ...terracottaHand,
            people: 5,
            adult: 2,
            child: 3,
            subtotal: 450 + 245 + 2 * 175,
            priceBreakdown: [
                { label: 'Terracotta Clay (1 Adult + 1 Child)', unitPrice: 450, quantity: 1, amount: 450 },
                { label: 'Terracotta Clay Extra Adult', unitPrice: 245, quantity: 1, amount: 245 },
                { label: 'Terracotta Clay Extra Child', unitPrice: 175, quantity: 2, amount: 350 },
            ],
        };
        await send([twoKidsExtra], { subtotal: 1045, taxAmount: 52.25, grandTotal: 1097.25 });
        expect(html()).toContain('Terracotta Clay Extra Child &times; 2');
        expect(html()).toContain('350.00 AED');
        expect(rows()).toMatch(/2 Adults, 3 Kids/);
    });
    it('uses the singular for one adult or one kid, and leaves out a group that is not there', async () => {
        for (const [adult, child, expected] of [
            [1, 1, '1 Adult, 1 Kid'],
            [3, 0, '3 Adults'],
            [0, 2, '2 Kids'],
        ]) {
            mailService_1.sendEmail.mockClear();
            await send([{ ...airDryWheel, adult, child, people: adult + child, priceBreakdown: undefined }], { subtotal: 635, taxAmount: 31.75, grandTotal: 666.75 });
            expect(rows()).toContain(expected);
        }
    });
    it('names no making type when the booking does not say', async () => {
        await send([{ ...airDryWheel, wheelPottery: 0, handBuild: 0 }], { subtotal: 635, taxAmount: 31.75, grandTotal: 666.75 });
        expect(rows()).toMatch(/Air-Dry Clay[\s|]*2 Adults, 1 Kid/);
        expect(html()).not.toContain('&ndash;');
    });
    it('falls back to one price line when there is no saved breakdown, or it does not add up', async () => {
        await send([{ ...airDryWheel, priceBreakdown: undefined }], { subtotal: 635, taxAmount: 31.75, grandTotal: 666.75 });
        expect(html()).toContain('Air-Dry Clay (3 guests)');
        expect(html()).toContain('635.00 AED');
        mailService_1.sendEmail.mockClear();
        await send([{ ...airDryWheel, subtotal: 999 }], { subtotal: 999, taxAmount: 49.95, grandTotal: 1048.95 });
        expect(html()).toContain('Air-Dry Clay (3 guests)');
        expect(html()).not.toContain('Air-Dry Clay Extra Adult');
    });
    it('writes breakdown labels as text, never as markup', async () => {
        const bad = { ...airDryWheel, priceBreakdown: [
            { label: '<i onmouseover=x>Pack</i>', unitPrice: 400, quantity: 1, amount: 400 },
            { label: 'Extra', unitPrice: 235, quantity: 1, amount: 235 },
        ] };
        await send([bad], { subtotal: 635, taxAmount: 31.75, grandTotal: 666.75 });
        expect(html()).not.toContain('<i onmouseover');
        expect(html()).toContain('&lt;i onmouseover=x&gt;Pack&lt;/i&gt;');
    });
    it('leaves Birthday and ordinary bookings alone: no adults or kids, so no family wording', async () => {
        await mail.sendWorkshopBookingConfirmationMail({
            order: order(),
            bookingsData: [entry(sessionBooking())],
        });
        expect(html()).toContain('3 Guests');
        expect(html()).not.toMatch(/\d+ Adults?(, \d+ Kids?)?<\/td>/);
        expect(html()).not.toMatch(/\d+ Kids?</);
    });
});
