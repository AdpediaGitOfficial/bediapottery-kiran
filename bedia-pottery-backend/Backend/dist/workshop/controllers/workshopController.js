"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPotteryWorkshopCapacity = exports.confirmGiftRedemption = exports.validateGiftVoucher = exports.testBookingEmail = exports.potteryBooking = exports.checkoutCart = exports.removeCartItem = exports.getCartController = exports.addToCart = exports.getOrderDetails = exports.getDeletableBookingsCount = exports.deleteWorkshopBookings = exports.getWorkshopBookingById = exports.getWorkshopBookings = exports.stripeWebhookController = exports.createWorkshopBooking = exports.checkPotteryWorkshopAvailability = exports.checkWorkshopAvailability = exports.getDashboardCounts = exports.getWorkshopBySlug = exports.getWorkshopById = exports.deleteWorkshopById = exports.updateWorkshopById = exports.createWorkshop = exports.getAllWorkshopsForAdmin = exports.getWorkshopsByCategory = exports.getHomepageWorkshops = exports.getAllWorkshops = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const crypto_1 = require("crypto");
const workshopUseCase_1 = require("../useCases/workshopUseCase");
const stripe_1 = require("../../config/stripe");
const workshopRepo_1 = require("../repos/workshopRepo");
const express_validator_1 = require("express-validator");
const httpStatus_1 = require("../../common/httpStatus");
const workshopBookingMailService_1 = require("../../services/workshopBookingMailService");
const generateGiftVoucher_1 = require("../../utils/generateGiftVoucher");
const deriveClayType_1 = require("../../utils/deriveClayType");
const workshopModel_1 = __importDefault(require("../models/workshopModel"));
exports.getAllWorkshops = (0, express_async_handler_1.default)(async (req, res) => {
    const workshops = await (0, workshopUseCase_1.getAllWorkshopsUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Workshops successfully',
        result: workshops,
    });
});
exports.getHomepageWorkshops = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await (0, workshopUseCase_1.getHomepageWorkshopsUseCase)();
    res.status(200).json({
        success: true,
        message: 'Homepage workshops fetched successfully',
        result: data,
    });
});
exports.getWorkshopsByCategory = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await (0, workshopUseCase_1.getWorkshopsByCategoryUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Workshops fetched successfully',
        result: data,
    });
});
exports.getAllWorkshopsForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const workshops = await (0, workshopUseCase_1.getAllWorkshopsForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Workshops successfully',
        result: workshops,
    });
});
exports.createWorkshop = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, workshopUseCase_1.createWorkshopUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created Workshop successfully',
        result: true,
    });
});
exports.updateWorkshopById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, workshopUseCase_1.updateWorkshopByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated Workshop successfully',
        result: true,
    });
});
exports.deleteWorkshopById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, workshopUseCase_1.deleteWorkshopByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted Workshop successfully',
        result: true,
    });
});
exports.getWorkshopById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const workshop = await (0, workshopUseCase_1.getWorkshopByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched Workshop successfully',
        result: workshop,
    });
});
exports.getWorkshopBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const workshop = await (0, workshopUseCase_1.getWorkshopBySlugUseCase)({ slug: slug });
    res.status(200).json({
        success: true,
        message: 'Fetched Workshop successfully',
        result: workshop,
    });
});
exports.getDashboardCounts = (0, express_async_handler_1.default)(async (req, res) => {
    const counts = await (0, workshopUseCase_1.getDashboardCountsUseCase)();
    res.status(200).json({
        success: true,
        message: 'Fetched dashboard counts successfully',
        result: counts,
    });
});
exports.checkWorkshopAvailability = (0, express_async_handler_1.default)(async (req, res) => {
    const { workshopId, bookingDate, slotId, guests, bookingType } = req.body;
    const result = await (0, workshopUseCase_1.checkWorkshopAvailabilityUseCase)({
        workshopId,
        bookingDate,
        slotId,
        guests,
        bookingType,
    });
    res.status(200).json({
        success: true,
        message: 'Workshop availability checked successfully',
        result,
    });
});
exports.checkPotteryWorkshopAvailability = (0, express_async_handler_1.default)(async (req, res) => {
    const { workshopId, bookingDate, slotId, guests, bookingType } = req.body;
    const result = await (0, workshopUseCase_1.checkPotteryWorkshopAvailabilityUseCase)({
        workshopId,
        bookingDate,
        slotId,
        guests,
        bookingType,
    });
    res.status(200).json({
        success: true,
        message: 'Workshop availability checked successfully',
        result,
    });
});
exports.createWorkshopBooking = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    const result = await (0, workshopUseCase_1.createWorkshopBookingUseCase)(data);
    res.status(200).json({
        success: true,
        checkoutUrl: result.checkoutUrl,
    });
});
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
const stripeWebhookController = async (req, res) => {
    console.log('WEBHOOK HIT');
    // Set once this delivery has marked an order paid, so a failure before the
    // bookings are updated can hand the order back to Stripe's retry.
    let claimedOrderId = null;
    let postPaymentWorkStarted = false;
    try {
        const sig = req.headers['stripe-signature'];
        if (!sig) {
            return res.status(400).send('Missing Stripe signature');
        }
        console.log('--- STRIPE WEBHOOK DEBUG ---');
        console.log('Signature exists:', !!sig);
        console.log('Body is Buffer:', Buffer.isBuffer(req.body));
        console.log('Webhook secret prefix:', process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 12));
        console.log('Content-Type:', req.headers['content-type']);
        const event = stripe_1.stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log('EVENT TYPE:', event.type);
        // PAYMENT SUCCESS
        if (event.type === 'payment_intent.succeeded') {
            console.log('PAYMENT SUCCESS WEBHOOK');
            const paymentIntent = event.data.object;
            //  console.log('PAYMENT INTENT:', paymentIntent);
            if (paymentIntent.metadata?.partner === 'PaymentPlugins') {
                console.log('Skipping WooCommerce payment');
                return res.json({ received: true });
            }
            // ONLY your MongoDB ObjectId
            const orderId = paymentIntent.metadata?.orderId;
            if (!orderId) {
                console.log('ORDER ID NOT FOUND');
                return res.json({ received: true });
            }
            // Claim the order: it is marked paid only if it is not paid already, in one
            // atomic step. Stripe delivers events at least once (and retries slow or
            // failed ones), so the same payment can arrive twice — only the first
            // delivery may confirm the bookings and send the emails. The returned
            // document is also the single source of truth for the order below.
            const order = await (0, workshopRepo_1.markOrderPaidIfPendingRepo)(orderId, paymentIntent.id);
            if (!order) {
                if (await (0, workshopRepo_1.orderExistsRepo)(orderId)) {
                    console.log('ORDER ALREADY PROCESSED, skipping:', orderId);
                    return res.json({ received: true });
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
        }
        return res.json({ received: true });
    }
    catch (error) {
        console.error('Stripe webhook error:', error.message);
        // The bookings were not confirmed, so let Stripe's retry run the whole job
        // again — it would otherwise find the order already paid and skip it.
        if (claimedOrderId && !postPaymentWorkStarted) {
            await (0, workshopRepo_1.revertOrderToPendingRepo)(claimedOrderId).catch((revertError) => console.error('Could not revert order after webhook failure:', revertError));
        }
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }
};
exports.stripeWebhookController = stripeWebhookController;
const getWorkshopBookings = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            errors: errors.array(),
        });
    }
    try {
        const filters = {
            search: req.query.search,
            bookingStatus: req.query.bookingStatus,
            trackingStatus: req.query.trackingStatus,
            paymentStatus: req.query.paymentStatus,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const result = await (0, workshopUseCase_1.getWorkshopBookingsUseCase)(filters, limit, page);
        return res.status(200).json({
            success: true,
            message: 'Workshop bookings fetched successfully',
            result,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'An error occurred',
        });
    }
};
exports.getWorkshopBookings = getWorkshopBookings;
exports.getWorkshopBookingById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const booking = await (0, workshopUseCase_1.getWorkshopBookingByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched Workshop Booking successfully',
        result: booking,
    });
});
exports.deleteWorkshopBookings = (0, express_async_handler_1.default)(async (req, res) => {
    const { ids, search, bookingStatus, paymentStatus, startDate, endDate } = req.body;
    const { deletedCount, deletedOrderCount } = await (0, workshopUseCase_1.deleteWorkshopBookingsUseCase)({
        ids,
        search,
        bookingStatus,
        paymentStatus,
        startDate,
        endDate,
    });
    res.status(200).json({
        success: true,
        message: `${deletedCount} booking${deletedCount === 1 ? '' : 's'} removed successfully`,
        result: { deletedCount, deletedOrderCount },
    });
});
exports.getDeletableBookingsCount = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, workshopUseCase_1.getDeletableBookingsCountUseCase)({
        search: req.query.search,
        bookingStatus: req.query.bookingStatus,
        paymentStatus: req.query.paymentStatus,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
    });
    res.status(200).json({
        success: true,
        message: 'Fetched deletable bookings count successfully',
        result,
    });
});
exports.getOrderDetails = (0, express_async_handler_1.default)(async (req, res) => {
    const { orderId } = req.params;
    const order = await (0, workshopUseCase_1.getOrderDetailsUseCase)(orderId);
    res.status(200).json({
        success: true,
        message: 'Fetched order details successfully',
        data: order,
    });
});
exports.addToCart = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, workshopUseCase_1.addToCartUseCase)(req.body);
    res.status(200).json({
        success: true,
        message: 'Item added to cart',
        data: result,
    });
});
exports.getCartController = (0, express_async_handler_1.default)(async (req, res) => {
    // Items whose workshop date + slot time have already passed in UAE are
    // dropped by the use case before we get here.
    const { cart, removedExpiredItems } = await (0, workshopUseCase_1.getCartUseCase)(req.params.userId);
    const cartObj = cart?.toObject();
    if (cartObj) {
        cartObj.items = cartObj.items.map((item) => {
            const option = item.workshopId?.options?.find((o) => String(o._id) === String(item.optionId));
            // Slot timings live on the workshop's defaultSlots, so resolve them here and
            // surface them on the item instead of shipping the whole slot list to the client.
            const slot = item.workshopId?.defaultSlots?.find((s) => String(s._id) === String(item.slotId));
            const workshop = item.workshopId ? { ...item.workshopId } : item.workshopId;
            if (workshop) {
                delete workshop.defaultSlots;
            }
            return {
                ...item,
                workshopId: workshop,
                optionTitle: option?.title,
                startTime: slot?.startTime ?? null,
                endTime: slot?.endTime ?? null,
            };
        });
    }
    const message = removedExpiredItems
        ? 'Some workshops in your cart have already taken place and were removed from your cart.'
        : 'Fetched cart successfully';
    res.json({
        success: true,
        message,
        removedExpiredItems,
        data: cartObj,
    });
});
exports.removeCartItem = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, workshopUseCase_1.removeCartItemUseCase)(req.body);
    res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        data: result,
    });
});
exports.checkoutCart = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, workshopUseCase_1.checkoutCartUseCase)(req.body);
    res.status(200).json({
        success: true,
        message: 'Checkout successful',
        data: result,
    });
});
/**
 * Pottery front end checkout. Same response shape as checkoutCart, but the cart
 * lines travel in the body and there is no logged-in user behind the purchase.
 */
