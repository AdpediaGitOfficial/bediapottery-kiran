"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPotteryWorkshopCapacity = exports.confirmGiftRedemption = exports.validateGiftVoucher = exports.testBookingEmail = exports.potteryBooking = exports.checkoutCart = exports.removeCartItem = exports.getCartController = exports.addToCart = exports.getOrderDetails = exports.getDeletableBookingsCount = exports.deleteWorkshopBookings = exports.getWorkshopBookingById = exports.getWorkshopBookings = exports.stripeWebhookController = exports.createWorkshopBooking = exports.checkPotteryWorkshopAvailability = exports.checkWorkshopAvailability = exports.getDashboardCounts = exports.getWorkshopBySlug = exports.getWorkshopById = exports.deleteWorkshopById = exports.updateWorkshopById = exports.createWorkshop = exports.getAllWorkshopsForAdmin = exports.getWorkshopsByCategory = exports.getHomepageWorkshops = exports.getAllWorkshops = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const workshopUseCase_1 = require("../useCases/workshopUseCase");
const confirmPaidOrderUseCase_1 = require("../useCases/confirmPaidOrderUseCase");
const orderPaymentCheckUseCase_1 = require("../useCases/orderPaymentCheckUseCase");
const stripe_1 = require("../../config/stripe");
const workshopRepo_1 = require("../repos/workshopRepo");
const express_validator_1 = require("express-validator");
const httpStatus_1 = require("../../common/httpStatus");
const workshopBookingMailService_1 = require("../../services/workshopBookingMailService");
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
const stripeWebhookController = async (req, res) => {
    console.log('WEBHOOK HIT');
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
            await (0, confirmPaidOrderUseCase_1.confirmPaidOrderUseCase)(orderId, paymentIntent.id);
        }
        return res.json({ received: true });
    }
    catch (error) {
        console.error('Stripe webhook error:', error.message);
        // The bookings were not confirmed (the use case has handed the order back to
        // pending), so Stripe's retry runs the whole job again.
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
// The "payment successful" page asks whether its order was paid, and confirms it
// when Stripe says so, without waiting for the next scheduled payment check.
exports.checkOrderPayment = (0, express_async_handler_1.default)(async (req, res) => {
    const status = await (0, orderPaymentCheckUseCase_1.checkOrderPaymentByIdUseCase)(req.params.orderId);
    res.status(200).json({ success: true, result: { status } });
});
