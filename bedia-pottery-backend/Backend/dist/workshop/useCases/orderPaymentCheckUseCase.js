"use strict";
/**
 * The payment check: asks Stripe itself whether a pending order was paid, so a
 * confirmation no longer depends on Stripe's webhook reaching this server.
 *
 * It is a safety net next to the webhook, not a replacement. Both confirm an order
 * through confirmPaidOrderUseCase, whose first step marks the order paid in one
 * atomic update — so an order is confirmed once, whichever of them gets there first,
 * and the customer gets one confirmation email.
 *
 * Only what Stripe says counts: the payment page is read with the server's own key,
 * and its order id and amount must match the order before anything is confirmed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOrderPaymentByIdUseCase = exports.runPaymentCheckPass = exports.checkOrderPaymentUseCase = exports.RECHECK_THROTTLE_MS = void 0;
const stripe_1 = require("../../config/stripe");
const workshopRepo_1 = require("../repos/workshopRepo");
const confirmPaidOrderUseCase_1 = require("./confirmPaidOrderUseCase");
const objectIdParser_1 = require("../../utils/objectIdParser");
/** The success page may ask repeatedly; Stripe is asked about one order at most this often. */
exports.RECHECK_THROTTLE_MS = 4000;
const toAmountInMinorUnits = (amount) => Math.round(Number(amount) * 100);
/**
 * Asks Stripe about one pending order and confirms it when it was paid.
 * Resolves to 'confirmed', 'already-processed', 'unpaid', 'expired', or 'mismatch'
 * (Stripe's payment page does not belong to this order or does not match its
 * amount — nothing is confirmed). Throws when Stripe cannot be asked.
 */
const checkOrderPaymentUseCase = async (order) => {
    const session = await stripe_1.stripe.checkout.sessions.retrieve(order.stripeSessionId);
    if (session.metadata?.orderId !== String(order._id)) {
        console.error('PAYMENT CHECK: payment page does not belong to the order', String(order._id));
        await (0, workshopRepo_1.markOrderPaymentCheckedRepo)(order._id);
        return 'mismatch';
    }
    if (session.payment_status === 'paid') {
        const sameAmount = session.amount_total === toAmountInMinorUnits(order.grandTotal);
        const sameCurrency = String(session.currency || '').toLowerCase() === String(order.currency || 'AED').toLowerCase();
        if (!sameAmount || !sameCurrency) {
            console.error('PAYMENT CHECK: amount paid does not match the order, not confirming', String(order._id), session.amount_total, session.currency);
            await (0, workshopRepo_1.markOrderPaymentCheckedRepo)(order._id);
            return 'mismatch';
        }
        const paymentId = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || session.id;
        const outcome = await (0, confirmPaidOrderUseCase_1.confirmPaidOrderUseCase)(order._id, paymentId);
        if (outcome === 'confirmed') {
            console.log('PAYMENT CHECK: order confirmed by asking Stripe:', String(order._id));
        }
        return outcome;
    }
    // The page can no longer be paid: do not ask again.
    if (session.status === 'expired') {
        await (0, workshopRepo_1.markOrderPaymentCheckedRepo)(order._id, 'expired');
        return 'expired';
    }
    await (0, workshopRepo_1.markOrderPaymentCheckedRepo)(order._id);
    return 'unpaid';
};
exports.checkOrderPaymentUseCase = checkOrderPaymentUseCase;
/**
 * One round: every recent pending order with a payment page is checked, one after
 * another (Stripe is never hit with a burst). A problem with one order never stops
 * the others.
 */
const runPaymentCheckPass = async ({ lookbackHours = 72, limit = 100, now = Date.now() } = {}) => {
    const since = new Date(now - lookbackHours * 60 * 60 * 1000);
    const orders = await (0, workshopRepo_1.findOrdersAwaitingPaymentCheckRepo)({ since, limit });
    const summary = { scanned: orders.length, confirmed: 0, expired: 0, errors: 0 };
    let firstError = null;
    for (const order of orders) {
        try {
            const outcome = await (0, exports.checkOrderPaymentUseCase)(order);
            if (outcome === 'confirmed')
                summary.confirmed += 1;
            if (outcome === 'expired')
                summary.expired += 1;
        }
        catch (error) {
            summary.errors += 1;
            firstError = firstError || error?.message || String(error);
        }
    }
    if (firstError) {
        // One line per round: an order made through another Stripe account (a shared
        // database) fails every round, and must not fill the log.
        console.error(`PAYMENT CHECK: ${summary.errors} order(s) could not be checked, first problem:`, firstError);
    }
    return summary;
};
exports.runPaymentCheckPass = runPaymentCheckPass;
/**
 * The "payment successful" page asks about its own order, so the customer usually
 * gets the confirmation at once instead of at the next round. Resolves to 'paid',
 * 'pending' or 'not-found'. Never throws for a problem with Stripe: the page shows
 * the order either way, and the next round tries again.
 */
const checkOrderPaymentByIdUseCase = async (orderId, now = Date.now()) => {
    if (!(0, objectIdParser_1.ObjectID)(orderId))
        return 'not-found';
    const order = await (0, workshopRepo_1.findOrderForPaymentCheckRepo)(orderId);
    if (!order)
        return 'not-found';
    if (order.paymentStatus === 'paid')
        return 'paid';
    if (!order.stripeSessionId)
        return 'pending';
    // The page may ask every few seconds; Stripe is not asked more often than this.
    if (order.paymentCheckedAt && now - new Date(order.paymentCheckedAt).getTime() < exports.RECHECK_THROTTLE_MS) {
        return 'pending';
    }
    try {
        const outcome = await (0, exports.checkOrderPaymentUseCase)(order);
        return outcome === 'confirmed' || outcome === 'already-processed' ? 'paid' : 'pending';
    }
    catch (error) {
        console.error('PAYMENT CHECK: could not ask Stripe about order', String(order._id), error?.message);
        return 'pending';
    }
};
exports.checkOrderPaymentByIdUseCase = checkOrderPaymentByIdUseCase;
