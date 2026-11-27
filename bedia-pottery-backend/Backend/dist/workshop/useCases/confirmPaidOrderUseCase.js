"use strict";
/**
 * What follows a successful payment: the bookings are confirmed, the slot times
 * are saved, the confirmation email goes to the customer, every gift voucher is
 * made and sent, and the cart is cleared.
 *
 * Two things can tell the server that an order was paid: Stripe's webhook, and the
 * periodic payment check that asks Stripe itself. Both end up here, so an order is
 * confirmed in exactly one way, and only once — the first step marks the order
 * paid in one atomic update, which only one caller can win.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmPaidOrderUseCase = void 0;
const crypto_1 = require("crypto");
const workshopRepo_1 = require("../repos/workshopRepo");
const workshopBookingMailService_1 = require("../../services/workshopBookingMailService");
const generateGiftVoucher_1 = require("../../utils/generateGiftVoucher");
const deriveClayType_1 = require("../../utils/deriveClayType");
const workshopModel_1 = __importDefault(require("../models/workshopModel"));
// Generates the voucher PDF and persists the gift status for a single gift
// booking, and hands the voucher back. Pulled out so multiple gift bookings can
// be processed concurrently from the webhook; the purchaser gets ONE email
// carrying every voucher of the order (see sendGiftVoucherEmails).
/**
 * Whether a gift was bought for kids or adults, read from the booked items (the
 * gift card page sends the guest count as `child` or `adult`). Empty when unknown.
 */
const giftAudience = (items = []) => {
    const first = items[0] || {};
    if (Number(first.child) > 0)
        return 'Kids';
    if (Number(first.adult) > 0)
        return 'Adults';
    return '';
};
const processGiftBooking = async (giftBooking) => {
    // optionTitle looks like "Air-Dry Clay - Kids" or "Ceramic Clay - Adults";
    // deriveClayType strips the trailing audience suffix.
    const clayType = (0, deriveClayType_1.deriveClayType)(giftBooking.items?.[0]?.optionTitle);
    const guests = String(giftBooking.totalPeople);
    // const voucherCode = `BP${Date.now()}`;
    const voucherCode = `BP${(0, crypto_1.randomBytes)(4).toString('hex').toUpperCase()}`;
    const audience = giftBooking.giftDetails?.giftFor || giftAudience(giftBooking.items);
    const redeemUrl = `${process.env.FRONTEND_URL}/redeem?ref=${giftBooking._id}`;
    const voucher = await (0, generateGiftVoucher_1.generateGiftVoucher)({
        personalMessage: giftBooking.giftDetails?.personalMessage || '',
        guests,
        giftFor: giftBooking.giftDetails?.giftFor || '',
        // Used by the newer voucher artwork, which says who the voucher is for
        // ("1 Kids' Pottery Experience") and prints the validity date its own way.
        audience,
        validUntil: giftBooking.giftValidity,
        voucherCode,
        clayType,
        redeemUrl,
        giftValidity: giftBooking.giftValidity
            ? new Date(giftBooking.giftValidity).toLocaleDateString('en-US', {
                month: 'long',
                day: '2-digit',
                year: 'numeric',
            })
            : '',
    });
    if (!giftBooking.giftDetails) {
        giftBooking.giftDetails = {};
    }
    giftBooking.giftStatus = 'completed';
    giftBooking.giftDetails.voucherCode = voucherCode;
    giftBooking.giftDetails.voucherPdf = voucher.fileName;
    giftBooking.giftDetails.sentAt = new Date();
    await giftBooking.save();
    return {
        booking: giftBooking,
        voucherPath: voucher.outputPath,
        voucherCode,
        audience,
        clayType,
        validUntil: giftBooking.giftValidity,
        redeemUrl,
    };
};
/**
 * Makes the voucher for every gift booking of an order and sends the purchaser a
 * single email with all of them attached. One failing voucher is logged and
 * left out; the others are still sent.
 */
const sendGiftVoucherEmails = async (giftBookings) => {
    if (!giftBookings.length)
        return;
    const results = await Promise.allSettled(giftBookings.map((giftBooking) => processGiftBooking(giftBooking)));
    const vouchers = [];
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            vouchers.push(result.value);
        }
        else {
            console.error('Gift voucher could not be made for booking', String(giftBookings[index]._id), result.reason);
        }
    });
    await (0, workshopBookingMailService_1.sendGiftVouchersMail)({ vouchers });
};
/**
 * Confirms a paid order. Resolves to 'confirmed', or to 'already-processed' when
 * the order was already marked paid (a repeated webhook, or the payment check
 * arriving second). Throws when the order does not exist.
 *
 * A failure before the bookings are confirmed hands the order back to pending and
 * rethrows, so the next attempt — Stripe's retry or the next payment check — runs
 * the whole job again. A failure after that point (the emails) is only logged:
 * the payment is fully recorded, and running it again would repeat what worked.
 */
