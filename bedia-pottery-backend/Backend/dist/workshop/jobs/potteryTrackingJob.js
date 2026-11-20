"use strict";
/**
 * Drives the automatic half of the pottery journey: drying, firing, painting,
 * the three-week ready date, the collection warning and the discard.
 *
 * A plain interval rather than a cron dependency — the work is idempotent and
 * driven entirely by stored dates, so the only thing the schedule affects is
 * how soon a piece is noticed, never whether it is handled correctly. A pass
 * that is missed (a restart, a deploy) is made up in full by the next one.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopPotteryTrackingJob = exports.startPotteryTrackingJob = exports.runTrackingPass = void 0;
const logger_1 = __importDefault(require("../../config/logger"));
const potteryTrackingUseCase_1 = require("../useCases/potteryTrackingUseCase");
/** Stages turn over in days, so hourly is plenty and keeps the load trivial. */
const DEFAULT_INTERVAL_MINUTES = 60;
/** A short delay lets the Mongo connection settle before the first pass. */
const STARTUP_DELAY_MS = 30 * 1000;
let timer = null;
let running = false;
const resolveIntervalMinutes = () => {
    const configured = Number(process.env.TRACKING_JOB_INTERVAL_MINUTES);
    return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_INTERVAL_MINUTES;
};
/**
 * One pass, guarded against overlap.
 *
 * A pass that runs long (a slow SMTP server against a large backlog) would
 * otherwise be joined by the next tick and send the same email twice, since the
 * sent-flags are only written once the mail returns.
 */
const runTrackingPass = async () => {
    if (running) {
        logger_1.default.info('Pottery tracking pass skipped — previous pass still running');
        return;
    }
    running = true;
    try {
        const summary = await (0, potteryTrackingUseCase_1.runTrackingAutomationUseCase)();
        // Quiet unless something actually happened, so the log stays readable.
        if (summary.advanced || summary.discarded || summary.emailed || summary.errors) {
            logger_1.default.info('Pottery tracking pass completed', summary);
        }
    }
    catch (error) {
        logger_1.default.error('Pottery tracking pass failed', { errorMessage: error?.message });
    }
    finally {
        running = false;
    }
};
exports.runTrackingPass = runTrackingPass;
const startPotteryTrackingJob = () => {
    if (timer)
        return;
    const intervalMinutes = resolveIntervalMinutes();
    timer = setInterval(() => void (0, exports.runTrackingPass)(), intervalMinutes * 60 * 1000);
    // Not keeping the process alive on its own account — this is background
    // upkeep, not a reason for the server to refuse to shut down.
    timer.unref?.();
    setTimeout(() => void (0, exports.runTrackingPass)(), STARTUP_DELAY_MS).unref?.();
    logger_1.default.info(`Pottery tracking job scheduled every ${intervalMinutes} minute(s)`);
};
exports.startPotteryTrackingJob = startPotteryTrackingJob;
const stopPotteryTrackingJob = () => {
    if (!timer)
        return;
    clearInterval(timer);
    timer = null;
};
exports.stopPotteryTrackingJob = stopPotteryTrackingJob;
