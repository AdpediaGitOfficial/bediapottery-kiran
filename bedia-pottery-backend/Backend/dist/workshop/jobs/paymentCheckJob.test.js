"use strict";
/**
 * The payment check job: it can be switched off, a round never overlaps the
 * previous one, and a failing round never takes the server down.
 */
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('../../config/logger', () => ({
    __esModule: true,
    default: { info: jest.fn(), error: jest.fn() },
}));
jest.mock('../useCases/orderPaymentCheckUseCase', () => ({
    runPaymentCheckPass: jest.fn(),
}));
const orderPaymentCheckUseCase_1 = require("../useCases/orderPaymentCheckUseCase");
const job = require("./paymentCheckJob");
beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    delete process.env.PAYMENT_CHECK_ENABLED;
    delete process.env.PAYMENT_CHECK_INTERVAL_MINUTES;
    delete process.env.PAYMENT_CHECK_LOOKBACK_HOURS;
});
afterEach(() => {
    job.stopPaymentCheckJob();
    jest.useRealTimers();
});
describe('switching the job off', () => {
    it('is on unless PAYMENT_CHECK_ENABLED says no', () => {
        expect(job.isPaymentCheckEnabled({})).toBe(true);
        expect(job.isPaymentCheckEnabled({ PAYMENT_CHECK_ENABLED: 'true' })).toBe(true);
        for (const off of ['false', 'FALSE', '0', 'off', 'no', ' false ']) {
            expect(job.isPaymentCheckEnabled({ PAYMENT_CHECK_ENABLED: off })).toBe(false);
        }
    });
    it('does not run at all when it is switched off', async () => {
        process.env.PAYMENT_CHECK_ENABLED = 'false';
        job.startPaymentCheckJob();
        await jest.advanceTimersByTimeAsync(60 * 60 * 1000);
        expect(orderPaymentCheckUseCase_1.runPaymentCheckPass).not.toHaveBeenCalled();
    });
});
describe('the schedule', () => {
    it('runs once shortly after start-up and then every few minutes', async () => {
        orderPaymentCheckUseCase_1.runPaymentCheckPass.mockResolvedValue({ scanned: 0, confirmed: 0, expired: 0, errors: 0 });
        job.startPaymentCheckJob();
        expect(orderPaymentCheckUseCase_1.runPaymentCheckPass).not.toHaveBeenCalled();
        await jest.advanceTimersByTimeAsync(46 * 1000);
        expect(orderPaymentCheckUseCase_1.runPaymentCheckPass).toHaveBeenCalledTimes(1);
        await jest.advanceTimersByTimeAsync(3 * 60 * 1000);
        expect(orderPaymentCheckUseCase_1.runPaymentCheckPass.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
    it('passes the look-back window from the settings', async () => {
        process.env.PAYMENT_CHECK_LOOKBACK_HOURS = '24';
        orderPaymentCheckUseCase_1.runPaymentCheckPass.mockResolvedValue({ scanned: 0, confirmed: 0, expired: 0, errors: 0 });
        await job.runPaymentCheckRound();
        expect(orderPaymentCheckUseCase_1.runPaymentCheckPass).toHaveBeenCalledWith({ lookbackHours: 24 });
    });
    it('starting twice does not schedule twice', async () => {
        orderPaymentCheckUseCase_1.runPaymentCheckPass.mockResolvedValue({ scanned: 0, confirmed: 0, expired: 0, errors: 0 });
        job.startPaymentCheckJob();
        job.startPaymentCheckJob();
        await jest.advanceTimersByTimeAsync(46 * 1000);
        expect(orderPaymentCheckUseCase_1.runPaymentCheckPass).toHaveBeenCalledTimes(1);
    });
});
describe('one round', () => {
    it('does not start while the previous round is still running', async () => {
        let finish;
        orderPaymentCheckUseCase_1.runPaymentCheckPass.mockReturnValueOnce(new Promise((resolve) => {
            finish = resolve;
        }));
        const first = job.runPaymentCheckRound();
        const second = await job.runPaymentCheckRound();
        expect(second).toBeNull();
        expect(orderPaymentCheckUseCase_1.runPaymentCheckPass).toHaveBeenCalledTimes(1);
        finish({ scanned: 0, confirmed: 0, expired: 0, errors: 0 });
        await first;
    });
    it('a failing round is logged and the next one can run', async () => {
        orderPaymentCheckUseCase_1.runPaymentCheckPass.mockRejectedValueOnce(new Error('db down'));
        await expect(job.runPaymentCheckRound()).resolves.toBeNull();
        orderPaymentCheckUseCase_1.runPaymentCheckPass.mockResolvedValueOnce({ scanned: 1, confirmed: 1, expired: 0, errors: 0 });
        await expect(job.runPaymentCheckRound()).resolves.toEqual({ scanned: 1, confirmed: 1, expired: 0, errors: 0 });
    });
});