exports.potteryBooking = (0, express_async_handler_1.default)(async (req, res) => {
    const result = await (0, workshopUseCase_1.potteryBookingUseCase)(req.body);
    res.status(200).json({
        success: true,
        message: 'Booking created successfully',
        data: result,
    });
});
exports.testBookingEmail = (0, express_async_handler_1.default)(async (req, res) => {
    const testOrder = {
        orderNumber: 'TEST-ORDER-123',
        grandTotal: 250,
    };
    const testBookingsData = [
        {
            booking: {
                customer: {
                    firstName: 'Soniya',
                    lastName: 'Test',
                    email: 'soniyaej@gmail.com',
                    phone: '9876543210',
                },
                bookingDate: new Date(),
                totalPeople: 2,
                items: [
                    {
                        optionTitle: 'Luxury Clay Workshop',
                    },
                ],
            },
            slot: {
                startTime: '10:00 AM',
                endTime: '01:00 PM',
            },
            workshop: {
                title: 'Clay Workshop',
            },
        },
    ];
    await (0, workshopBookingMailService_1.sendPriveBookingConfirmationMail)({
        order: testOrder,
        bookingsData: testBookingsData,
    });
    res.json({
        success: true,
        message: 'Test email sent successfully',
    });
});
exports.validateGiftVoucher = (0, express_async_handler_1.default)(async (req, res) => {
    const { bookingId } = req.params;
    const result = await (0, workshopUseCase_1.validateGiftVoucherUseCase)(bookingId);
    res.status(httpStatus_1.HttpStatus.OK).json({
        success: true,
        message: 'Gift booking found',
        result,
    });
});
exports.confirmGiftRedemption = (0, express_async_handler_1.default)(async (req, res) => {
    const { bookingId, voucherCode, bookingDate, slotId, recipientName, recipientPhone, recipientEmail, recipientAddress, } = req.body;
    if (!bookingId || !voucherCode || !bookingDate || !slotId) {
        res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            message: 'bookingId, voucherCode, bookingDate and slotId are required',
        });
        return;
    }
    const result = await (0, workshopUseCase_1.confirmGiftRedemptionUseCase)({
        bookingId,
        voucherCode,
        bookingDate,
        slotId,
        recipientName,
        recipientPhone,
        recipientEmail,
        recipientAddress,
    });
    res.status(httpStatus_1.HttpStatus.OK).json({
        success: true,
        message: 'Gift voucher redeemed successfully. Your booking is confirmed!',
        result,
    });
});
exports.checkPotteryWorkshopCapacity = (0, express_async_handler_1.default)(async (req, res) => {
    const { bookingDate, startTime, endTime, bookingType } = req.body;
    const result = await (0, workshopUseCase_1.checkPotteryWorkshopCapacityUseCase)({
        bookingDate,
        startTime,
        endTime,
        bookingType,
    });
    res.status(200).json({
        success: true,
        message: 'Workshop capacity fetched successfully',
        result,
    });
});