const confirmPaidOrderUseCase = async (orderId, paymentId) => {
    // Set once this call has marked the order paid, so a failure before the
    // bookings are updated can hand the order back for a retry.
    let claimedOrderId = null;
    let postPaymentWorkStarted = false;
    try {
        // Claim the order: it is marked paid only if it is not paid already, in one
        // atomic step. Stripe delivers events at least once (and retries slow or
        // failed ones), so the same payment can arrive twice — only the first
        // delivery may confirm the bookings and send the emails. The returned
        // document is also the single source of truth for the order below.
        const order = await (0, workshopRepo_1.markOrderPaidIfPendingRepo)(orderId, paymentId);
        if (!order) {
            if (await (0, workshopRepo_1.orderExistsRepo)(orderId)) {
                console.log('ORDER ALREADY PROCESSED, skipping:', orderId);
                return 'already-processed';
            }
            throw new Error('Order not found');
        }
        claimedOrderId = order._id;
        const bookingIds = order.items.map((item) => item.bookingId);
        // Mark the bookings paid, then load the (now-updated) booking documents.
        await (0, workshopRepo_1.updateBookingsPaymentStatusByIds)(bookingIds, 'paid');
        console.log('BOOKINGS UPDATED');
        //***************************Send Email
        const orderData = order;
        const bookings = await (0, workshopRepo_1.getBookingsByIdsRepo)(bookingIds);
        // Load every referenced workshop in ONE query (deduped) instead of one
        // findById per booking, then resolve slots in memory.
        const workshopIds = [
            ...new Set(bookings.map((b) => b.workshopId?.toString()).filter(Boolean)),
        ];
        const workshops = await workshopModel_1.default.find({ _id: { $in: workshopIds } });
        const workshopById = new Map(workshops.map((w) => [String(w._id), w]));
        // startTime/endTime are also lifted to the top level so consumers don't
        // have to reach into `slot` (which is absent for gift bookings until the
        // recipient redeems the voucher).
        const bookingDetails = bookings.map((booking) => {
            const workshop = workshopById.get(booking.workshopId?.toString()) || null;
            const slot = workshop?.defaultSlots?.find((s) => s._id?.toString() === booking.slotId?.toString());
            return {
                booking,
                workshop,
                slot,
                startTime: slot?.startTime || booking.startTime || null,
                endTime: slot?.endTime || booking.endTime || null,
            };
        });
        // Persist the slot times on the booking and on the matching order item,
        // so the schedule survives without another slot lookup. Gift bookings
        // have no slot yet, so they are skipped.
        const slotTimeUpdates = bookingDetails
            .filter(({ slot }) => !!slot?.startTime && !!slot?.endTime)
            .map(({ booking, slot }) => ({
            bookingId: booking._id,
            startTime: slot.startTime,
            endTime: slot.endTime,
        }));
        if (slotTimeUpdates.length) {
            await Promise.all([
                (0, workshopRepo_1.updateBookingsSlotTimesByIds)(slotTimeUpdates),
                (0, workshopRepo_1.updateOrderItemsSlotTimes)(order._id, slotTimeUpdates),
            ]);
            // Keep the already-loaded documents in sync with what was just written,
            // so the emails below (and processGiftBooking's save) see the times too.
            for (const { booking, startTime, endTime } of bookingDetails) {
                if (startTime && endTime) {
                    booking.startTime = startTime;
                    booking.endTime = endTime;
                }
            }
            console.log('SLOT TIMES UPDATED');
        }
        // Sessions (workshops, events, private) are confirmed by the booking
        // confirmation email; gift vouchers have their own email below.
        const sessionDetails = bookingDetails.filter(({ booking }) => booking.bookingType !== 'gift');
        const bookingType = sessionDetails[0]?.booking?.bookingType;
        // Generate a voucher and send the gift email for EVERY gift booking in the
        // order. With cart checkout, gift bookings can appear anywhere among the
        // order's bookings (not just the first one). The gift card email goes to
        // the purchaser (booking.customer.email) only.
        const giftBookings = bookings.filter((b) => b.bookingType === 'gift');
        // The order-confirmation email and the per-gift voucher work are
        // independent, so run them all concurrently instead of one after another.
        // From here on the payment is fully recorded. A failing email must not make
        // this handler answer with an error: Stripe would retry the delivery and
        // the customer would get the emails that did work a second time.
        postPaymentWorkStarted = true;
        try {
            await Promise.all([
                sessionDetails.length === 0
                    ? undefined
                    : bookingType === 'pottery' || bookingType === 'events'
                        ? (0, workshopBookingMailService_1.sendWorkshopBookingConfirmationMail)({ order: orderData, bookingsData: sessionDetails })
                        : (0, workshopBookingMailService_1.sendPriveBookingConfirmationMail)({ order: orderData, bookingsData: sessionDetails }),
                sendGiftVoucherEmails(giftBookings),
            ]);
        }
        catch (mailError) {
            console.error('Post-payment email/voucher step failed for order', String(order._id), mailError);
        }
        try {
            if (order?.userId) {
                const userId = order.userId.toString();
                const cart = await (0, workshopRepo_1.getCartByUserIdRepo)(userId);
                if (cart) {
                    await (0, workshopRepo_1.clearCartRepo)(userId);
                }
            }
        }
        catch (err) {
            console.error('Cart clear failed:', err);
        }
        return 'confirmed';
    }
    catch (error) {
        if (claimedOrderId && !postPaymentWorkStarted) {
            await (0, workshopRepo_1.revertOrderToPendingRepo)(claimedOrderId).catch((revertError) => console.error('Could not revert order after a failure:', revertError));
        }
        throw error;
    }
};
exports.confirmPaidOrderUseCase = confirmPaidOrderUseCase;
