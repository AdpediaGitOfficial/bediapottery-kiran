"use strict";
/**
 * The payment check asks Stripe whether a pending order was paid and confirms it,
 * so a confirmation no longer depends on Stripe's webhook reaching the server.
 *
 * Stripe and the repo are faked; the real check logic runs. What matters: only a
 * paid page whose order and amount match is confirmed, an order is confirmed
 * through the shared use case (which is what makes it once-only), and one bad
 * order never stops the others.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ORDER_ID = '6a8d776872270315b88c5f01';
const OTHER_ID = '6a8d776872270315b88c5f02';
jest.mock('../../config/stripe', () => ({
    stripe: { checkout: { sessions: { retrieve: jest.fn() } } },
}));
jest.mock('../repos/workshopRepo', () => ({
    findOrdersAwaitingPaymentCheckRepo: jest.fn(),
    findOrderForPaymentCheckRepo: jest.fn(),
    markOrderPaymentCheckedRepo: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('./confirmPaidOrderUseCase', () => ({
    confirmPaidOrderUseCase: jest.fn(),
}));
const stripe_1 = require("../../config/stripe");
const workshopRepo_1 = require("../repos/workshopRepo");
const confirmPaidOrderUseCase_1 = require("./confirmPaidOrderUseCase");
const check = require("./orderPaymentCheckUseCase");
const retrieve = stripe_1.stripe.checkout.sessions.retrieve;
const order = (overrides = {}) => ({
    _id: ORDER_ID,
    orderNumber: 'ORD-1',
    stripeSessionId: 'cs_test_1',
    grandTotal: 784.35,
    currency: 'AED',
    paymentStatus: 'pending',
    ...overrides,
});
const session = (overrides = {}) => ({
    id: 'cs_test_1',
    metadata: { orderId: ORDER_ID },
    payment_status: 'paid',
    status: 'complete',
    amount_total: 78435,
    currency: 'aed',
    payment_intent: 'pi_1',
    ...overrides,
});
beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    confirmPaidOrderUseCase_1.confirmPaidOrderUseCase.mockResolvedValue('confirmed');
    workshopRepo_1.markOrderPaymentCheckedRepo.mockResolvedValue(undefined);
});
describe('checking one order with Stripe', () => {
    it('a paid page is confirmed through the shared use case, with the payment id', async () => {
        retrieve.mockResolvedValue(session());
        await expect(check.checkOrderPaymentUseCase(order())).resolves.toBe('confirmed');
        expect(retrieve).toHaveBeenCalledWith('cs_test_1');
        expect(confirmPaidOrderUseCase_1.confirmPaidOrderUseCase).toHaveBeenCalledTimes(1);
        expect(confirmPaidOrderUseCase_1.confirmPaidOrderUseCase).toHaveBeenCalledWith(ORDER_ID, 'pi_1');
    });
    it('reads the payment id when Stripe sends the payment as an object', async () => {
        retrieve.mockResolvedValue(session({ payment_intent: { id: 'pi_obj' } }));
        await check.checkOrderPaymentUseCase(order());
        expect(confirmPaidOrderUseCase_1.confirmPaidOrderUseCase).toHaveBeenCalledWith(ORDER_ID, 'pi_obj');
    });
    it('an order the webhook already confirmed is reported as already processed', async () => {
        retrieve.mockResolvedValue(session());
        confirmPaidOrderUseCase_1.confirmPaidOrderUseCase.mockResolvedValue('already-processed');
        await expect(check.checkOrderPaymentUseCase(order())).resolves.toBe('already-processed');
    });
    it('an unpaid page confirms nothing and is only noted as checked', async () => {
        retrieve.mockResolvedValue(session({ payment_status: 'unpaid', status: 'open' }));
        await expect(check.checkOrderPaymentUseCase(order())).resolves.toBe('unpaid');
        expect(confirmPaidOrderUseCase_1.confirmPaidOrderUseCase).not.toHaveBeenCalled();
        expect(workshopRepo_1.markOrderPaymentCheckedRepo).toHaveBeenCalledWith(ORDER_ID);
    });
    it('an expired page is marked so it is not asked about again', async () => {
        retrieve.mockResolvedValue(session({ payment_status: 'unpaid', status: 'expired' }));
        await expect(check.checkOrderPaymentUseCase(order())).resolves.toBe('expired');
        expect(workshopRepo_1.markOrderPaymentCheckedRepo).toHaveBeenCalledWith(ORDER_ID, 'expired');
        expect(confirmPaidOrderUseCase_1.confirmPaidOrderUseCase).not.toHaveBeenCalled();
    });
    it('a paid page for a different amount is not confirmed', async () => {
        retrieve.mockResolvedValue(session({ amount_total: 100 }));
        await expect(check.checkOrderPaymentUseCase(order())).resolves.toBe('mismatch');
        expect(confirmPaidOrderUseCase_1.confirmPaidOrderUseCase).not.toHaveBeenCalled();
    });
    it('a paid page in a different currency is not confirmed', async () => {
        retrieve.mockResolvedValue(session({ currency: 'usd' }));
        await expect(check.checkOrderPaymentUseCase(order())).resolves.toBe('mismatch');
        expect(confirmPaidOrderUseCase_1.confirmPaidOrderUseCase).not.toHaveBeenCalled();
    });
    it('a payment page that belongs to another order is not confirmed', async () => {
        retrieve.mockResolvedValue(session({ metadata: { orderId: OTHER_ID } }));
        await expect(check.checkOrderPaymentUseCase(order())).resolves.toBe('mismatch');
        expect(confirmPaidOrderUseCase_1.confirmPaidOrderUseCase).not.toHaveBeenCalled();
    });
    it('rounds the order total to the cent before comparing it with Stripe', async () => {
        // 37.35 + 747 can come out as 784.3499999999999 in floating point
        retrieve.mockResolvedValue(session());
        await expect(check.checkOrderPaymentUseCase(order({ grandTotal: 747 + 37.35 }))).resolves.toBe('confirmed');
    });
    it('hands a Stripe failure to the caller', async () => {
        retrieve.mockRejectedValue(new Error('Stripe is down'));
        await expect(check.checkOrderPaymentUseCase(order())).rejects.toThrow('Stripe is down');
    });
});
describe('the scheduled round', () => {
    const NOW = Date.UTC(2026, 10, 27, 12, 0, 0);
    it('asks only about recent pending orders, newest window first', async () => {
        workshopRepo_1.findOrdersAwaitingPaymentCheckRepo.mockResolvedValue([]);
        await check.runPaymentCheckPass({ lookbackHours: 72, limit: 50, now: NOW });
        const args = workshopRepo_1.findOrdersAwaitingPaymentCheckRepo.mock.calls[0][0];
        expect(args.limit).toBe(50);
        expect(args.since.getTime()).toBe(NOW - 72 * 60 * 60 * 1000);
    });
    it('confirms the paid ones, skips the rest, and counts them', async () => {
        workshopRepo_1.findOrdersAwaitingPaymentCheckRepo.mockResolvedValue([
            order({ _id: 'a', stripeSessionId: 'cs_a' }),
            order({ _id: 'b', stripeSessionId: 'cs_b' }),
            order({ _id: 'c', stripeSessionId: 'cs_c' }),
        ]);
        retrieve.mockImplementation(async (id) => {
            if (id === 'cs_a')
                return session({ metadata: { orderId: 'a' }, payment_intent: 'pi_a' });
            if (id === 'cs_b')
                return session({ metadata: { orderId: 'b' }, payment_status: 'unpaid', status: 'expired' });
            return session({ metadata: { orderId: 'c' }, payment_status: 'unpaid', status: 'open' });
        });
        const summary = await check.runPaymentCheckPass({ now: NOW });
        expect(summary).toEqual({ scanned: 3, confirmed: 1, expired: 1, errors: 0 });
        expect(confirmPaidOrderUseCase_1.confirmPaidOrderUseCase).toHaveBeenCalledTimes(1);
        expect(confirmPaidOrderUseCase_1.confirmPaidOrderUseCase).toHaveBeenCalledWith('a', 'pi_a');
    });
    it('one order that cannot be checked does not stop the others', async () => {
        workshopRepo_1.findOrdersAwaitingPaymentCheckRepo.mockResolvedValue([
            order({ _id: 'a', stripeSessionId: 'cs_a' }),
            order({ _id: 'b', stripeSessionId: 'cs_b' }),
        ]);
        retrieve.mockImplementation(async (id) => {
            if (id === 'cs_a')
                throw new Error('No such checkout.session');
            return session({ metadata: { orderId: 'b' }, payment_intent: 'pi_b' });
        });
        const summary = await check.runPaymentCheckPass({ now: NOW });
        expect(summary).toEqual({ scanned: 2, confirmed: 1, expired: 0, errors: 1 });
        expect(confirmPaidOrderUseCase_1.confirmPaidOrderUseCase).toHaveBeenCalledWith('b', 'pi_b');
        // one summary line for the round, not one per failing order
        expect(console.error).toHaveBeenCalledTimes(1);
    });
    it('an order that fails to confirm is counted and the round goes on', async () => {
        workshopRepo_1.findOrdersAwaitingPaymentCheckRepo.mockResolvedValue([
            order({ _id: 'a', stripeSessionId: 'cs_a' }),
            order({ _id: 'b', stripeSessionId: 'cs_b' }),
        ]);
        retrieve.mockImplementation(async (id) => session({ metadata: { orderId: id === 'cs_a' ? 'a' : 'b' } }));
        confirmPaidOrderUseCase_1.confirmPaidOrderUseCase.mockRejectedValueOnce(new Error('db down')).mockResolvedValueOnce('confirmed');
        const summary = await check.runPaymentCheckPass({ now: NOW });
        expect(summary).toEqual({ scanned: 2, confirmed: 1, expired: 0, errors: 1 });
    });
});
describe('the success page asking about its own order', () => {
    const NOW = Date.UTC(2026, 10, 27, 12, 0, 0);
    it('is "not-found" for a bad reference or a missing order', async () => {
        await expect(check.checkOrderPaymentByIdUseCase('nope', NOW)).resolves.toBe('not-found');
        workshopRepo_1.findOrderForPaymentCheckRepo.mockResolvedValue(null);
        await expect(check.checkOrderPaymentByIdUseCase(ORDER_ID, NOW)).resolves.toBe('not-found');
        expect(retrieve).not.toHaveBeenCalled();
    });
    it('is "paid" at once for an order already paid, without asking Stripe', async () => {
        workshopRepo_1.findOrderForPaymentCheckRepo.mockResolvedValue(order({ paymentStatus: 'paid' }));
        await expect(check.checkOrderPaymentByIdUseCase(ORDER_ID, NOW)).resolves.toBe('paid');
        expect(retrieve).not.toHaveBeenCalled();
    });
    it('is "pending" for an order with no payment page to ask about', async () => {
        workshopRepo_1.findOrderForPaymentCheckRepo.mockResolvedValue(order({ stripeSessionId: undefined }));
        await expect(check.checkOrderPaymentByIdUseCase(ORDER_ID, NOW)).resolves.toBe('pending');
        expect(retrieve).not.toHaveBeenCalled();
    });
    it('does not ask Stripe again within a few seconds', async () => {
        workshopRepo_1.findOrderForPaymentCheckRepo.mockResolvedValue(order({ paymentCheckedAt: new Date(NOW - 1000) }));
        await expect(check.checkOrderPaymentByIdUseCase(ORDER_ID, NOW)).resolves.toBe('pending');
        expect(retrieve).not.toHaveBeenCalled();
    });
    it('asks Stripe once the pause is over, and answers "paid" when it was', async () => {
        workshopRepo_1.findOrderForPaymentCheckRepo.mockResolvedValue(order({ paymentCheckedAt: new Date(NOW - check.RECHECK_THROTTLE_MS - 1) }));
        retrieve.mockResolvedValue(session());
        await expect(check.checkOrderPaymentByIdUseCase(ORDER_ID, NOW)).resolves.toBe('paid');
        expect(confirmPaidOrderUseCase_1.confirmPaidOrderUseCase).toHaveBeenCalledTimes(1);
    });
    it('answers "pending" when Stripe says it is not paid yet', async () => {
        workshopRepo_1.findOrderForPaymentCheckRepo.mockResolvedValue(order());
        retrieve.mockResolvedValue(session({ payment_status: 'unpaid', status: 'open' }));
        await expect(check.checkOrderPaymentByIdUseCase(ORDER_ID, NOW)).resolves.toBe('pending');
    });
    it('answers "pending", never an error, when Stripe cannot be reached', async () => {
        workshopRepo_1.findOrderForPaymentCheckRepo.mockResolvedValue(order());
        retrieve.mockRejectedValue(new Error('network'));
        await expect(check.checkOrderPaymentByIdUseCase(ORDER_ID, NOW)).resolves.toBe('pending');
    });
});
