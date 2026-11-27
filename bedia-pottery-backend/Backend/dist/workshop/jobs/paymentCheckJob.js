"use strict";
/**
 * Runs the payment check on a schedule, so an order that was paid but whose Stripe
 * webhook never arrived is still confirmed — and its customer still gets the
 * confirmation email — within a few minutes.
 *
 * A plain interval, like the pottery tracking job. Every round is safe to repeat:
 * an order is confirmed once, and a missed round (a restart, a deploy) is made up
 * by the next one.
 *
 * Settings (all optional):
 *   PAYMENT_CHECK_ENABLED          'false' or '0' switches the job off (default: on)
 *   PAYMENT_CHECK_INTERVAL_MINUTES minutes between rounds (default 3)
 *   PAYMENT_CHECK_LOOKBACK_HOURS   how far back pending orders are asked about (default 72)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopPaymentCheckJob = exports.startPaymentCheckJob = exports.runPaymentCheckRound = exports.isPaymentCheckEnabled = void 0;
const logger_1 = __importDefault(require("../../config/logger"));
const orderPaymentCheckUseCase_1 = require("../useCases/orderPaymentCheckUseCase");
const DEFAULT_INTERVAL_MINUTES = 3;
const DEFAULT_LOOKBACK_HOURS = 72;
/** A short delay lets the database connection settle before the first round. */
const STARTUP_DELAY_MS = 45 * 1000;
let timer = null;
let running = false;
const positiveNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const isPaymentCheckEnabled = (env = process.env) => !['false', '0', 'off', 'no'].includes(String(env.PAYMENT_CHECK_ENABLED ?? '').trim().toLowerCase());
exports.isPaymentCheckEnabled = isPaymentCheckEnabled;
/** One round, guarded against overlap with the previous one. */
const runPaymentCheckRound = async () => {
    if (running) {
        logger_1.default.info('Payment check skipped - previous round still running');
        return null;
    }
    running = true;
    try {
        const summary = await (0, orderPaymentCheckUseCase_1.runPaymentCheckPass)({
            lookbackHours: positiveNumber(process.env.PAYMENT_CHECK_LOOKBACK_HOURS, DEFAULT_LOOKBACK_HOURS),
        });
        // Quiet unless something happened, so the log stays readable.
        if (summary.confirmed || summary.errors) {
            logger_1.default.info('Payment check completed', summary);
        }
        return summary;
    }
    catch (error) {
        logger_1.default.error('Payment check failed', { errorMessage: error?.message });
        return null;
    }
    finally {
        running = false;
    }
};
exports.runPaymentCheckRound = runPaymentCheckRound;
const startPaymentCheckJob = () => {
    if (timer)
        return;
    if (!(0, exports.isPaymentCheckEnabled)()) {
        logger_1.default.info('Payment check is switched off (PAYMENT_CHECK_ENABLED)');
        return;
    }
    const intervalMinutes = positiveNumber(process.env.PAYMENT_CHECK_INTERVAL_MINUTES, DEFAULT_INTERVAL_MINUTES);
    timer = setInterval(() => void (0, exports.runPaymentCheckRound)(), intervalMinutes * 60 * 1000);
    // Background upkeep, not a reason for the server to refuse to shut down.
    timer.unref?.();
    setTimeout(() => void (0, exports.runPaymentCheckRound)(), STARTUP_DELAY_MS).unref?.();
    logger_1.default.info(`Payment check scheduled every ${intervalMinutes} minute(s)`);
};
exports.startPaymentCheckJob = startPaymentCheckJob;
const stopPaymentCheckJob = () => {
    if (!timer)
        return;
    clearInterval(timer);
    timer = null;
};
exports.stopPaymentCheckJob = stopPaymentCheckJob;
