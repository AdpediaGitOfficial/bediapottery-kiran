"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workshopController_1 = require("../controllers/workshopController");
const sanitizeMiddleware_1 = __importDefault(require("../../middleware/sanitizeMiddleware"));
const validate_1 = require("../../middleware/validate");
const getAllWorkshops_1 = require("../routevalidators/getAllWorkshops");
const createWorkshop_1 = require("../routevalidators/createWorkshop");
const authMiddleware_1 = require("../../middleware/auth/authMiddleware");
const createWorkshopBooking_1 = require("../routevalidators/createWorkshopBooking");
const addToCartSchema_1 = require("../routevalidators/addToCartSchema");
const potteryBookingSchema_1 = require("../routevalidators/potteryBookingSchema");
const generateGiftVoucher_1 = require("../../utils/generateGiftVoucher");
const pdfCoordHelper_1 = require("../../utils/pdfCoordHelper");
const workshopBookingMailService_1 = require("../../services/workshopBookingMailService");
const deriveClayType_1 = require("../../utils/deriveClayType");
const potteryTrackingController_1 = require("../controllers/potteryTrackingController");
const router = (0, express_1.Router)();
router.get('/test-pdf', async (req, res) => {
    const { personalMessage, guests, giftFor, giftValidity, voucherCode, clayType, redeemUrl } = req.query;
    const pdf = await (0, generateGiftVoucher_1.generateGiftVoucher)({
        personalMessage: personalMessage ||
            'Happy Birthday, my love. Always be happy and keep creating beautiful things. Wishing you a wonderful day full of joy at the pottery studio.',
        guests: guests || '1',
        giftFor: giftFor || 'Adult',
        giftValidity: giftValidity || '1 May 2027',
        voucherCode: voucherCode || 'GIFT-1781787035375-1234',
        clayType: clayType || 'Terracotta Clay',
        redeemUrl: redeemUrl || `${process.env.FRONTEND_URL}/redeem?ref=test-booking-id`,
    });
    return res.download(pdf.outputPath);
});
router.post('/test-booking-mail', async (req, res) => {
    try {
        const body = req.body;
        // Accept either the real { order, bookingsData } shape or a flat booking
        // object (like the /test-gift-mail payload) and wrap it on the fly.
        const payload = Array.isArray(body.bookingsData)
            ? body
            : {
                order: body.order || {
                    orderNumber: body.orderNumber || `TEST-${Date.now()}`,
                    grandTotal: body.grandTotal ?? 0,
                },
                bookingsData: [
                    {
                        booking: body.booking || body,
                        workshop: body.workshop || { title: body.items?.[0]?.optionTitle || 'Workshop' },
                        slot: body.slot,
                    },
                ],
                to: body.to,
                cc: body.cc,
            };
        await (0, workshopBookingMailService_1.sendWorkshopBookingConfirmationMail)(payload);
        return res.json({ ok: true, message: 'Mail function executed — check inbox/logs' });
    }
    catch (err) {
        return res.status(500).json({ ok: false, error: err.message });
    }
});
// Mirrors processGiftBooking (workshopController) but stubs the Mongoose
// .save() — generates a real voucher PDF and sends the real gift email so the
// flow can be exercised from Postman with a plain JSON body.
router.post('/test-gift-mail', async (req, res) => {
    try {
        const giftBooking = req.body;
        const clayType = (0, deriveClayType_1.deriveClayType)(giftBooking.items?.[0]?.optionTitle);
        const guests = String(giftBooking.totalPeople);
        const voucherCode = `BP${Date.now()}`;
        const voucher = await (0, generateGiftVoucher_1.generateGiftVoucher)({
            personalMessage: giftBooking.giftDetails?.personalMessage || '',
            guests,
            giftFor: giftBooking.giftDetails?.giftFor || '',
            voucherCode,
            clayType,
            redeemUrl: `${process.env.FRONTEND_URL}/redeem?ref=${giftBooking._id || 'test-booking-id'}`,
            giftValidity: giftBooking.giftValidity
                ? new Date(giftBooking.giftValidity).toLocaleDateString('en-US', {
                    month: 'long',
                    day: '2-digit',
                    year: 'numeric',
                })
                : '',
        });
        // Mirror what processGiftBooking writes back, but in-memory only.
        if (!giftBooking.giftDetails)
            giftBooking.giftDetails = {};
        giftBooking.giftDetails.voucherCode = voucherCode;
        giftBooking.giftDetails.voucherPdf = voucher.fileName;
        await (0, workshopBookingMailService_1.sendGiftVoucherMail)({
            booking: giftBooking,
            voucherPath: voucher.outputPath,
            voucherCode,
        });
        return res.json({ ok: true, voucherCode, message: 'Gift mail executed — check inbox/logs' });
    }
    catch (err) {
        return res.status(500).json({ ok: false, error: err.message });
    }
});
router.get('/pdf-grid', async (req, res) => {
    const pageIndex = parseInt(req.query.page || '0', 10);
    const outPath = await (0, pdfCoordHelper_1.generateCoordGrid)(pageIndex);
    return res.download(outPath);
});
router.get('/all', (0, validate_1.validateQuery)(getAllWorkshops_1.getAllWorkshopSchema), workshopController_1.getAllWorkshops);
router.get('/homepage', (0, validate_1.validateQuery)(getAllWorkshops_1.getAllWorkshopSchema), workshopController_1.getHomepageWorkshops);
router.get('/byCategory', (0, validate_1.validateQuery)(getAllWorkshops_1.getAllWorkshopSchema), workshopController_1.getWorkshopsByCategory);
router.get('/adminAll', authMiddleware_1.userAuthMiddleware, (0, validate_1.validateQuery)(getAllWorkshops_1.getAllWorkshopSchema), workshopController_1.getAllWorkshopsForAdmin);
router.post('/', authMiddleware_1.userAuthMiddleware, (0, validate_1.validateReqBody)(createWorkshop_1.createWorkshopSchema), sanitizeMiddleware_1.default, workshopController_1.createWorkshop);
router.put('/:id', authMiddleware_1.userAuthMiddleware, (0, validate_1.validateReqBody)(createWorkshop_1.createWorkshopSchema), sanitizeMiddleware_1.default, workshopController_1.updateWorkshopById);
router.delete('/:id', authMiddleware_1.userAuthMiddleware, workshopController_1.deleteWorkshopById);
router.get('/bySlug/:slug', workshopController_1.getWorkshopBySlug);
router.get('/:id', authMiddleware_1.userAuthMiddleware, workshopController_1.getWorkshopById);
router.post('/availability', workshopController_1.checkWorkshopAvailability);
router.post('/pottery-availability', workshopController_1.checkPotteryWorkshopAvailability);
router.post('/pottery-capacity', workshopController_1.checkPotteryWorkshopCapacity);
router.post('/booking', (0, validate_1.validateReqBody)(createWorkshopBooking_1.createWorkshopBookingSchema), sanitizeMiddleware_1.default, workshopController_1.createWorkshopBooking);
router.get('/bookings/all', authMiddleware_1.userAuthMiddleware, workshopController_1.getWorkshopBookings);
router.get('/workshop-booking/:id', authMiddleware_1.userAuthMiddleware, workshopController_1.getWorkshopBookingById);
// Cleanup of test / failed / abandoned bookings. POST rather than DELETE so the
// selected ids or the active list filters can travel in the body.
router.post('/bookings/delete', authMiddleware_1.userAuthMiddleware, workshopController_1.deleteWorkshopBookings);
router.get('/bookings/deletable-count', authMiddleware_1.userAuthMiddleware, workshopController_1.getDeletableBookingsCount);
// Cart apis
router.post('/cart', (0, validate_1.validateReqBody)(addToCartSchema_1.addToCartSchema), sanitizeMiddleware_1.default, workshopController_1.addToCart);
router.get('/cart/:userId', workshopController_1.getCartController);
router.delete('/cart/item', workshopController_1.removeCartItem);
router.post('/cart/checkout', workshopController_1.checkoutCart);
// Pottery booking api
// Standalone checkout for the pottery front end: the cart is held in the
// browser and no login is required, so the entries come in the body and no
// userId is recorded. Body is the `workshops` array this route's sibling
// /booking takes, plus the same customer block as /cart/checkout.
router.post('/pottery-booking', (0, validate_1.validateReqBody)(potteryBookingSchema_1.potteryBookingSchema), sanitizeMiddleware_1.default, workshopController_1.potteryBooking);
// Order apis
router.get('/order/:orderId', workshopController_1.getOrderDetails);
/* ---------------- Item tracking ----------------
 *
 * Terracotta and Ceramic pieces stay in the studio for weeks after the
 * workshop, so the admin drives them through the journey from here while the
 * customer follows along on the public /tracking route.
 */
