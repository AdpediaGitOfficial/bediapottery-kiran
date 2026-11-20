"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPotteryWorkshopCapacityUseCase = exports.confirmGiftRedemptionUseCase = exports.validateGiftVoucherUseCase = exports.potteryBookingUseCase = exports.checkoutCartUseCase = exports.removeCartItemUseCase = exports.addToCartUseCase = exports.getCartUseCase = exports.findExpiredCartItemIndexes = exports.isBookingSlotExpired = exports.getOrderDetailsUseCase = exports.getWorkshopBookingByIdUseCase = exports.getDeletableBookingsCountUseCase = exports.deleteWorkshopBookingsUseCase = exports.getWorkshopBookingsUseCase = exports.createOrderPaymentSessionUseCase = exports.createWorkshopBookingUseCase = exports.checkPotteryWorkshopAvailabilityUseCase = exports.checkWorkshopAvailabilityUseCase = exports.getDashboardCountsUseCase = exports.getWorkshopBySlugUseCase = exports.getWorkshopByIdUseCase = exports.deleteWorkshopByIdUseCase = exports.updateWorkshopByIdUseCase = exports.createWorkshopUseCase = exports.getAllWorkshopsForAdminUseCase = exports.getWorkshopsByCategoryUseCase = exports.getHomepageWorkshopsUseCase = exports.getAllWorkshopsUseCase = void 0;
const workshopRepo_1 = require("../repos/workshopRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const uaeTime_1 = require("../../utils/uaeTime");
const slotCapacity_1 = require("../../utils/slotCapacity");
const workshopOptionPricing_1 = require("../../utils/workshopOptionPricing");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const careerRepo_1 = require("../../careers/repos/careerRepo");
const jobApplicationRepo_1 = require("../../careers/repos/jobApplicationRepo");
const categoryRepo_1 = require("../../category/repos/categoryRepo");
const stripe_1 = require("../../config/stripe");
const workshopBookingMailService_1 = require("../../services/workshopBookingMailService");
const potteryTrackingUseCase_1 = require("./potteryTrackingUseCase");
const blockedTimeUseCase_1 = require("../../studio/useCases/blockedTimeUseCase");
const mongoose_1 = __importDefault(require("mongoose"));
const getAllWorkshopsUseCase = async (queryParams) => {
    const { page = '1', search, categoryId } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false };
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }];
    }
    if (categoryId) {
        query.categoryId = categoryId;
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    // Run count + page fetch concurrently instead of serially.
    const [totalCount, workshops] = await Promise.all([
        (0, workshopRepo_1.getWorkshopsCount)(query),
        (0, workshopRepo_1.fetchAllWorkshops)(query, skip, parseInt(limit)),
    ]);
    if (!totalCount)
        return { totalCount: 0, workshops: [] };
    return { totalCount, workshops };
};
exports.getAllWorkshopsUseCase = getAllWorkshopsUseCase;
const getHomepageWorkshopsUseCase = async () => {
    return await (0, workshopRepo_1.fetchHomepageWorkshops)();
};
exports.getHomepageWorkshopsUseCase = getHomepageWorkshopsUseCase;
const getWorkshopsByCategoryUseCase = async (queryParams) => {
    const { page = '1', search, slug } = queryParams;
    const { limit = '10' } = queryParams;
    if (!slug) {
        return { totalCount: 0, workshops: [] };
    }
    // find category first
    const category = await (0, categoryRepo_1.fetchCategoryBySlug)(slug);
    if (!category) {
        return { totalCount: 0, workshops: [] };
    }
    const query = {
        categoryId: category._id,
        isDeleted: false,
        isActive: true,
    };
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    // Run count + page fetch concurrently instead of serially.
    const [totalCount, workshops] = await Promise.all([
        (0, workshopRepo_1.getWorkshopsCount)(query),
        (0, workshopRepo_1.fetchWorkshopsByCategory)(query, skip, parseInt(limit)),
    ]);
    if (!totalCount) {
        return { totalCount: 0, category, workshops: [] };
    }
    return { totalCount, category, workshops };
};
exports.getWorkshopsByCategoryUseCase = getWorkshopsByCategoryUseCase;
const getAllWorkshopsForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false };
    if (search && search.length > 0) {
        query['$or'] = [{ title: { $regex: search, $options: 'i' } }]; // Case-insensitive search
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    // Run count + page fetch concurrently instead of serially.
    const [totalCount, workshops] = await Promise.all([
        (0, workshopRepo_1.getWorkshopsCount)(query),
        (0, workshopRepo_1.fetchAllWorkshopsForAdmin)(query, skip, parseInt(limit)),
    ]);
    if (!totalCount)
        return { totalCount: 0, workshops: [] };
    return { totalCount, workshops };
};
exports.getAllWorkshopsForAdminUseCase = getAllWorkshopsForAdminUseCase;
const createWorkshopUseCase = async (data) => {
    // check for  unique value duplications
    const workshop = await (0, workshopRepo_1.createWorkshop)(data);
    if (!workshop) {
        throw new appError_1.default('Couldn\'t Create new Workshop. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createWorkshopUseCase = createWorkshopUseCase;
const updateWorkshopByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingWorkshop = await fetchWorkshopById(id);
        // check for  unique value updations
        const workshop = await (0, workshopRepo_1.updateWorkshopById)(id, data);
        if (!workshop)
            throw new appError_1.default('Couldn\'t update Workshop', httpStatus_1.HttpStatus.NOT_FOUND);
        return workshop;
    }
    throw new appError_1.default('No Workshop Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateWorkshopByIdUseCase = updateWorkshopByIdUseCase;
const deleteWorkshopByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const workshop = await (0, workshopRepo_1.deleteWorkshopById)(id);
        // check for  unique value updations
        if (workshop)
            return true;
    }
    throw new appError_1.default('No Workshop Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteWorkshopByIdUseCase = deleteWorkshopByIdUseCase;
const getWorkshopByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const workshop = await (0, workshopRepo_1.fetchWorkshopById)(query._id);
        if (workshop)
            return workshop;
    }
    throw new appError_1.default('No Workshop Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getWorkshopByIdUseCase = getWorkshopByIdUseCase;
const getWorkshopBySlugUseCase = async (query) => {
    if (query.slug) {
        const workshop = await (0, workshopRepo_1.fetchWorkshopBySlug)(query.slug);
        if (workshop)
            return workshop;
    }
    throw new appError_1.default('No Workshop Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getWorkshopBySlugUseCase = getWorkshopBySlugUseCase;
const getDashboardCountsUseCase = async () => {
    const query = { isDeleted: false };
    const [categoryCount, workshopCount, careerCount, jobApplicationCount] = await Promise.all([
        (0, categoryRepo_1.getCategoriesCount)(query),
        (0, workshopRepo_1.getWorkshopsCount)(query),
        (0, careerRepo_1.getCareersCount)(query),
        (0, jobApplicationRepo_1.getJobApplicationsCount)(query),
    ]);
    return {
        categories: categoryCount,
        workshops: workshopCount,
        careers: careerCount,
        jobApplications: jobApplicationCount,
    };
};
exports.getDashboardCountsUseCase = getDashboardCountsUseCase;
const checkWorkshopAvailabilityUseCase = async (data) => {
    const { workshopId, bookingDate, slotId, guests, bookingType } = data;
    if (!(0, objectIdParser_1.ObjectID)(workshopId)) {
        throw new appError_1.default('Invalid Workshop Id', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    if (!(0, objectIdParser_1.ObjectID)(slotId)) {
        throw new appError_1.default('Invalid Slot Id', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    if (!bookingDate || !guests) {
        throw new appError_1.default('Required fields missing', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const result = await (0, workshopRepo_1.fetchWorkshopAvailability)({
        workshopId,
        bookingDate,
        slotId,
        guests,
        bookingType,
    });
    if (result)
        return result;
    throw new appError_1.default('Unable to check availability', httpStatus_1.HttpStatus.BAD_REQUEST);
};
exports.checkWorkshopAvailabilityUseCase = checkWorkshopAvailabilityUseCase;
const checkPotteryWorkshopAvailabilityUseCase = async (data) => {
    const { workshopId, bookingDate, slotId, guests, bookingType } = data;
    if (!(0, objectIdParser_1.ObjectID)(workshopId)) {
        throw new appError_1.default('Invalid Workshop Id', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    if (!(0, objectIdParser_1.ObjectID)(slotId)) {
        throw new appError_1.default('Invalid Slot Id', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    if (!bookingDate || !guests) {
        throw new appError_1.default('Required fields missing', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const result = await (0, workshopRepo_1.fetchPotteryWorkshopAvailability)({
        workshopId,
        bookingDate,
        slotId,
        guests,
        bookingType,
    });
    if (result)
        return result;
    throw new appError_1.default('Unable to check availability', httpStatus_1.HttpStatus.BAD_REQUEST);
};
exports.checkPotteryWorkshopAvailabilityUseCase = checkPotteryWorkshopAvailabilityUseCase;
// export const createWorkshopBookingUseCase = async (data: any): Promise<{ checkoutUrl: string }> => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const orderNumber = `ORD-${Date.now()}`;
//     let orderSubtotal = 0;
//     let orderTaxAmount = 0;
//     let orderGrandTotal = 0;
//     const orderItems: any[] = [];
//     for (const workshopInput of data.workshops) {
//       const workshop = await getWorkshopByIdRepo(workshopInput.workshopId);
//       if (!workshop) {
//         throw new AppError('Workshop not found', HttpStatus.NOT_FOUND);
//       }
//       const slot = workshop.defaultSlots.find((s: any) => s._id.equals(workshopInput.slotId));
//       if (!slot) {
//         throw new AppError('Selected slot not found', HttpStatus.BAD_REQUEST);
//       }
//       const totalRequestedPeople = workshopInput.items.reduce(
//         (sum: number, item: any) => sum + item.people,
//         0,
//       );
//       const bookedCount = await getSlotBookedCount(
//         workshopInput.workshopId,
//         workshopInput.bookingDate,
//         workshopInput.slotId,
//       );
//       if (bookedCount + totalRequestedPeople > slot.capacity) {
//         throw new AppError('Slot capacity exceeded', HttpStatus.BAD_REQUEST);
//       }
//       let totalAmount = 0;
//       const validatedItems: any[] = [];
//       for (const item of workshopInput.items) {
//         const option = workshop.options.find((o: any) => o._id.equals(item.optionId));
//         if (!option) {
//           throw new AppError('Invalid option selected', HttpStatus.BAD_REQUEST);
//         }
//         const subtotal = option.price * item.people;
//         totalAmount += subtotal;
//         validatedItems.push({
//           optionId: option._id,
//           optionTitle: option.title,
//           price: option.price,
//           people: item.people,
//           subtotal,
//         });
//       }
//       const bookingNumber = `WB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//       const taxPercent = 5;
//       const taxAmount = (totalAmount * taxPercent) / 100;
//       const grandTotal = totalAmount + taxAmount;
//       const booking = await createWorkshopBookingRepo(
//         {
//           workshopId: workshop._id,
//           bookingNumber,
//           bookingDate: workshopInput.bookingDate,
//           slotId: workshopInput.slotId,
//           items: validatedItems,
//           totalPeople: totalRequestedPeople,
//           totalAmount,
//           taxPercent,
//           taxAmount,
//           grandTotal,
//           currency: 'AED',
//           customer: data.customer,
//           bookingStatus: 'pending',
//           paymentStatus: 'pending',
//           userId: data.userId,
//         },
//         session,
//       );
//       orderSubtotal += totalAmount;
//       orderTaxAmount += taxAmount;
//       orderGrandTotal += grandTotal;
//       orderItems.push({
//         bookingId: booking._id,
//         workshopId: workshop._id,
//         bookingDate: workshopInput.bookingDate,
//         slotId: workshopInput.slotId,
//         totalAmount: grandTotal,
//       });
//     }
//     const order = await createWorkshopOrderRepo(
//       {
//         orderNumber,
//         userId: data.userId,
//         items: orderItems,
//         subtotal: orderSubtotal,
//         taxPercent: 5,
//         taxAmount: orderTaxAmount,
//         grandTotal: orderGrandTotal,
//         currency: 'AED',
//         paymentStatus: 'pending',
//         isDeleted: false,
//       },
//       session,
//     );
//     if (!order) {
//       throw new AppError('Order creation failed.', HttpStatus.BAD_REQUEST);
//     }
//     const stripeSession = await createOrderPaymentSessionUseCase(order);
//     if (!stripeSession.url) {
//       throw new AppError('Stripe session URL not generated', HttpStatus.BAD_REQUEST);
//     }
//     // commit transaction BEFORE return
//     await session.commitTransaction();
//     session.endSession();
//     return {
//       checkoutUrl: stripeSession.url,
//     };
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// };
const createWorkshopBookingUseCase = async (data) => {
    // const session = await mongoose.startSession();
    // session.startTransaction();
    //try {
    const orderNumber = `ORD-${Date.now()}`;
    let orderSubtotal = 0;
    let orderTaxAmount = 0;
    let orderGrandTotal = 0;
    const orderItems = [];
    for (const workshopInput of data.workshops) {
        const workshop = await (0, workshopRepo_1.getWorkshopByIdRepo)(workshopInput.workshopId);
        if (!workshop) {
            throw new appError_1.default('Workshop not found', httpStatus_1.HttpStatus.NOT_FOUND);
        }
        // const slot = workshop.defaultSlots.find((s: any) => s._id.equals(workshopInput.slotId));
        // if (!slot) {
        //   throw new AppError('Selected slot not found', HttpStatus.BAD_REQUEST);
        // }
        let slot = null;
        if (data.bookingType !== 'gift') {
            slot = workshop.defaultSlots.find((s) => s._id.equals(workshopInput.slotId));
            if (!slot) {
                throw new appError_1.default('Selected slot not found', httpStatus_1.HttpStatus.BAD_REQUEST);
            }
            // Reject slots that have already started in UAE time
            if ((0, exports.isBookingSlotExpired)(data.bookingType, workshopInput.bookingDate, slot.startTime)) {
                throw new appError_1.default('Selected workshop date and time have already passed', httpStatus_1.HttpStatus.BAD_REQUEST);
            }
            // Closed by the studio on the dashboard's Block Slots page
            await (0, blockedTimeUseCase_1.assertSlotNotBlocked)(workshopInput.bookingDate, slot);
        }
        const totalRequestedPeople = workshopInput.items.reduce((sum, item) => sum + item.people, 0);
        // const bookedCount = await getSlotBookedCount(
        //   workshopInput.workshopId,
        //   workshopInput.bookingDate,
        //   workshopInput.slotId,
        // );
        // if (bookedCount + totalRequestedPeople > slot.capacity) {
        //   throw new AppError('Slot capacity exceeded', HttpStatus.BAD_REQUEST);
        // }
        if (data.bookingType !== 'gift' && slot) {
            // const bookedCount = await getSlotBookedCount(
            //   workshopInput.workshopId,
            //   workshopInput.bookingDate,
            //   workshopInput.slotId,
            // );
            // if (bookedCount + totalRequestedPeople > slot.capacity) {
            //   throw new AppError('Slot capacity exceeded', HttpStatus.BAD_REQUEST);
            // }
            const bookedCount = await (0, workshopRepo_1.getSlotBookedCount)(workshopInput.bookingDate, slot.startTime, slot.endTime);
            // Events get 25 seats only while nothing else holds the slot; otherwise
            // they share the ordinary studio capacity like any other booking.
            if ((0, slotCapacity_1.isEventBlockedByExistingBookings)(data.bookingType, bookedCount, totalRequestedPeople)) {
                throw new appError_1.default(slotCapacity_1.EVENT_SLOT_NOT_EXCLUSIVE_REASON, httpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const MAX_CAPACITY = (0, slotCapacity_1.resolveSlotCapacity)(data.bookingType, bookedCount);
            if (bookedCount + totalRequestedPeople > MAX_CAPACITY) {
                throw new appError_1.default(`Only ${MAX_CAPACITY - bookedCount} seats remaining`, httpStatus_1.HttpStatus.BAD_REQUEST);
            }
        }
        let totalAmount = 0;
        const validatedItems = [];
        for (const item of workshopInput.items) {
            const option = (0, workshopOptionPricing_1.findOptionById)(workshop.options, item.optionId);
            if (!option) {
                throw new appError_1.default('Invalid option selected', httpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const { price, subtotal, breakdown } = (0, workshopOptionPricing_1.priceWorkshopItem)(workshop.options, item, workshopInput.workshopType ?? data.workshopType);
            totalAmount += subtotal;
            validatedItems.push({
                optionId: option._id,
                optionTitle: option.title,
                price,
                people: item.people,
                adult: item.adult || 0,
                child: item.child || 0,
                handBuild: item.handBuild || 0,
                wheelPottery: item.wheelPottery || 0,
                subtotal,
                priceBreakdown: breakdown,
            });
        }
        const bookingNumber = `WB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const taxPercent = 5;
        const taxAmount = (totalAmount * taxPercent) / 100;
        const grandTotal = totalAmount + taxAmount;
        const booking = await (0, workshopRepo_1.createWorkshopBookingRepo)({
            workshopId: workshop._id,
            bookingNumber,
            bookingDate: workshopInput.bookingDate,
            slotId: workshopInput.slotId,
            makingType: workshopInput.makingType,
            items: validatedItems,
            totalPeople: totalRequestedPeople,
            totalAmount,
            taxPercent,
            taxAmount,
            grandTotal,
            currency: 'AED',
            customer: data.customer,
            bookingType: data.bookingType || 'normal',
            giftDetails: data.bookingType === 'gift' ? data.giftDetails : undefined,
            giftValidity: data.bookingType === 'gift'
                ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                : undefined,
            bookingStatus: 'pending',
            paymentStatus: 'pending',
            userId: data.userId,
        });
        orderSubtotal += totalAmount;
        orderTaxAmount += taxAmount;
        orderGrandTotal += grandTotal;
        orderItems.push({
            bookingId: booking._id,
            workshopId: workshop._id,
            bookingDate: workshopInput.bookingDate,
            slotId: workshopInput.slotId,
            totalAmount: grandTotal,
        });
    }
    const order = await (0, workshopRepo_1.createWorkshopOrderRepo)({
        orderNumber,
        userId: data.userId,
        items: orderItems,
        subtotal: orderSubtotal,
        taxPercent: 5,
        taxAmount: orderTaxAmount,
        grandTotal: orderGrandTotal,
        currency: 'AED',
        paymentStatus: 'pending',
        isDeleted: false,
    });
    if (!order) {
        throw new appError_1.default('Order creation failed.', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    // Every booking in this flow comes from one request, so they share its type.
    const stripeSession = await (0, exports.createOrderPaymentSessionUseCase)(order, [
        data.bookingType || 'normal',
    ]);
    if (!stripeSession.url) {
        throw new appError_1.default('Stripe session URL not generated', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return {
        checkoutUrl: stripeSession.url,
    };
    //await session.commitTransaction();
    //session.endSession();
    // return true;
    //  } catch (error) {
    // await session.abortTransaction();
    // session.endSession();
    // throw error;
    //}
};
exports.createWorkshopBookingUseCase = createWorkshopBookingUseCase;
/** Booking types sold from the pottery front end rather than the main site. */
const POTTERY_BOOKING_TYPES = ['gift', 'pottery', 'events'];
/**
 * Picks the site Stripe should redirect back to after checkout.
 *
 * A cart can mix types (a gift line alongside a normal booking) but a Checkout
 * session carries only one success/cancel pair, so if any leg of the order
 * belongs to the pottery site the whole order returns there.
 *
 * Falls back to FRONTEND_URL when POTTERY_FRONTEND_URL is unset, so a missing
 * env var degrades to the main site instead of building an "undefined/success"
 * redirect that Stripe would reject.
 */
const resolveFrontendUrl = (bookingTypes = []) => {
    const isPottery = bookingTypes.some((type) => POTTERY_BOOKING_TYPES.includes(type));
    const baseUrl = isPottery ? process.env.POTTERY_FRONTEND_URL : process.env.FRONTEND_URL;
    // Trailing slashes are easy to leave in a .env and would build "//success".
    return (baseUrl || process.env.FRONTEND_URL)?.replace(/\/+$/, '');
};
const createOrderPaymentSessionUseCase = async (order, bookingTypes = []) => {
    const frontendUrl = resolveFrontendUrl(bookingTypes);
    const session = await stripe_1.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: order.currency.toLowerCase(),
                    product_data: {
                        name: `Workshop Order ${order.orderNumber}`,
                    },
                    unit_amount: Math.round(order.grandTotal * 100),
                },
                quantity: 1,
            },
        ],
        // SESSION METADATA
        metadata: {
            orderId: order._id.toString(),
        },
        // IMPORTANT
        payment_intent_data: {
            metadata: {
                orderId: order._id.toString(),
            },
        },
        success_url: `${frontendUrl}/success?orderId=${order._id.toString()}`,
        cancel_url: `${frontendUrl}/failure`,
    });
    console.log('SESSION CREATED');
    // console.log(session.id);
    // console.log(session.metadata);
    return session;
};
exports.createOrderPaymentSessionUseCase = createOrderPaymentSessionUseCase;
const getWorkshopBookingsUseCase = async (filters, limit, page) => {
    const result = await (0, workshopRepo_1.getAllWorkshopBookings)(filters, limit, page);
    return result;
};
exports.getWorkshopBookingsUseCase = getWorkshopBookingsUseCase;
/**
 * Removes test / failed / abandoned bookings. Confirmed bookings are excluded
 * by the repo query itself, so this only has to validate the shape of what the
 * dashboard sent and decide between the two modes:
 *   - ids given  -> delete exactly those rows
 *   - no ids     -> delete everything matching the list filters
 */
const deleteWorkshopBookingsUseCase = async (payload) => {
    const filters = { ...payload };
    if (filters.ids) {
        if (!Array.isArray(filters.ids) || !filters.ids.length) {
            throw new appError_1.default('No bookings selected', httpStatus_1.HttpStatus.BAD_REQUEST);
        }
        const invalidId = filters.ids.find((id) => !(0, objectIdParser_1.ObjectID)(id));
        if (invalidId) {
            throw new appError_1.default(`Invalid booking id: ${invalidId}`, httpStatus_1.HttpStatus.BAD_REQUEST);
        }
    }
    const { deletedCount, deletedOrderCount } = await (0, workshopRepo_1.softDeleteBookings)(filters);
    if (!deletedCount) {
        throw new appError_1.default('No bookings were removed — confirmed bookings cannot be deleted', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    return { deletedCount, deletedOrderCount };
};
exports.deleteWorkshopBookingsUseCase = deleteWorkshopBookingsUseCase;
/**
 * Powers the count shown in the confirm dialog before a bulk delete runs, so
 * the admin sees how many rows a filter would actually remove.
 */
const getDeletableBookingsCountUseCase = async (filters) => {
    const deletableCount = await (0, workshopRepo_1.countDeletableBookings)(filters);
    return { deletableCount };
};
exports.getDeletableBookingsCountUseCase = getDeletableBookingsCountUseCase;
const getWorkshopBookingByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const booking = await (0, workshopRepo_1.fetchWorkshopBookingById)(query._id);
        if (booking) {
            // The estimate and collection dates are derived, not stored, so the
            // dashboard reads them from here rather than re-implementing the rules.
            return { ...booking, trackingSummary: (0, potteryTrackingUseCase_1.buildTrackingSummary)(booking) };
        }
    }
    throw new appError_1.default('No Workshop Booking Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getWorkshopBookingByIdUseCase = getWorkshopBookingByIdUseCase;
// Used by the frontend success page after Stripe redirects back — the order
// carries every booking created from the cart checkout, each with its
// workshop details populated.
const getOrderDetailsUseCase = async (orderId) => {
    if (!(0, objectIdParser_1.ObjectID)(orderId)) {
        throw new appError_1.default('Invalid order reference', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const order = await (0, workshopRepo_1.getOrderByIdRepo)(orderId);
    if (!order) {
        throw new appError_1.default('Order not found', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    return order;
};
exports.getOrderDetailsUseCase = getOrderDetailsUseCase;
// export const addToCartUseCase = async (data: any) => {
//   const { userId, workshopId, bookingDate, slotId, optionId, people } = data;
//   const workshop = await getWorkshopByIdRepo(workshopId);
//   if (!workshop) throw new AppError('Workshop not found', 404);
//   // Validate SLOT
//   const slot = workshop.defaultSlots.find((s: any) =>
//     s._id.equals(new mongoose.Types.ObjectId(slotId)),
//   );
//   if (!slot) {
//     throw new AppError('Invalid slot selected', 400);
//   }
//   //  Validate OPTION
//   const option = workshop.options.find((o: any) =>
//     o._id.equals(new mongoose.Types.ObjectId(optionId)),
//   );
//   if (!option) {
//     throw new AppError('Invalid option selected', 400);
//   }
//   //check non-availability day
//   const dayName = new Date(bookingDate).toLocaleDateString('en-US', {
//     weekday: 'long',
//   });
//   if (workshop.nonAvailabilityDays.includes(dayName)) {
//     throw new AppError('Workshop not available on selected day', 400);
//   }
//   // check blocked dates
//   if (workshop.nonAvailabilityDates?.includes(bookingDate)) {
//     throw new AppError('Workshop not available on selected date', 400);
//   }
//   const price = option.price;
//   const subtotal = price * people;
//   let cart = await getCartByUserIdRepo(userId);
//   if (!cart) {
//     cart = await createCartRepo({
//       userId,
//       items: [],
//     });
//   }
//   // Check existing item
//   const existingItemIndex = cart.items.findIndex(
//     (item: any) =>
//       item.workshopId.equals(workshopId) &&
//       item.slotId.equals(slotId) &&
//       item.bookingDate === bookingDate &&
//       item.optionId.equals(optionId),
//   );
//   if (existingItemIndex > -1) {
//     cart.items[existingItemIndex].people += people;
//     cart.items[existingItemIndex].subtotal += subtotal;
//   } else {
//     cart.items.push({
//       workshopId,
//       bookingDate,
//       slotId,
//       optionId,
//       people,
//       price,
//       subtotal,
//       currency: option.currency || 'AED',
//     });
//   }
//   //  Recalculate totals
//   cart.totalPeople = cart.items.reduce((sum: number, i: any) => sum + i.people, 0);
//   cart.totalAmount = cart.items.reduce((sum: number, i: any) => sum + i.subtotal, 0);
//   cart.taxPercent = 5;
//   cart.taxAmount = (cart.totalAmount * 5) / 100;
//   cart.grandTotal = cart.totalAmount + cart.taxAmount;
//   await cart.save();
//   return cart;
// };
/**
 * A slot whose start time has already passed in UAE can no longer be attended,
 * so it must not sit in a cart or reach checkout. Gift bookings are exempt —
 * they carry no date until the recipient redeems them.
 */
const isBookingSlotExpired = (bookingType, bookingDate, slotStartTime, now = Date.now()) => {
    if (bookingType === 'gift')
        return false;
    if (!bookingDate)
        return false;
    return (0, uaeTime_1.isUaeSlotInPast)(bookingDate, slotStartTime, now);
};
exports.isBookingSlotExpired = isBookingSlotExpired;
/** Start time of the slot a cart item points at, read off the populated workshop. */
const getCartItemSlotStartTime = (item) => {
    const slots = item?.workshopId?.defaultSlots;
    if (!Array.isArray(slots))
        return null;
    const slot = slots.find((s) => String(s._id) === String(item.slotId));
    return slot?.startTime ?? null;
};
/** Positions of the cart items whose workshop date + slot time are in the past. */
const findExpiredCartItemIndexes = (items = [], now = Date.now()) => items.reduce((expired, item, index) => {
    const isExpired = (0, exports.isBookingSlotExpired)(item?.bookingType, item?.bookingDate, getCartItemSlotStartTime(item), now);
    if (isExpired)
        expired.push(index);
    return expired;
}, []);
exports.findExpiredCartItemIndexes = findExpiredCartItemIndexes;
const EXPIRED_CART_ITEMS_MESSAGE = 'Some workshops in your cart have already taken place and were removed. Please review your cart before continuing.';
/**
 * Same situation as above for the pottery front end, worded without the removal
 * promise — that cart lives in the browser, so the server has nothing to prune.
 */
const EXPIRED_BOOKING_ITEMS_MESSAGE = 'Some workshops in your booking have already taken place. Please review your selection before continuing.';
/**
 * Loads a cart with any expired items already dropped, so a past workshop is
 * never shown, priced in, or carried into checkout.
 */
const getCartUseCase = async (userId) => {
    const cart = await (0, workshopRepo_1.getCartByUserIdRepo)(userId);
    if (!cart)
        return { cart: null, removedExpiredItems: 0 };
    const expiredIndexes = (0, exports.findExpiredCartItemIndexes)(cart.items);
    if (!expiredIndexes.length)
        return { cart, removedExpiredItems: 0 };
    await (0, workshopRepo_1.removeCartItemsByIndexRepo)(userId, expiredIndexes);
    // Re-read so the returned cart carries the recalculated totals.
    const updatedCart = await (0, workshopRepo_1.getCartByUserIdRepo)(userId);
    return { cart: updatedCart, removedExpiredItems: expiredIndexes.length };
};
exports.getCartUseCase = getCartUseCase;
const addToCartUseCase = async (data) => {
    const { userId, workshopId, bookingDate, slotId, optionId, people, adult, child, handBuild, wheelPottery, bookingType = 'normal', workshopType, giftDetails, } = data;
    const workshop = await (0, workshopRepo_1.getWorkshopByIdRepo)(workshopId);
    if (!workshop) {
        throw new appError_1.default('Workshop not found', 404);
    }
    let slot = null;
    // Validate slot only for normal bookings
    if (bookingType !== 'gift') {
        slot = workshop.defaultSlots.find((s) => s._id.equals(new mongoose_1.default.Types.ObjectId(slotId)));
        if (!slot) {
            throw new appError_1.default('Invalid slot selected', 400);
        }
        // Check non-availability day
        const dayName = new Date(bookingDate).toLocaleDateString('en-US', {
            weekday: 'long',
        });
        if (workshop.nonAvailabilityDays.includes(dayName)) {
            throw new appError_1.default('Workshop not available on selected day', 400);
        }
        // Check blocked dates
        if (workshop.nonAvailabilityDates?.includes(bookingDate)) {
            throw new appError_1.default('Workshop not available on selected date', 400);
        }
        // Reject slots that have already started in UAE time
        if ((0, exports.isBookingSlotExpired)(bookingType, bookingDate, slot.startTime)) {
            throw new appError_1.default('Selected workshop date and time have already passed', 400);
        }
        // Closed by the studio on the dashboard's Block Slots page
        await (0, blockedTimeUseCase_1.assertSlotNotBlocked)(bookingDate, slot);
    }
    // Validate option
    const option = workshop.options.find((o) => o._id.equals(new mongoose_1.default.Types.ObjectId(optionId)));
    if (!option) {
        throw new appError_1.default('Invalid option selected', 400);
    }
    const { price, subtotal } = (0, workshopOptionPricing_1.priceWorkshopItem)(workshop.options, { optionId, people, adult, child }, workshopType);
    let cart = await (0, workshopRepo_1.getCartByUserIdRepo)(userId);
    if (!cart) {
        cart = await (0, workshopRepo_1.createCartRepo)({
            userId,
            items: [],
        });
    }
    // Check existing item.
    // Gift items are never merged — each gift can target a different recipient,
    // so it always becomes its own cart line (and later its own booking).
    // Family lines are not merged either: two families are two party prices, and
    // merging would add the head counts while charging for one party.
    const existingItemIndex = bookingType === 'gift' || (0, workshopOptionPricing_1.isFamilyBooking)(workshopType)
        ? -1
        : cart.items.findIndex((item) => item.workshopId.equals(workshopId) &&
            item.slotId?.equals(slotId) &&
            item.bookingDate === bookingDate &&
            item.optionId.equals(optionId));
    if (existingItemIndex > -1) {
        cart.items[existingItemIndex].people += people;
        cart.items[existingItemIndex].subtotal += subtotal;
    }
    else {
        cart.items.push({
            workshopId,
            bookingDate: bookingType === 'gift' ? undefined : bookingDate,
            slotId: bookingType === 'gift' ? undefined : slotId,
            optionId,
            people,
            adult: adult || 0,
            child: child || 0,
            price,
            subtotal,
            // Kept so checkout prices this line the same way it was quoted.
            workshopType,
            handBuild: handBuild || 0,
            wheelPottery: wheelPottery || 0,
            bookingType,
            giftDetails: bookingType === 'gift' ? giftDetails : undefined,
            currency: option.currency || 'AED',
        });
    }
    // Recalculate totals
    cart.totalPeople = cart.items.reduce((sum, i) => sum + i.people, 0);
    cart.totalAmount = cart.items.reduce((sum, i) => sum + i.subtotal, 0);
    cart.taxPercent = 5;
    cart.taxAmount = (cart.totalAmount * 5) / 100;
    cart.grandTotal = cart.totalAmount + cart.taxAmount;
    await cart.save();
    return cart;
};
exports.addToCartUseCase = addToCartUseCase;
const removeCartItemUseCase = async (data) => {
    const { userId, itemIndex } = data;
    const cart = await (0, workshopRepo_1.getCartByUserIdRepo)(userId);
    if (!cart)
        throw new appError_1.default('Cart not found', 404);
    // Validate index
    if (itemIndex === undefined || itemIndex < 0 || itemIndex >= cart.items.length) {
        throw new appError_1.default('Invalid item index', 400);
    }
    //  Remove item
    cart.items.splice(itemIndex, 1);
    // Recalculate totals
    cart.totalPeople = cart.items.reduce((sum, i) => sum + i.people, 0);
    cart.totalAmount = cart.items.reduce((sum, i) => sum + i.subtotal, 0);
    // Tax + Grand Total
    cart.taxPercent = 5;
    cart.taxAmount = (cart.totalAmount * cart.taxPercent) / 100;
    cart.grandTotal = cart.totalAmount + cart.taxAmount;
    await cart.save();
    return cart;
};
exports.removeCartItemUseCase = removeCartItemUseCase;
// export const checkoutCartUseCase = async (data: any) => {
//   const { userId, customer } = data;
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const cart = await getCartByUserIdRepo(userId);
//     if (!cart || cart.items.length === 0) {
//       throw new AppError('Cart is empty', 400);
//     }
//     const orderNumber = `ORD-${Date.now()}`;
//     let orderSubtotal = 0;
//     let orderTaxAmount = 0;
//     let orderGrandTotal = 0;
//     const orderItems: any[] = [];
//     // ✅ Group cart items
//     const groupedItems: Record<string, any> = {};
//     for (const item of cart.items) {
//       const key = `${item.workshopId}_${item.bookingDate}_${item.slotId}`;
//       if (!groupedItems[key]) {
//         groupedItems[key] = {
//           workshopId: item.workshopId,
//           bookingDate: item.bookingDate,
//           slotId: item.slotId,
//           items: [],
//         };
//       }
//       groupedItems[key].items.push(item);
//     }
//     //  Process each group
//     for (const group of Object.values(groupedItems)) {
//       const workshop = await getWorkshopByIdRepo(group.workshopId);
//       if (!workshop || !workshop.isActive) {
//         throw new AppError('Workshop not available', 404);
//       }
//       //  Validate SLOT
//       const slot = workshop.defaultSlots.find((s: any) =>
//         s._id.equals(new mongoose.Types.ObjectId(group.slotId)),
//       );
//       if (!slot) {
//         throw new AppError('Invalid slot selected', 400);
//       }
//       //  Check day availability
//       const dayName = new Date(group.bookingDate).toLocaleDateString('en-US', {
//         weekday: 'long',
//       });
//       if (workshop.nonAvailabilityDays?.includes(dayName)) {
//         throw new AppError('Workshop not available on selected day', 400);
//       }
//       //  Check blocked dates
//       if (workshop.nonAvailabilityDates?.includes(group.bookingDate)) {
//         throw new AppError('Workshop not available on selected date', 400);
//       }
//       //  Capacity check
//       const totalPeople = group.items.reduce((sum: number, i: any) => sum + i.people, 0);
//       const bookedCount = await getSlotBookedCount(
//         group.workshopId,
//         group.bookingDate,
//         group.slotId,
//       );
//       if (bookedCount + totalPeople > slot.capacity) {
//         throw new AppError('Slot capacity exceeded', 400);
//       }
//       let totalAmount = 0;
//       const validatedItems: any[] = [];
//       // Validate options
//       for (const item of group.items) {
//         const option = workshop.options.find((o: any) =>
//           o._id.equals(new mongoose.Types.ObjectId(item.optionId)),
//         );
//         if (!option) {
//           throw new AppError('Invalid option selected', 400);
//         }
//         const subtotal = option.price * item.people;
//         totalAmount += subtotal;
//         validatedItems.push({
//           optionId: option._id,
//           optionTitle: option.title,
//           price: option.price,
//           people: item.people,
//           subtotal,
//         });
//       }
//       const bookingNumber = `WB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//       const taxPercent = 5;
//       const taxAmount = (totalAmount * taxPercent) / 100;
//       const grandTotal = totalAmount + taxAmount;
//       //  Create booking inside transaction
//       const booking = await createWorkshopBookingRepo(
//         {
//           workshopId: group.workshopId,
//           bookingNumber,
//           bookingDate: group.bookingDate,
//           slotId: group.slotId,
//           items: validatedItems,
//           totalPeople,
//           totalAmount,
//           taxPercent,
//           taxAmount,
//           grandTotal,
//           currency: 'AED',
//           customer,
//           bookingStatus: 'pending',
//           paymentStatus: 'pending',
//           userId,
//         },
//         session,
//       );
//       orderSubtotal += totalAmount;
//       orderTaxAmount += taxAmount;
//       orderGrandTotal += grandTotal;
//       orderItems.push({
//         bookingId: booking._id,
//         workshopId: group.workshopId,
//         bookingDate: group.bookingDate,
//         slotId: group.slotId,
//         totalAmount: grandTotal,
//       });
//     }
//     // Create order
//     const order = await createWorkshopOrderRepo(
//       {
//         orderNumber,
//         userId,
//         items: orderItems,
//         subtotal: orderSubtotal,
//         taxPercent: 5,
//         taxAmount: orderTaxAmount,
//         grandTotal: orderGrandTotal,
//         currency: 'AED',
//         paymentStatus: 'pending',
//         isDeleted: false,
//       },
//       session,
//     );
//     if (!order) {
//       throw new AppError('Order creation failed', 400);
//     }
//     // Commit DB changes BEFORE Stripe
//     await session.commitTransaction();
//     session.endSession();
//     // Create Stripe session AFTER commit
//     const stripeSession = await createOrderPaymentSessionUseCase(order);
//     if (!stripeSession.url) {
//       throw new AppError('Stripe session failed', 400);
//     }
//     return {
//       checkoutUrl: stripeSession.url,
//       orderId: order._id,
//     };
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// };
const checkoutCartUseCase = async (data) => {
    const { userId, customer } = data;
    try {
        const cart = await (0, workshopRepo_1.getCartByUserIdRepo)(userId);
        if (!cart || cart.items.length === 0) {
            throw new appError_1.default('Cart is empty', 400);
        }
        // A cart can sit open past a workshop's start time. Drop those items and
        // stop here rather than charging for a session that has already run — the
        // customer needs to see the corrected cart before paying.
        const expiredIndexes = (0, exports.findExpiredCartItemIndexes)(cart.items);
        if (expiredIndexes.length) {
            await (0, workshopRepo_1.removeCartItemsByIndexRepo)(userId, expiredIndexes);
            throw new appError_1.default(EXPIRED_CART_ITEMS_MESSAGE, 400);
        }
        const orderNumber = `ORD-${Date.now()}`;
        let orderSubtotal = 0;
        let orderTaxAmount = 0;
        let orderGrandTotal = 0;
        const orderItems = [];
        // Group cart items.
        // Normal items are grouped by workshop + date + slot (one booking per slot).
        // Gift items are never grouped — each gift line becomes its own booking so
        // its recipient (giftDetails) is preserved.
        const groupedItems = {};
        cart.items.forEach((item, index) => {
            const isGift = item.bookingType === 'gift';
            const key = isGift
                ? `gift_${index}`
                : `${item.workshopId}_${item.bookingDate}_${item.slotId}`;
            if (!groupedItems[key]) {
                groupedItems[key] = {
                    workshopId: item.workshopId,
                    bookingDate: item.bookingDate,
                    slotId: item.slotId,
                    bookingType: item.bookingType || 'normal',
                    giftDetails: item.giftDetails,
                    items: [],
                };
            }
            groupedItems[key].items.push(item);
        });
        // The confirmed-booking count read per group below cannot see the rest of
        // this same cart, so an event sharing its slot with another line in the
        // cart would slip through. Catch that here, before any booking is written.
        const eventSlotSharedWithinCart = Object.values(groupedItems).some((group) => {
            if (!(0, slotCapacity_1.isEventsBooking)(group.bookingType) || !group.bookingDate)
                return false;
            return Object.values(groupedItems).some((other) => other !== group &&
                other.bookingDate === group.bookingDate &&
                String(other.slotId) === String(group.slotId));
        });
        if (eventSlotSharedWithinCart) {
            throw new appError_1.default(slotCapacity_1.EVENT_SLOT_NOT_EXCLUSIVE_REASON, 400);
        }
        // Process each group
        for (const group of Object.values(groupedItems)) {
            const isGift = group.bookingType === 'gift';
            const workshop = await (0, workshopRepo_1.getWorkshopByIdRepo)(group.workshopId);
            if (!workshop || !workshop.isActive) {
                throw new appError_1.default('Workshop not available', 404);
            }
            // Slot, day and date availability checks only apply to non-gift bookings —
            // gift bookings have no scheduled slot until the recipient redeems.
            let slot = null;
            if (!isGift) {
                // Validate SLOT
                slot = workshop.defaultSlots.find((s) => s._id.equals(group.slotId));
                if (!slot) {
                    throw new appError_1.default('Invalid slot selected', 400);
                }
                // Check day availability
                const dayName = new Date(group.bookingDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                });
                if (workshop.nonAvailabilityDays?.includes(dayName)) {
                    throw new appError_1.default('Workshop not available on selected day', 400);
                }
                // Check blocked dates
                if (workshop.nonAvailabilityDates?.includes(group.bookingDate)) {
                    throw new appError_1.default('Workshop not available on selected date', 400);
                }
                // Second line of defence against a past slot: the cart items were
                // pruned above using the populated workshop, this re-checks against the
                // slot actually loaded here.
                if ((0, exports.isBookingSlotExpired)(group.bookingType, group.bookingDate, slot.startTime)) {
                    throw new appError_1.default(EXPIRED_CART_ITEMS_MESSAGE, 400);
                }
                // The studio may have closed this window after it went into the cart.
                await (0, blockedTimeUseCase_1.assertSlotNotBlocked)(group.bookingDate, slot);
            }
            // Capacity check (skipped for gift bookings)
            const totalPeople = group.items.reduce((sum, i) => sum + i.people, 0);
            if (!isGift && slot) {
                // const bookedCount = await getSlotBookedCount(
                //   group.workshopId,
                //   group.bookingDate,
                //   group.slotId,
                // );
                const bookedCount = await (0, workshopRepo_1.getSlotBookedCount)(group.bookingDate, slot.startTime, slot.endTime);
                // Events get 25 seats only while nothing else holds the slot; otherwise
                // they share the ordinary studio capacity like any other booking.
                if ((0, slotCapacity_1.isEventBlockedByExistingBookings)(group.bookingType, bookedCount, totalPeople)) {
                    throw new appError_1.default(slotCapacity_1.EVENT_SLOT_NOT_EXCLUSIVE_REASON, 400);
                }
                const MAX_CAPACITY = (0, slotCapacity_1.resolveSlotCapacity)(group.bookingType, bookedCount);
                if (bookedCount + totalPeople > MAX_CAPACITY) {
                    throw new appError_1.default('Slot capacity exceeded', 400);
                }
            }
            let totalAmount = 0;
            const validatedItems = [];
            // Validate options
            for (const item of group.items) {
                const option = (0, workshopOptionPricing_1.findOptionById)(workshop.options, item.optionId);
                if (!option) {
                    throw new appError_1.default('Invalid option selected', 400);
                }
                const { price, subtotal, breakdown } = (0, workshopOptionPricing_1.priceWorkshopItem)(workshop.options, item, item.workshopType);
                totalAmount += subtotal;
                validatedItems.push({
                    optionId: option._id,
                    optionTitle: option.title,
                    price,
                    people: item.people,
                    adult: item.adult || 0,
                    child: item.child || 0,
                    handBuild: item.handBuild || 0,
                    wheelPottery: item.wheelPottery || 0,
                    subtotal,
                    priceBreakdown: breakdown,
                });
            }
            const bookingNumber = `WB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const taxPercent = 5;
            const taxAmount = (totalAmount * taxPercent) / 100;
            const grandTotal = totalAmount + taxAmount;
            // Create booking
            const booking = await (0, workshopRepo_1.createWorkshopBookingRepo)({
                workshopId: group.workshopId,
                bookingNumber,
                bookingDate: isGift ? undefined : group.bookingDate,
                slotId: isGift ? undefined : group.slotId,
                items: validatedItems,
                totalPeople,
                totalAmount,
                taxPercent,
                taxAmount,
                grandTotal,
                currency: 'AED',
                customer,
                bookingType: group.bookingType || 'normal',
                giftDetails: isGift ? group.giftDetails : undefined,
                giftValidity: isGift
                    ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                    : undefined,
                bookingStatus: 'pending',
                paymentStatus: 'pending',
                userId,
            });
            orderSubtotal += totalAmount;
            orderTaxAmount += taxAmount;
            orderGrandTotal += grandTotal;
            orderItems.push({
                bookingId: booking._id,
                workshopId: group.workshopId,
                bookingDate: isGift ? undefined : group.bookingDate,
                slotId: isGift ? undefined : group.slotId,
                totalAmount: grandTotal,
            });
        }
        // Create order
        const order = await (0, workshopRepo_1.createWorkshopOrderRepo)({
            orderNumber,
            userId,
            items: orderItems,
            subtotal: orderSubtotal,
            taxPercent: 5,
            taxAmount: orderTaxAmount,
            grandTotal: orderGrandTotal,
            currency: 'AED',
            paymentStatus: 'pending',
            isDeleted: false,
        });
        if (!order) {
            throw new appError_1.default('Order creation failed', 400);
        }
        //  Create Stripe session AFTER DB save
        // A cart can hold several groups with different types — pass them all so the
        // redirect resolves against the whole order, not just one leg of it.
        const stripeSession = await (0, exports.createOrderPaymentSessionUseCase)(order, Object.values(groupedItems).map((group) => group.bookingType));
        if (!stripeSession.url) {
            throw new appError_1.default('Stripe session failed', 400);
        }
        return {
            checkoutUrl: stripeSession.url,
            orderId: order._id,
        };
    }
    catch (error) {
        // Preserve specific validation errors (empty cart, invalid slot/option,
        // capacity, gift errors, etc.); only wrap truly unexpected failures.
        if (error instanceof appError_1.default) {
            throw error;
        }
        throw new appError_1.default('Checkout failed', 500);
    }
};
exports.checkoutCartUseCase = checkoutCartUseCase;
/**
 * Checkout for the pottery front end, which keeps the cart in the browser and
 * never asks the visitor to sign in. Same bookings -> order -> Stripe session
 * flow as `checkoutCartUseCase`, with two differences:
 *   - the entries arrive in the request body instead of a stored cart, so
 *     nothing is read from or cleared out of the `cart` collection;
 *   - no userId is written, since there is no account behind the purchase.
 *
 * The body mirrors POST /workshop/booking's `workshops` array, except each
 * entry carries its own bookingType and giftDetails — so one request can hold a
 * gift voucher alongside a dated pottery session. Each entry becomes one
 * booking; the front end has already grouped its lines, so nothing is regrouped
 * here.
 *
 * Everything is validated (workshop, slot, day/date blocks, past slots, options
 * and capacity) before the first booking is written, so a bad entry further
 * down the payload cannot leave half an order behind.
 */
const potteryBookingUseCase = async (data) => {
    const { customer, workshops } = data;
    try {
        if (!Array.isArray(workshops) || workshops.length === 0) {
            throw new appError_1.default('No workshops provided', 400);
        }
        const entries = workshops;
        // The confirmed-booking count read per entry below cannot see the rest of
        // this same payload, so an event sharing its slot with another entry in the
        // request would slip through. Catch that here, before any booking is written.
        const eventSlotSharedWithinRequest = entries.some((entry) => {
            if (!(0, slotCapacity_1.isEventsBooking)(entry.bookingType) || !entry.bookingDate)
                return false;
            return entries.some((other) => other !== entry &&
                other.bookingDate === entry.bookingDate &&
                String(other.slotId) === String(entry.slotId));
        });
        if (eventSlotSharedWithinRequest) {
            throw new appError_1.default(slotCapacity_1.EVENT_SLOT_NOT_EXCLUSIVE_REASON, 400);
        }
        // PASS 1 — validate and price every entry. Nothing is persisted here.
        const preparedEntries = [];
        for (const entry of entries) {
            const isGift = entry.bookingType === 'gift';
            const workshop = await (0, workshopRepo_1.getWorkshopByIdRepo)(entry.workshopId);
            if (!workshop || !workshop.isActive) {
                throw new appError_1.default('Workshop not available', 404);
            }
            // Slot, day and date availability checks only apply to non-gift bookings —
            // gift bookings have no scheduled slot until the recipient redeems.
            let slot = null;
            if (!isGift) {
                // Only gift entries may omit the schedule. Without this, an entry
                // missing a date would skip both the blocked-date and the expired-slot
                // checks below, since each treats an absent date as "nothing to check".
                if (!entry.bookingDate) {
                    throw new appError_1.default('Booking date is required', 400);
                }
                // Validate SLOT
                slot = workshop.defaultSlots.find((s) => s._id.equals(entry.slotId));
                if (!slot) {
                    throw new appError_1.default('Invalid slot selected', 400);
                }
                // Check day availability
                const dayName = new Date(entry.bookingDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                });
                if (workshop.nonAvailabilityDays?.includes(dayName)) {
                    throw new appError_1.default('Workshop not available on selected day', 400);
                }
                // Check blocked dates
                if (workshop.nonAvailabilityDates?.includes(entry.bookingDate)) {
                    throw new appError_1.default('Workshop not available on selected date', 400);
                }
                // A browser-held cart can sit open past a workshop's start time, so the
                // request may still carry a session that has already run.
                if ((0, exports.isBookingSlotExpired)(entry.bookingType, entry.bookingDate, slot.startTime)) {
                    throw new appError_1.default(EXPIRED_BOOKING_ITEMS_MESSAGE, 400);
                }
                // The studio may have closed this window while the cart sat open.
                await (0, blockedTimeUseCase_1.assertSlotNotBlocked)(entry.bookingDate, slot);
            }
            // Capacity check (skipped for gift bookings)
            const totalPeople = entry.items.reduce((sum, i) => sum + i.people, 0);
            if (!isGift && slot) {
                const bookedCount = await (0, workshopRepo_1.getSlotBookedCount)(entry.bookingDate, slot.startTime, slot.endTime);
                // Events get 25 seats only while nothing else holds the slot; otherwise
                // they share the ordinary studio capacity like any other booking.
                if ((0, slotCapacity_1.isEventBlockedByExistingBookings)(entry.bookingType, bookedCount, totalPeople)) {
                    throw new appError_1.default(slotCapacity_1.EVENT_SLOT_NOT_EXCLUSIVE_REASON, 400);
                }
                const MAX_CAPACITY = (0, slotCapacity_1.resolveSlotCapacity)(entry.bookingType, bookedCount);
                if (bookedCount + totalPeople > MAX_CAPACITY) {
                    throw new appError_1.default('Slot capacity exceeded', 400);
                }
            }
            let totalAmount = 0;
            const validatedItems = [];
            // Validate options. Prices are always read off the workshop, never taken
            // from the payload — this cart lives in the browser, so it is untrusted.
            for (const item of entry.items) {
                const option = (0, workshopOptionPricing_1.findOptionById)(workshop.options, item.optionId);
                if (!option) {
                    throw new appError_1.default('Invalid option selected', 400);
                }
                // A family entry charges the option's party price once and adds the
                // guests beyond it from the workshop's extra-adult/extra-child options.
                const { price, subtotal, breakdown } = (0, workshopOptionPricing_1.priceWorkshopItem)(workshop.options, item, item.workshopType ?? entry.workshopType);
                totalAmount += subtotal;
                validatedItems.push({
                    optionId: option._id,
                    optionTitle: option.title,
                    price,
                    people: item.people,
                    adult: item.adult || 0,
                    child: item.child || 0,
                    handBuild: item.handBuild || 0,
                    wheelPottery: item.wheelPottery || 0,
                    subtotal,
                    priceBreakdown: breakdown,
                });
            }
            const taxPercent = 5;
            const taxAmount = (totalAmount * taxPercent) / 100;
            const grandTotal = totalAmount + taxAmount;
            preparedEntries.push({
                entry,
                isGift,
                validatedItems,
                totalPeople,
                totalAmount,
                taxPercent,
                taxAmount,
                grandTotal,
            });
        }
        // PASS 2 — everything checked out, so write the bookings and the order.
        const orderNumber = `ORD-${Date.now()}`;
        let orderSubtotal = 0;
        let orderTaxAmount = 0;
        let orderGrandTotal = 0;
        const orderItems = [];
        for (const prepared of preparedEntries) {
            const { entry, isGift, validatedItems, totalPeople, totalAmount } = prepared;
            const { taxPercent, taxAmount, grandTotal } = prepared;
            const bookingNumber = `WB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const booking = await (0, workshopRepo_1.createWorkshopBookingRepo)({
                workshopId: entry.workshopId,
                bookingNumber,
                bookingDate: isGift ? undefined : entry.bookingDate,
                slotId: isGift ? undefined : entry.slotId,
                makingType: entry.makingType,
                items: validatedItems,
                totalPeople,
                totalAmount,
                taxPercent,
                taxAmount,
                grandTotal,
                currency: 'AED',
                customer,
                bookingType: entry.bookingType || 'normal',
                giftDetails: isGift ? entry.giftDetails : undefined,
                giftValidity: isGift
                    ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                    : undefined,
                bookingStatus: 'pending',
                paymentStatus: 'pending',
            });
            orderSubtotal += totalAmount;
            orderTaxAmount += taxAmount;
            orderGrandTotal += grandTotal;
            orderItems.push({
                bookingId: booking._id,
                workshopId: entry.workshopId,
                bookingDate: isGift ? undefined : entry.bookingDate,
                slotId: isGift ? undefined : entry.slotId,
                totalAmount: grandTotal,
            });
        }
        // Create order — no userId, so the webhook's cart-clear step simply skips it.
        const order = await (0, workshopRepo_1.createWorkshopOrderRepo)({
            orderNumber,
            items: orderItems,
            subtotal: orderSubtotal,
            taxPercent: 5,
            taxAmount: orderTaxAmount,
            grandTotal: orderGrandTotal,
            currency: 'AED',
            paymentStatus: 'pending',
            isDeleted: false,
        });
        if (!order) {
            throw new appError_1.default('Order creation failed', 400);
        }
        // Create Stripe session AFTER DB save.
        // A request can hold several entries with different types — pass them all so
        // the redirect resolves against the whole order, not just one leg of it.
        const stripeSession = await (0, exports.createOrderPaymentSessionUseCase)(order, preparedEntries.map((prepared) => prepared.entry.bookingType));
        if (!stripeSession.url) {
            throw new appError_1.default('Stripe session failed', 400);
        }
        return {
            checkoutUrl: stripeSession.url,
            orderId: order._id,
        };
    }
    catch (error) {
        // Preserve specific validation errors (no workshops, invalid slot/option,
        // capacity, gift errors, etc.); only wrap truly unexpected failures.
        if (error instanceof appError_1.default) {
            throw error;
        }
        throw new appError_1.default('Booking failed', 500);
    }
};
exports.potteryBookingUseCase = potteryBookingUseCase;
// Load booking details using bookingId from the email URL — no voucher code needed here.
// Returns enough info to display the redeem page; voucher code is NOT returned.
const validateGiftVoucherUseCase = async (bookingId) => {
    if (!(0, objectIdParser_1.ObjectID)(bookingId)) {
        throw new appError_1.default('Invalid booking reference', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const booking = await (0, workshopRepo_1.getGiftBookingByIdRepo)(bookingId);
    if (!booking) {
        throw new appError_1.default('Booking not found', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    if (booking.giftStatus === 'redeemed') {
        throw new appError_1.default('This gift voucher has already been redeemed', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    if (booking.paymentStatus !== 'paid') {
        throw new appError_1.default('This gift voucher is not yet active', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    if (booking.giftValidity && new Date() > new Date(booking.giftValidity)) {
        throw new appError_1.default('This gift voucher has expired', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const workshop = await (0, workshopRepo_1.getWorkshopByIdRepo)(booking.workshopId.toString());
    if (!workshop) {
        throw new appError_1.default('Workshop not found', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    return {
        bookingId: booking._id,
        giftStatus: booking.giftStatus,
        recipientName: booking.giftDetails?.recipientName,
        occasion: booking.giftDetails?.occasion,
        personalMessage: booking.giftDetails?.personalMessage,
        workshop: {
            _id: workshop._id,
            title: workshop.title,
            slug: workshop.slug,
            defaultSlots: workshop.defaultSlots,
        },
        items: booking.items,
        totalPeople: booking.totalPeople,
        grandTotal: booking.grandTotal,
        currency: booking.currency,
    };
};
exports.validateGiftVoucherUseCase = validateGiftVoucherUseCase;
// Confirm redemption — requires BOTH bookingId (from URL) AND voucherCode (typed by recipient).
const confirmGiftRedemptionUseCase = async (data) => {
    const { bookingId, voucherCode, bookingDate, slotId, recipientName, recipientPhone, recipientEmail, } = data;
    if (!(0, objectIdParser_1.ObjectID)(bookingId)) {
        throw new appError_1.default('Invalid booking reference', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    // Both bookingId AND voucherCode must match the same document
    const booking = await (0, workshopRepo_1.getBookingByVoucherCodeRepo)(bookingId, voucherCode);
    if (!booking) {
        throw new appError_1.default('Invalid voucher code', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    if (booking.giftStatus === 'redeemed') {
        throw new appError_1.default('This gift voucher has already been redeemed', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    if (booking.paymentStatus !== 'paid') {
        throw new appError_1.default('This gift voucher is not yet active', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    if (booking.giftValidity && new Date() > new Date(booking.giftValidity)) {
        throw new appError_1.default('This gift voucher has expired', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const workshop = await (0, workshopRepo_1.getWorkshopByIdRepo)(booking.workshopId.toString());
    if (!workshop) {
        throw new appError_1.default('Workshop not found', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    const slot = workshop.defaultSlots.find((s) => s._id.toString() === slotId);
    if (!slot) {
        throw new appError_1.default('Selected slot not found', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    // A voucher cannot be redeemed into a window the studio has closed.
    await (0, blockedTimeUseCase_1.assertSlotNotBlocked)(bookingDate, slot);
    const bookedCount = await (0, workshopRepo_1.getSlotBookedCount)(bookingDate, slot.startTime, slot.endTime);
    // Events get 25 seats only while nothing else holds the slot; otherwise they
    // share the ordinary studio capacity like any other booking.
    if ((0, slotCapacity_1.isEventBlockedByExistingBookings)(booking.bookingType, bookedCount, booking.totalPeople)) {
        throw new appError_1.default(slotCapacity_1.EVENT_SLOT_NOT_EXCLUSIVE_REASON, httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const MAX_CAPACITY = (0, slotCapacity_1.resolveSlotCapacity)(booking.bookingType, bookedCount);
    if (bookedCount + booking.totalPeople > MAX_CAPACITY) {
        throw new appError_1.default(`This slot is fully booked. Only ${MAX_CAPACITY - bookedCount} spot(s) remaining.`, httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const updatedBooking = await (0, workshopRepo_1.redeemGiftBookingRepo)(booking._id.toString(), bookingDate, slotId);
    // Notify the recipient (if we have their email) and the buyer that the gift
    // is now a confirmed, scheduled booking. The mail service swallows its own
    // errors, so a mail failure never blocks the redemption.
    const giftRecipientEmail = recipientEmail || booking.giftDetails?.giftEmail;
    const buyerEmail = booking.customer?.email;
    const toEmail = giftRecipientEmail || buyerEmail;
    if (toEmail) {
        const ccList = [];
        if (giftRecipientEmail && buyerEmail && giftRecipientEmail !== buyerEmail) {
            ccList.push(buyerEmail);
        }
        if (process.env.CC_EMAIL) {
            ccList.push(process.env.CC_EMAIL);
        }
        await (0, workshopBookingMailService_1.sendWorkshopBookingConfirmationMail)({
            order: {
                orderNumber: updatedBooking?.bookingNumber,
                grandTotal: booking.grandTotal,
            },
            bookingsData: [
                {
                    booking: updatedBooking,
                    workshop,
                    slot,
                },
            ],
            to: toEmail,
            cc: ccList,
        });
    }
    return {
        bookingNumber: updatedBooking?.bookingNumber,
        workshopTitle: workshop.title,
        bookingDate,
        slot: {
            label: slot.label,
            startTime: slot.startTime,
            endTime: slot.endTime,
        },
        totalPeople: booking.totalPeople,
        grandTotal: booking.grandTotal,
        currency: booking.currency,
        recipientName: recipientName || booking.giftDetails?.recipientName,
        recipientEmail: recipientEmail || booking.giftDetails?.giftEmail,
        recipientPhone,
        items: booking.items,
    };
};
exports.confirmGiftRedemptionUseCase = confirmGiftRedemptionUseCase;
const checkPotteryWorkshopCapacityUseCase = async (data) => {
    const { bookingDate, startTime, endTime } = data;
    if (!bookingDate || !startTime || !endTime) {
        throw new appError_1.default('Booking date, start time and end time are required', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return await (0, workshopRepo_1.fetchPotteryWorkshopCapacity)(data);
};
exports.checkPotteryWorkshopCapacityUseCase = checkPotteryWorkshopCapacityUseCase;