router.post('/bookings/:id/tracking/start', authMiddleware_1.userAuthMiddleware, sanitizeMiddleware_1.default, potteryTrackingController_1.startBookingTracking);
router.post('/bookings/:id/tracking/status', authMiddleware_1.userAuthMiddleware, sanitizeMiddleware_1.default, potteryTrackingController_1.updateTrackingStatus);
router.post('/bookings/:id/tracking/item-codes', authMiddleware_1.userAuthMiddleware, sanitizeMiddleware_1.default, potteryTrackingController_1.updateTrackingItemCodes);
// Air-Dry bookings have no journey — the piece goes home the same day.
router.post('/bookings/:id/collected', authMiddleware_1.userAuthMiddleware, potteryTrackingController_1.markBookingCollected);
router.get('/tracking/counts', authMiddleware_1.userAuthMiddleware, potteryTrackingController_1.getTrackingCounts);
router.post('/tracking/run', authMiddleware_1.userAuthMiddleware, potteryTrackingController_1.runTrackingAutomation);
// Public — the token from the customer's email is the only credential.
router.get('/tracking/:token', potteryTrackingController_1.getTrackingByToken);
// Gift voucher redemption (public — recipient has the code from email)
router.get('/redeem/validate/:bookingId', workshopController_1.validateGiftVoucher);
router.post('/redeem/confirm', workshopController_1.confirmGiftRedemption);
exports.default = router;
