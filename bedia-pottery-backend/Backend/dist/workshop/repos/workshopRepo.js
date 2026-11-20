"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackingTokenExistsRepo = exports.countTrackedBookingsByStatusRepo = exports.findActiveTrackedBookingsRepo = exports.getBookingByTrackingTokenRepo = exports.getBookingForTrackingRepo = exports.softDeleteBookings = exports.countDeletableBookings = exports.buildDeletableBookingsQuery = exports.fetchPotteryWorkshopCapacity = exports.redeemGiftBookingRepo = exports.getBookingByVoucherCodeRepo = exports.getGiftBookingByIdRepo = exports.getBookingsByIdsRepo = exports.clearCartRepo = exports.removeCartItemsByIndexRepo = exports.getCartByUserIdRepo = exports.createCartRepo = exports.fetchWorkshopBookingById = exports.getAllWorkshopBookings = exports.updateOrderItemsSlotTimes = exports.updateBookingsSlotTimesByIds = exports.updateBookingsPaymentStatusByIds = exports.getOrderByIdRepo = exports.updateOrderPaymentStatus = exports.createWorkshopOrderRepo = exports.getSlotBookedCount = exports.createWorkshopBookingRepo = exports.getWorkshopByIdRepo = exports.fetchPotteryWorkshopAvailability = exports.fetchWorkshopAvailability = exports.createWorkshop = exports.updateWorkshopById = exports.deleteWorkshopById = exports.fetchWorkshopBySlug = exports.fetchWorkshopById = exports.fetchAllWorkshopsForAdmin = exports.fetchHomepageWorkshops = exports.fetchWorkshopsByCategory = exports.fetchAllWorkshops = exports.getWorkshopsCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const workshopModel_1 = __importDefault(require("../models/workshopModel"));
const categoryModel_1 = __importDefault(require("../../category/models/categoryModel"));
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const workshopBookingModel_1 = __importDefault(require("../models/workshopBookingModel"));
const workshopOrders_1 = __importDefault(require("../models/workshopOrders"));
const mongoose_1 = __importDefault(require("mongoose"));
const cartModel_1 = __importDefault(require("../models/cartModel"));
const slotOverlap_1 = require("../../utils/slotOverlap");
const slotCapacity_1 = require("../../utils/slotCapacity");
const blockedTimes_1 = require("../../utils/blockedTimes");
const blockedTimeRepo_1 = require("../../studio/repos/blockedTimeRepo");
/**
 * Collects the slot ids of every active workshop that runs at any point during
 * the given time range. Studio capacity is shared, so an overlapping slot of a
 * different workshop consumes the same seats — e.g. the 06:30 PM - 08:30 PM
 * event slot shares the room with 06:00 PM - 07:30 PM and 08:00 PM - 09:30 PM.
 */
/**
 * How long a pending booking keeps its seats. It matches the lifetime of the
 * Stripe Checkout session (30 minutes is Stripe's own minimum), so a customer
 * can never pay after their seats have been released.
 */
const SEAT_HOLD_MINUTES = 30;
exports.SEAT_HOLD_MINUTES = SEAT_HOLD_MINUTES;
const seatHoldExpiry = (from = Date.now()) => new Date(from + SEAT_HOLD_MINUTES * 60 * 1000);
exports.seatHoldExpiry = seatHoldExpiry;
/**
 * Which bookings take seats: confirmed ones, plus pending ones whose hold has not
 * run out. Counting the pending holds is what stops two people reserving the last
 * seats at the same time. Pending bookings without a hold (anything made before
 * holds existed) take no seats, exactly as before.
 */
const seatHoldMatch = (now = new Date()) => ({
    $or: [
        { bookingStatus: { $in: ['confirmed', 'paid'] } },
        { bookingStatus: 'pending', paymentStatus: 'pending', holdExpiresAt: { $gt: now } },
    ],
});
exports.seatHoldMatch = seatHoldMatch;
/**
 * `$group` fields for counting seats: the people holding them, and how many of
 * those bookings are events (a birthday party or corporate event).
 */
const seatTotalsGroup = {
    _id: null,
    totalPeople: { $sum: '$totalPeople' },
    eventBookings: { $sum: { $cond: [{ $eq: ['$bookingType', 'events'] }, 1, 0] } },
};
/**
 * An events booking is a private group that takes the whole room, so while one
 * holds a slot nobody else can book it, however few guests it has. Reporting the
 * slot as full (the 25 an event may take) makes every capacity check that reads
 * this count refuse further bookings, with no change to those checks.
 */
const countWithEventExclusivity = (totals) => {
    if (!totals)
        return 0;
    const people = totals.totalPeople ?? 0;
    return totals.eventBookings > 0 ? Math.max(people, slotCapacity_1.EXCLUSIVE_EVENT_SLOT_CAPACITY) : people;
};
const getOverlappingSlotIds = async (range) => {
    const workshops = await workshopModel_1.default.find({
        isDeleted: false,
        isActive: true,
    });
    return workshops.flatMap((workshop) => workshop.defaultSlots
        .filter((slot) => (0, slotOverlap_1.doSlotsOverlap)({ startTime: slot.startTime, endTime: slot.endTime }, range))
        .map((slot) => slot._id));
};
const getWorkshopsCount = async (query) => {
    return await workshopModel_1.default.countDocuments(query);
};
exports.getWorkshopsCount = getWorkshopsCount;
const fetchAllWorkshops = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await workshopModel_1.default
        .find(dbQuery)
        .populate({
        path: 'categoryId',
        select: 'title image description -_id slug',
    })
        .select({
        keyAdvantages: 0,
        overview: 0,
        imageTitle: 0,
        imageDescription: 0,
        isDeleted: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllWorkshops = fetchAllWorkshops;
const fetchWorkshopsByCategory = async (query, skip, limit) => {
    const workshops = await workshopModel_1.default
        .find(query)
        .select({
        keyAdvantages: 0,
        overview: 0,
        imageTitle: 0,
        imageDescription: 0,
        isDeleted: 0,
        createdAt: 0,
        updatedAt: 0,
        defaultSlots: 0,
        nonAvailabilityDates: 0,
        nonAvailabilityDays: 0,
        showOnHomepage: 0,
        __v: 0,
        isActive: 0,
        categoryId: 0,
        description: 0,
    })
        // Keep only the first option so its price can be surfaced on the card
        .slice('options', 1)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    return workshops.map(({ options, ...workshop }) => ({
        ...workshop,
        price: options?.[0]?.price ?? null,
        currency: options?.[0]?.currency ?? null,
    }));
};
exports.fetchWorkshopsByCategory = fetchWorkshopsByCategory;
// export const fetchWorkshopsByCategory = async (query: any, skip: number, limit: number) => {
//   return await workshopModel
//     .find(query)
//     .select({
//       keyAdvantages: 0,
//       overview: 0,
//       imageTitle: 0,
//       imageDescription: 0,
//       isDeleted: 0,
//       createdAt: 0,
//       updatedAt: 0,
//       defaultSlots: 0,
//       nonAvailabilityDates: 0,
//       nonAvailabilityDays: 0,
//       options: 0,
//       showOnHomepage: 0,
//       __v: 0,
//       isActive: 0,
//       categoryId: 0,
//       description: 0,
//     })
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit)
//     .lean();
// };
// export const fetchHomepageWorkshops = async () => {
//   return await categoryModel.aggregate([
//     // Homepage categories
//     {
//       $match: {
//         showOnHomepage: true,
//         isDeleted: false,
//         isActive: true,
//       },
//     },
//     // Fetch child categories
//     {
//       $lookup: {
//         from: 'categories',
//         localField: '_id',
//         foreignField: 'parentId',
//         as: 'childCategories',
//       },
//     },
//     // fetch parent category
//     {
//       $lookup: {
//         from: 'categories',
//         localField: 'parentId',
//         foreignField: '_id',
//         as: 'parentCategory',
//       },
//     },
//     // Convert parent array → object
//     {
//       $addFields: {
//         parentCategory: { $arrayElemAt: ['$parentCategory', 0] },
//       },
//     },
//     // Collect category IDs (parent + children)
//     {
//       $addFields: {
//         allCategoryIds: {
//           $concatArrays: [
//             ['$_id'],
//             {
//               $map: {
//                 input: '$childCategories',
//                 as: 'child',
//                 in: '$$child._id',
//               },
//             },
//           ],
//         },
//       },
//     },
//     // Fetch workshops
//     {
//       $lookup: {
//         from: 'workshops',
//         let: { categoryIds: '$allCategoryIds' },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $in: ['$categoryId', '$$categoryIds'] },
//                   { $eq: ['$showOnHomepage', true] },
//                   { $eq: ['$isActive', true] },
//                   { $eq: ['$isDeleted', false] },
//                 ],
//               },
//             },
//           },
//           {
//             $project: {
//               _id: 1,
//               title: 1,
//               bannerImage: 1,
//               images: 1,
//               shortDescription: 1,
//               slug: 1,
//               type: 1,
//             },
//           },
//         ],
//         as: 'cards',
//       },
//     },
//     {
//       $project: {
//         _id: 1,
//         imageUrl: { $arrayElemAt: ['$image', 0] },
//         title: '$title',
//         description: '$description',
//         shortDescription: '$shortDescription',
//         parentTitle: '$parentCategory.title',
//         cards: 1,
//       },
//     },
//   ]);
// };
const fetchHomepageWorkshops = async () => {
    return await categoryModel_1.default.aggregate([
        // Homepage main categories only (child category workshops are merged into the parent's cards)
        {
            $match: {
                parentId: null,
                showOnHomepage: true,
                isDeleted: false,
                isActive: true,
            },
        },
        // Fetch child categories
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: 'parentId',
                as: 'childCategories',
            },
        },
        // Collect category IDs (parent + children)
        {
            $addFields: {
                allCategoryIds: {
                    $concatArrays: [
                        ['$_id'],
                        {
                            $map: {
                                input: '$childCategories',
                                as: 'child',
                                in: '$$child._id',
                            },
                        },
                    ],
                },
            },
        },
        // Fetch workshops
        {
            $lookup: {
                from: 'workshops',
                let: { categoryIds: '$allCategoryIds' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ['$categoryId', '$$categoryIds'] },
                                    { $eq: ['$showOnHomepage', true] },
                                    { $eq: ['$isActive', true] },
                                    { $eq: ['$isDeleted', false] },
                                ],
                            },
                        },
                    },
                    // Oldest workshops first
                    { $sort: { createdAt: 1 } },
                    // Attach the workshop's own category (title, 1 image, slug)
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'categoryId',
                            foreignField: '_id',
                            as: 'category',
                        },
                    },
                    {
                        $addFields: {
                            category: { $arrayElemAt: ['$category', 0] },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            bannerImage: 1,
                            images: 1,
                            shortDescription: 1,
                            slug: 1,
                            type: 1,
                            category: {
                                _id: '$category._id',
                                title: '$category.title',
                                slug: '$category.slug',
                                shortDescription: '$category.shortDescription',
                                image: { $arrayElemAt: ['$category.image', 0] },
                            },
                        },
                    },
                ],
                as: 'cards',
            },
        },
        {
            $project: {
                _id: 1,
                imageUrl: { $arrayElemAt: ['$image', 0] },
                title: '$title',
                description: '$description',
                shortDescription: '$shortDescription',
                cards: 1,
            },
        },
    ]);
};
exports.fetchHomepageWorkshops = fetchHomepageWorkshops;
const fetchAllWorkshopsForAdmin = async (query, skip, limit) => {
    const dbQuery = {
        ...query,
        isDeleted: false,
    };
    return await workshopModel_1.default
        .find(dbQuery)
        .populate({
        path: 'categoryId',
        select: 'title image description -_id',
    })
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllWorkshopsForAdmin = fetchAllWorkshopsForAdmin;
const fetchWorkshopById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await workshopModel_1.default
        .findOne(dbQuery)
        .populate({
        path: 'categoryId',
        select: 'title',
    })
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .lean();
};
exports.fetchWorkshopById = fetchWorkshopById;
const fetchWorkshopBySlug = async (slug) => {
    const dbQuery = {
        slug: slug,
        isDeleted: false,
    };
    return await workshopModel_1.default
        .findOne(dbQuery)
        .populate({
        path: 'categoryId',
        select: 'title',
    })
        .select({ isDeleted: 0, updatedAt: 0, __v: 0 })
        .lean();
};
exports.fetchWorkshopBySlug = fetchWorkshopBySlug;
const deleteWorkshopById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await workshopModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteWorkshopById = deleteWorkshopById;
// export const updateWorkshopById = async (
//   id: string,
//   data: IWorkshopBody,
// ): Promise<IWorkshopModel | null> => {
//   const dbQuery = {
//     _id: ObjectID(id),
//     isDeleted: false,
//   };
//   return await workshopModel.findOneAndUpdate(dbQuery, data);
// };
const updateWorkshopById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    const existing = await workshopModel_1.default.findOne(dbQuery);
    if (!existing) {
        throw new Error('Workshop not found');
    }
    const categoryId = data.categoryId || existing.categoryId;
    // Only validate when switching false → true
    if (data.showOnHomepage === true && existing.showOnHomepage !== true) {
        const count = await getHomepageWorkshopCountByCategory(categoryId.toString());
        if (count >= 3) {
            throw new Error('Only 4 workshops per category can be shown on homepage');
        }
    }
    return await workshopModel_1.default.findOneAndUpdate(dbQuery, data, { new: true });
};
exports.updateWorkshopById = updateWorkshopById;
// export const createWorkshop = async (data: IWorkshopBody): Promise<IWorkshopModel | null> => {
//   return await workshopModel.create(data);
// };
const createWorkshop = async (data) => {
    if (data.showOnHomepage === true) {
        const count = await getHomepageWorkshopCountByCategory(data.categoryId);
        if (count >= 3) {
            throw new Error('Only 4 workshops per category can be shown on homepage');
        }
    }
    return await workshopModel_1.default.create(data);
};
exports.createWorkshop = createWorkshop;
const getHomepageWorkshopCountByCategory = async (categoryId) => {
    return workshopModel_1.default.countDocuments({
        categoryId: (0, objectIdParser_1.ObjectID)(categoryId),
        showOnHomepage: true,
        isDeleted: false,
    });
};
const fetchWorkshopAvailability = async (data) => {
    const { workshopId, bookingDate, slotId, guests, bookingType } = data;
    const MIN_BOOKING = 2;
    //  Fetch workshop
    const workshop = await workshopModel_1.default.findOne({
        _id: (0, objectIdParser_1.ObjectID)(workshopId),
        isDeleted: false,
        isActive: true,
    });
    if (!workshop) {
        throw new appError_1.default('Workshop not found', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    // Check non-availability date
    if (workshop.nonAvailabilityDates.includes(bookingDate)) {
        return {
            available: false,
            reason: 'Workshop not available on this date',
        };
    }
    //Check non-availability days
    const bookingDay = new Date(bookingDate).toLocaleDateString('en-US', {
        weekday: 'long',
    });
    if (workshop.nonAvailabilityDays.includes(bookingDay)) {
        return {
            available: false,
            reason: `Workshop not available on ${bookingDay}`,
        };
    }
    //  Validate slot
    const slot = workshop.defaultSlots.find((s) => s._id.toString() === slotId);
    if (!slot) {
        throw new appError_1.default('Invalid slot selected', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    //  Closed by the studio on the dashboard's Block Slots page
    if (await (0, blockedTimeRepo_1.findBlockForSlot)(bookingDate, { startTime: slot.startTime, endTime: slot.endTime })) {
        return { available: false, isBlocked: true, reason: blockedTimes_1.SLOT_BLOCKED_REASON };
    }
    //  Every slot sharing the studio with the selected one
    const matchingSlotIds = await getOverlappingSlotIds({
        startTime: slot.startTime,
        endTime: slot.endTime,
    });
    //  Count confirmed people
    const aggregation = await workshopBookingModel_1.default.aggregate([
        {
            $match: {
                bookingDate: bookingDate,
                slotId: { $in: matchingSlotIds },
                ...seatHoldMatch(),
                isDeleted: false,
            },
        },
        { $group: seatTotalsGroup },
    ]);
    const existingPeople = countWithEventExclusivity(aggregation[0]);
    //  25 for an events booking holding the slot alone, otherwise the slot's
    //  ordinary capacity.
    const MAX_CAPACITY = (0, slotCapacity_1.resolveSlotCapacity)(bookingType, existingPeople, slot.capacity);
    const remainingCapacity = MAX_CAPACITY - existingPeople;
    //  Full
    if (remainingCapacity <= 0) {
        return { available: false, reason: 'Slot fully booked' };
    }
    //  Minimum booking rule
    if (guests < MIN_BOOKING) {
        return { available: false, reason: 'Minimum 2 guests required' };
    }
    //  An event that lost its exclusivity is refused for that reason rather than
    //  by the near-full / large-booking rules, which describe a different limit.
    if ((0, slotCapacity_1.isEventBlockedByExistingBookings)(bookingType, existingPeople, guests)) {
        return { available: false, reason: slotCapacity_1.EVENT_SLOT_NOT_EXCLUSIVE_REASON };
    }
    //  The near-full and large-booking rules keep a shared slot from being
    //  swallowed by one group. An events booking is allowed to do exactly that
    //  when the slot is empty, so they do not apply to it.
    const appliesSharedSlotRules = !(0, slotCapacity_1.isEventsBooking)(bookingType);
    //  Near full protection
    if (appliesSharedSlotRules && existingPeople >= 9) {
        return { available: false, reason: 'Slot blocked (near full)' };
    }
    //  Large booking rule
    if (appliesSharedSlotRules && guests >= 9) {
        // if (existingPeople === 0) {
        //   return {
        //     available: true,
        //     willBlockSlot: true,
        //     availableCount: 0,
        //   };
        // }
        if (existingPeople > 0) {
            return { available: false, reason: 'Not enough capacity' };
        }
    }
    //  Capacity overflow
    if (guests > remainingCapacity) {
        return {
            available: false,
            reason: `Only ${remainingCapacity} seats remaining`,
        };
    }
    return {
        available: true,
        isBlocked: false,
        availableCount: remainingCapacity,
    };
};
exports.fetchWorkshopAvailability = fetchWorkshopAvailability;
// export const fetchPotteryWorkshopAvailability = async (data: {
//   workshopId: string;
//   bookingDate: string;
//   slotId: string;
//   guests: number;
// }) => {
//   const { workshopId, bookingDate, slotId, guests } = data;
//   const MIN_BOOKING = 1;
//   //  Fetch workshop
//   const workshop = await workshopModel.findOne({
//     _id: ObjectID(workshopId),
//     isDeleted: false,
//     isActive: true,
//   });
//   if (!workshop) {
//     throw new AppError('Workshop not found', HttpStatus.NOT_FOUND);
//   }
//   // Check non-availability date
//   if (workshop.nonAvailabilityDates.includes(bookingDate)) {
//     return {
//       available: false,
//       reason: 'Workshop not available on this date',
//     };
//   }
//   //Check non-availability days
//   const bookingDay = new Date(bookingDate).toLocaleDateString('en-US', {
//     weekday: 'long',
//   });
//   if (workshop.nonAvailabilityDays.includes(bookingDay)) {
//     return {
//       available: false,
//       reason: `Workshop not available on ${bookingDay}`,
//     };
//   }
//   //  Validate slot
//   const slot = workshop.defaultSlots.find((s: any) => s._id.toString() === slotId);
//   if (!slot) {
//     throw new AppError('Invalid slot selected', HttpStatus.BAD_REQUEST);
//   }
//   const MAX_CAPACITY = slot.capacity;
//   //  Count confirmed people
//   const aggregation = await workshopBookingModel.aggregate([
//     {
//       $match: {
//         workshopId: ObjectID(workshopId),
//         bookingDate: bookingDate,
//         slotId: ObjectID(slotId),
//         bookingStatus: { $in: ['confirmed', 'paid'] },
//         isDeleted: false,
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         totalPeople: { $sum: '$totalPeople' },
//       },
//     },
//   ]);
//   const existingPeople = aggregation.length > 0 ? aggregation[0].totalPeople : 0;
//   const remainingCapacity = MAX_CAPACITY - existingPeople;
//   //  Full
//   if (remainingCapacity <= 0) {
//     return { available: false, reason: 'Slot fully booked' };
//   }
//   //  Minimum booking rule
//   if (guests < MIN_BOOKING) {
//     return { available: false, reason: 'Minimum 1 guest required' };
//   }
//   //  Capacity overflow
//   if (guests > remainingCapacity) {
//     return {
//       available: false,
//       reason: `Only ${remainingCapacity} seats remaining`,
//     };
//   }
//   return {
//     available: true,
//     availableCount: remainingCapacity,
//   };
// };
const fetchPotteryWorkshopAvailability = async (data) => {
    const { workshopId, bookingDate, slotId, guests, bookingType } = data;
    const MIN_BOOKING = 1;
    // Fetch workshop
    const workshop = await workshopModel_1.default.findOne({
        _id: (0, objectIdParser_1.ObjectID)(workshopId),
        isDeleted: false,
        isActive: true,
    });
    if (!workshop) {
        throw new appError_1.default('Workshop not found', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    // Validate slot
    const slot = workshop.defaultSlots.find((s) => s._id.toString() === slotId);
    if (!slot) {
        throw new appError_1.default('Invalid slot selected', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    // Capacity depends on what is already booked (an event only gets the larger
    // allowance while it has the slot to itself), so the real number is resolved
    // after the booked count below. Nothing is booked in these early returns.
    const EMPTY_SLOT_CAPACITY = (0, slotCapacity_1.resolveSlotCapacity)(bookingType, 0, slot.capacity);
    // Check non-availability date
    if (workshop.nonAvailabilityDates.includes(bookingDate)) {
        return {
            available: false,
            reason: 'Workshop not available on this date',
            totalCapacity: EMPTY_SLOT_CAPACITY,
            bookedCount: 0,
            remainingCapacity: 0,
        };
    }
    // Check non-availability day
    const bookingDay = new Date(bookingDate).toLocaleDateString('en-US', {
        weekday: 'long',
    });
    if (workshop.nonAvailabilityDays.includes(bookingDay)) {
        return {
            available: false,
            reason: `Workshop not available on ${bookingDay}`,
            totalCapacity: EMPTY_SLOT_CAPACITY,
            bookedCount: 0,
            remainingCapacity: 0,
        };
    }
    // Closed by the studio on the dashboard's Block Slots page
    if (await (0, blockedTimeRepo_1.findBlockForSlot)(bookingDate, { startTime: slot.startTime, endTime: slot.endTime })) {
        return {
            available: false,
            isBlocked: true,
            reason: blockedTimes_1.SLOT_BLOCKED_REASON,
            totalCapacity: EMPTY_SLOT_CAPACITY,
            bookedCount: 0,
            remainingCapacity: 0,
        };
    }
    // Find every slot that overlaps the selected one
    const matchingSlotIds = await getOverlappingSlotIds({
        startTime: slot.startTime,
        endTime: slot.endTime,
    });
    // Count booked guests
    const aggregation = await workshopBookingModel_1.default.aggregate([
        {
            $match: {
                bookingDate,
                slotId: { $in: matchingSlotIds },
                ...seatHoldMatch(),
                isDeleted: false,
            },
        },
        { $group: seatTotalsGroup },
    ]);
    const bookedCount = countWithEventExclusivity(aggregation[0]);
    // 25 for an events booking with the slot to itself, otherwise the ordinary
    // shared-studio capacity.
    const MAX_CAPACITY = (0, slotCapacity_1.resolveSlotCapacity)(bookingType, bookedCount, slot.capacity);
    const remainingCapacity = Math.max(0, MAX_CAPACITY - bookedCount);
    // Minimum booking validation
    if (guests < MIN_BOOKING) {
        return {
            available: false,
            reason: 'Minimum 1 guest required',
            totalCapacity: MAX_CAPACITY,
            bookedCount,
            remainingCapacity,
        };
    }
    // Slot full
    if (remainingCapacity <= 0) {
        return {
            available: false,
            reason: 'Slot fully booked',
            totalCapacity: MAX_CAPACITY,
            bookedCount,
            remainingCapacity,
        };
    }
    // An event that lost its exclusivity gets a clearer reason than a plain
    // seat shortage, since the seats were there until someone else booked.
    if ((0, slotCapacity_1.isEventBlockedByExistingBookings)(bookingType, bookedCount, guests)) {
        return {
            available: false,
            reason: slotCapacity_1.EVENT_SLOT_NOT_EXCLUSIVE_REASON,
            totalCapacity: MAX_CAPACITY,
            bookedCount,
            remainingCapacity,
        };
    }
    // Not enough seats
    if (guests > remainingCapacity) {
        return {
            available: false,
            reason: `Only ${remainingCapacity} seats remaining`,
            totalCapacity: MAX_CAPACITY,
            bookedCount,
            remainingCapacity,
        };
    }
    // Available
    return {
        available: true,
        isBlocked: false,
        reason: null,
        totalCapacity: MAX_CAPACITY,
        bookedCount,
        remainingCapacity,
    };
};
exports.fetchPotteryWorkshopAvailability = fetchPotteryWorkshopAvailability;
const getWorkshopByIdRepo = async (workshopId) => {
    return await workshopModel_1.default.findById(workshopId);
};
exports.getWorkshopByIdRepo = getWorkshopByIdRepo;
const createWorkshopBookingRepo = async (data, session) => {
    if (session) {
        const booking = await workshopBookingModel_1.default.create([data], { session });
        return booking[0];
    }
    return await workshopBookingModel_1.default.create(data);
};
exports.createWorkshopBookingRepo = createWorkshopBookingRepo;
const getSlotBookedCount = async (bookingDate, startTime, endTime) => {
    // Get all slot ids that overlap the requested time range
    const matchingSlotIds = await getOverlappingSlotIds({ startTime, endTime });
    const aggregation = await workshopBookingModel_1.default.aggregate([
        {
            $match: {
                bookingDate,
                slotId: {
                    $in: matchingSlotIds,
                },
                ...seatHoldMatch(),
                isDeleted: false,
            },
        },
        { $group: seatTotalsGroup },
    ]);
    return countWithEventExclusivity(aggregation[0]);
};
exports.getSlotBookedCount = getSlotBookedCount;
const createWorkshopOrderRepo = async (data, session) => {
    if (session) {
        const order = await workshopOrders_1.default.create([data], { session });
        return order[0];
    }
    return await workshopOrders_1.default.create(data);
};
exports.createWorkshopOrderRepo = createWorkshopOrderRepo;
const updateOrderPaymentStatus = async (orderId, data) => {
    const updatedOrder = await workshopOrders_1.default.findByIdAndUpdate(orderId, {
        paymentStatus: data.paymentStatus,
        paymentId: data.paymentId,
    }, { new: true });
    return updatedOrder;
};
exports.updateOrderPaymentStatus = updateOrderPaymentStatus;
/**
 * Marks an order paid only if it is not paid yet, in one atomic step. Returns the
 * updated order, or null when it was already paid (or does not exist). The Stripe
 * webhook uses this so a retried delivery cannot run the post-payment work twice.
 */
const markOrderPaidIfPendingRepo = async (orderId, paymentId) => {
    return await workshopOrders_1.default.findOneAndUpdate({ _id: orderId, paymentStatus: { $ne: 'paid' } }, { paymentStatus: 'paid', paymentId }, { new: true });
};
exports.markOrderPaidIfPendingRepo = markOrderPaidIfPendingRepo;
const orderExistsRepo = async (orderId) => {
    return !!(await workshopOrders_1.default.exists({ _id: orderId }));
};
exports.orderExistsRepo = orderExistsRepo;
/** Puts an order back to pending so Stripe's retry can process it again. */
const revertOrderToPendingRepo = async (orderId) => {
    return await workshopOrders_1.default.updateOne({ _id: orderId }, { paymentStatus: 'pending' });
};
exports.revertOrderToPendingRepo = revertOrderToPendingRepo;
const findOrderByCheckoutKeyRepo = async (checkoutKey) => {
    return await workshopOrders_1.default.findOne({ checkoutKey, isDeleted: false });
};
exports.findOrderByCheckoutKeyRepo = findOrderByCheckoutKeyRepo;
/** Frees a checkout key whose order can no longer be paid, so the key can be used again. */
const releaseCheckoutKeyRepo = async (orderId) => {
    return await workshopOrders_1.default.updateOne({ _id: orderId }, { $unset: { checkoutKey: 1 } });
};
exports.releaseCheckoutKeyRepo = releaseCheckoutKeyRepo;
const saveOrderStripeSessionRepo = async (orderId, session) => {
    return await workshopOrders_1.default.updateOne({ _id: orderId }, {
        stripeSessionId: session.id,
        stripeSessionUrl: session.url,
        holdExpiresAt: session.holdExpiresAt,
    });
};
exports.saveOrderStripeSessionRepo = saveOrderStripeSessionRepo;
/** A retry of the same cart may carry updated contact details; keep the bookings in step. */
const updateBookingsCustomerRepo = async (bookingIds, customer) => {
    return await workshopBookingModel_1.default.updateMany({ _id: { $in: bookingIds }, paymentStatus: 'pending' }, { customer });
};
exports.updateBookingsCustomerRepo = updateBookingsCustomerRepo;
/**
 * Throws away a checkout that never reached a payable Stripe session: the
 * bookings and the order are soft-deleted (so they stop showing in the dashboard)
 * and their seat holds end immediately. Never touches anything already paid.
 */
const discardPendingCheckoutRepo = async ({ bookingIds = [], orderId }) => {
    if (bookingIds.length) {
        await workshopBookingModel_1.default.updateMany({ _id: { $in: bookingIds }, paymentStatus: { $ne: 'paid' } }, { isDeleted: true, holdExpiresAt: new Date(0) });
    }
    if (orderId) {
        await workshopOrders_1.default.updateOne({ _id: orderId, paymentStatus: { $ne: 'paid' } }, { isDeleted: true, holdExpiresAt: new Date(0), $unset: { checkoutKey: 1 } });
    }
};
exports.discardPendingCheckoutRepo = discardPendingCheckoutRepo;
/**
 * People holding seats in the slot (and every slot overlapping it) whose booking
 * was created at or before `upToBookingId`, that booking included. Run right
 * after a booking is written, it settles a race between two simultaneous
 * checkouts: bookings are ordered by _id, so exactly one of two competing
 * requests sees the overflow and backs out, never both and never neither.
 * `priorEvents` does the same for the rule that an event takes the whole slot.
 */
const getSeatsHeldUpToBookingRepo = async (bookingDate, startTime, endTime, upToBookingId) => {
    const matchingSlotIds = await getOverlappingSlotIds({ startTime, endTime });
    const aggregation = await workshopBookingModel_1.default.aggregate([
        {
            $match: {
                bookingDate,
                slotId: { $in: matchingSlotIds },
                _id: { $lte: upToBookingId },
                ...seatHoldMatch(),
                isDeleted: false,
            },
        },
        {
            $group: {
                _id: null,
                totalPeople: { $sum: '$totalPeople' },
                // Events created before this booking. Not counting this booking itself
                // (an event never conflicts with itself); another event ahead of it does.
                priorEvents: {
                    $sum: {
                        $cond: [
                            { $and: [{ $eq: ['$bookingType', 'events'] }, { $lt: ['$_id', upToBookingId] }] },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
    ]);
    return {
        people: aggregation.length > 0 ? aggregation[0].totalPeople : 0,
        priorEvents: aggregation.length > 0 ? aggregation[0].priorEvents : 0,
    };
};
exports.getSeatsHeldUpToBookingRepo = getSeatsHeldUpToBookingRepo;
const getOrderByIdRepo = async (orderId) => {
    return await workshopOrders_1.default.findOne({ _id: orderId, isDeleted: false }).populate({
        path: 'items.bookingId',
        populate: {
            path: 'workshopId',
            select: 'title bannerImage images',
        },
    });
};
exports.getOrderByIdRepo = getOrderByIdRepo;
const updateBookingsPaymentStatusByIds = async (bookingIds, paymentStatus) => {
    return await workshopBookingModel_1.default.updateMany({ _id: { $in: bookingIds } }, {
        paymentStatus: paymentStatus,
        bookingStatus: paymentStatus === 'paid' ? 'confirmed' : 'pending',
    });
};
exports.updateBookingsPaymentStatusByIds = updateBookingsPaymentStatusByIds;
/**
 * Stamps each booking with the times of the slot it was booked into. One
 * bulkWrite instead of an update per booking, since a single order can contain
 * bookings sitting in different slots.
 */
const updateBookingsSlotTimesByIds = async (updates) => {
    if (!updates?.length) {
        return null;
    }
    return await workshopBookingModel_1.default.bulkWrite(updates.map((update) => ({
        updateOne: {
            filter: { _id: update.bookingId },
            update: {
                $set: { startTime: update.startTime, endTime: update.endTime },
            },
        },
    })));
};
exports.updateBookingsSlotTimesByIds = updateBookingsSlotTimesByIds;
/**
 * Mirrors the slot times onto the matching order items, so the order document
 * alone is enough to render a schedule without re-resolving slots.
 */
const updateOrderItemsSlotTimes = async (orderId, updates) => {
    if (!updates?.length) {
        return null;
    }
    return await workshopOrders_1.default.bulkWrite(updates.map((update) => ({
        updateOne: {
            filter: { _id: orderId },
            update: {
                $set: {
                    'items.$[item].startTime': update.startTime,
                    'items.$[item].endTime': update.endTime,
                },
            },
            arrayFilters: [{ 'item.bookingId': new mongoose_1.default.Types.ObjectId(update.bookingId) }],
        },
    })));
};
exports.updateOrderItemsSlotTimes = updateOrderItemsSlotTimes;
const getAllWorkshopBookings = async (filters, limit, page) => {
    const query = { isDeleted: false };
    if (filters.search) {
        query.$or = [
            { bookingNumber: { $regex: filters.search, $options: 'i' } },
            { 'customer.firstName': { $regex: filters.search, $options: 'i' } },
            { 'customer.lastName': { $regex: filters.search, $options: 'i' } },
        ];
    }
    if (filters.bookingStatus && filters.bookingStatus !== 'All') {
        query.bookingStatus = filters.bookingStatus;
    }
    /* Item tracking stage — 'none' means the journey has not been started, which
     * covers both Air-Dry bookings and fired ones whose workshop is still to run. */
    if (filters.trackingStatus && filters.trackingStatus !== 'All') {
        query['tracking.status'] =
            filters.trackingStatus === 'none' ? { $exists: false } : filters.trackingStatus;
    }
    /* Payment Status */
    if (filters.paymentStatus && filters.paymentStatus !== 'All') {
        query.paymentStatus = filters.paymentStatus;
    }
    /* Date Range Filter */
    if (filters.startDate && filters.endDate) {
        query.bookingDate = {
            $gte: filters.startDate,
            $lte: filters.endDate,
        };
    }
    const skip = (page - 1) * limit;
    const data = await workshopBookingModel_1.default
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
    const totalCount = await workshopBookingModel_1.default.countDocuments(query);
    return {
        data,
        totalCount,
    };
};
exports.getAllWorkshopBookings = getAllWorkshopBookings;
const fetchWorkshopBookingById = async (id) => {
    const booking = await workshopBookingModel_1.default
        .findOne({
        _id: new mongoose_1.default.Types.ObjectId(id),
        isDeleted: false,
    })
        .populate({
        path: 'workshopId',
        select: 'title defaultSlots',
    })
        .select({
        workshopId: 1,
        bookingDate: 1,
        bookingNumber: 1,
        items: 1,
        totalPeople: 1,
        totalAmount: 1,
        currency: 1,
        taxPercent: 1,
        taxAmount: 1,
        grandTotal: 1,
        bookingStatus: 1,
        paymentStatus: 1,
        bookingType: 1,
        makingType: 1,
        giftStatus: 1,
        giftDetails: 1,
        giftValidity: 1,
        customer: 1,
        slotId: 1,
        tracking: 1,
        createdAt: 1,
    })
        .lean();
    if (!booking)
        return null;
    const workshop = booking.workshopId;
    // 🔹 Find slot details
    let slotStartTime = '';
    let slotEndTime = '';
    if (workshop?.defaultSlots && booking.slotId) {
        const slot = workshop.defaultSlots.find((s) => s._id.toString() === booking.slotId.toString());
        slotStartTime = slot?.startTime || '';
        slotEndTime = slot?.endTime || '';
    }
    // 🔹 Optimized response
    const response = {
        _id: booking._id,
        bookingNumber: booking.bookingNumber,
        bookingDate: booking.bookingDate,
        workshopTitle: workshop?.title || '',
        slotStartTime,
        slotEndTime,
        items: booking.items,
        totalPeople: booking.totalPeople,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        taxPercent: booking.taxPercent,
        taxAmount: booking.taxAmount,
        grandTotal: booking.grandTotal,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        bookingType: booking.bookingType,
        makingType: booking.makingType,
        giftStatus: booking.giftStatus,
        giftDetails: booking.giftDetails,
        giftValidity: booking.giftValidity,
        customer: booking.customer,
        tracking: booking.tracking,
        createdAt: booking.createdAt,
    };
    return response;
};
exports.fetchWorkshopBookingById = fetchWorkshopBookingById;
const createCartRepo = async (data) => {
    const cart = new cartModel_1.default(data);
    return await cart.save();
};
exports.createCartRepo = createCartRepo;
const getCartByUserIdRepo = async (userId) => {
    return await cartModel_1.default
        .findOne({
        userId: new mongoose_1.default.Types.ObjectId(userId),
    })
        .populate({
        path: 'items.workshopId',
        select: 'title bannerImage images options defaultSlots',
    });
};
exports.getCartByUserIdRepo = getCartByUserIdRepo;
/**
 * Drops the given item positions from a user's cart and recalculates totals.
 *
 * The document is reloaded here without populate so saving it writes plain
 * workshop references back; the indexes come from the populated read in the
 * use case and address the same positions in the same array.
 */
const removeCartItemsByIndexRepo = async (userId, indexes) => {
    if (!indexes.length)
        return null;
    const cart = await cartModel_1.default.findOne({
        userId: new mongoose_1.default.Types.ObjectId(userId),
    });
    if (!cart)
        return null;
    const dropped = new Set(indexes);
    cart.items = cart.items.filter((_, index) => !dropped.has(index));
    cart.totalPeople = cart.items.reduce((sum, i) => sum + i.people, 0);
    cart.totalAmount = cart.items.reduce((sum, i) => sum + i.subtotal, 0);
    cart.taxPercent = 5;
    cart.taxAmount = (cart.totalAmount * cart.taxPercent) / 100;
    cart.grandTotal = cart.totalAmount + cart.taxAmount;
    return await cart.save();
};
exports.removeCartItemsByIndexRepo = removeCartItemsByIndexRepo;
const clearCartRepo = async (userId) => {
    return await cartModel_1.default.findOneAndUpdate({ userId: new mongoose_1.default.Types.ObjectId(userId) }, {
        items: [],
        totalPeople: 0,
        totalAmount: 0,
        taxAmount: 0,
        grandTotal: 0,
    });
};
exports.clearCartRepo = clearCartRepo;
// Bookingwith session
// export const fetchWorkshopBookingById = async (id: string) => {
//   const dbQuery = {
//     _id: new mongoose.Types.ObjectId(id),
//     isDeleted: false,
//   };
//   return await workshopBookingModel
//     .findOne(dbQuery)
//     .populate({
//       path: 'workshopId',
//       select: 'title slug duration',
//     })
//     .populate({
//       path: 'slotId',
//       select: 'startTime endTime',
//     })
//     .populate({
//       path: 'items.optionId',
//       select: 'title',
//     })
//     .populate({
//       path: 'userId',
//       select: 'firstName lastName email',
//     })
//     .select({
//       isDeleted: 0,
//       updatedAt: 0,
//       __v: 0,
//     })
//     .lean();
// };
const getBookingsByIdsRepo = async (bookingIds) => {
    if (!bookingIds?.length) {
        return [];
    }
    return await workshopBookingModel_1.default.find({
        _id: { $in: bookingIds },
    });
};
exports.getBookingsByIdsRepo = getBookingsByIdsRepo;
const getGiftBookingByIdRepo = async (bookingId) => {
    return workshopBookingModel_1.default.findOne({
        _id: bookingId,
        bookingType: 'gift',
        isDeleted: false,
    });
};
exports.getGiftBookingByIdRepo = getGiftBookingByIdRepo;
const getBookingByVoucherCodeRepo = async (bookingId, voucherCode) => {
    return workshopBookingModel_1.default.findOne({
        _id: bookingId,
        'giftDetails.voucherCode': voucherCode,
        bookingType: 'gift',
        isDeleted: false,
    });
};
exports.getBookingByVoucherCodeRepo = getBookingByVoucherCodeRepo;
const redeemGiftBookingRepo = async (bookingId, bookingDate, slotId) => {
    return workshopBookingModel_1.default.findByIdAndUpdate(bookingId, {
        $set: {
            bookingDate,
            slotId,
            giftStatus: 'redeemed',
            bookingStatus: 'confirmed',
        },
    }, { new: true });
};
exports.redeemGiftBookingRepo = redeemGiftBookingRepo;
const fetchPotteryWorkshopCapacity = async (data) => {
    const { bookingDate, startTime, endTime } = data;
    // A window the studio closed has no seats at all, whatever is booked in it.
    if (await (0, blockedTimeRepo_1.findBlockForSlot)(bookingDate, { startTime, endTime })) {
        return {
            bookingDate,
            startTime,
            endTime,
            isBlocked: true,
            reason: blockedTimes_1.SLOT_BLOCKED_REASON,
            totalCapacity: (0, slotCapacity_1.resolveSlotCapacity)(data.bookingType, 0),
            bookedCount: 0,
            remainingCapacity: 0,
        };
    }
    // Find all slot ids that overlap the requested time range
    const matchingSlotIds = await getOverlappingSlotIds({ startTime, endTime });
    const aggregation = await workshopBookingModel_1.default.aggregate([
        {
            $match: {
                bookingDate,
                slotId: {
                    $in: matchingSlotIds,
                },
                ...seatHoldMatch(),
                isDeleted: false,
            },
        },
        { $group: seatTotalsGroup },
    ]);
    const bookedCount = countWithEventExclusivity(aggregation[0]);
    // An events booking is allowed 25 only while it has the slot to itself; once
    // anything else is confirmed in an overlapping slot it drops to the ordinary
    // shared-studio capacity.
    const MAX_CAPACITY = (0, slotCapacity_1.resolveSlotCapacity)(data.bookingType, bookedCount);
    const remainingCapacity = Math.max(0, MAX_CAPACITY - bookedCount);
    return {
        bookingDate,
        startTime,
        endTime,
        isBlocked: false,
        reason: null,
        totalCapacity: MAX_CAPACITY,
        bookedCount,
        remainingCapacity,
    };
};
exports.fetchPotteryWorkshopCapacity = fetchPotteryWorkshopCapacity;
const buildDeletableBookingsQuery = (filters) => {
    const query = {
        isDeleted: false,
        // `collected` joins `confirmed` on the protected list: it is the end of a
        // real booking, not an abandoned one.
        bookingStatus: { $nin: ['confirmed', 'collected'] },
        // A completed booking whose pieces are still in the kiln is live work with
        // a tracking link already in the customer's inbox, so it is off limits too.
        'tracking.status': { $exists: false },
    };
    if (filters.ids && filters.ids.length) {
        query._id = { $in: filters.ids.map((id) => new mongoose_1.default.Types.ObjectId(id)) };
        // An explicit selection is already precise — the list filters that were
        // active when the rows were picked must not narrow it any further.
        return query;
    }
    if (filters.search) {
        query.$or = [
            { bookingNumber: { $regex: filters.search, $options: 'i' } },
            { 'customer.firstName': { $regex: filters.search, $options: 'i' } },
            { 'customer.lastName': { $regex: filters.search, $options: 'i' } },
        ];
    }
    if (filters.bookingStatus && filters.bookingStatus !== 'All') {
        query.bookingStatus = filters.bookingStatus;
    }
    if (filters.paymentStatus && filters.paymentStatus !== 'All') {
        query.paymentStatus = filters.paymentStatus;
    }
    if (filters.startDate && filters.endDate) {
        query.bookingDate = {
            $gte: filters.startDate,
            $lte: filters.endDate,
        };
    }
    return query;
};
exports.buildDeletableBookingsQuery = buildDeletableBookingsQuery;
const countDeletableBookings = async (filters) => {
    return await workshopBookingModel_1.default.countDocuments((0, exports.buildDeletableBookingsQuery)(filters));
};
exports.countDeletableBookings = countDeletableBookings;
/**
 * An order stays visible until every booking it points at is gone, so an order
 * that mixes a failed booking with a confirmed one is left alone.
 */
const softDeleteEmptiedOrders = async (deletedBookingIds) => {
    const affectedOrders = await workshopOrders_1.default
        .find({ isDeleted: false, 'items.bookingId': { $in: deletedBookingIds } })
        .select('_id items.bookingId')
        .lean();
    if (!affectedOrders.length)
        return 0;
    const referencedIds = affectedOrders.flatMap((order) => order.items.map((item) => item.bookingId));
    const stillLive = await workshopBookingModel_1.default
        .find({ _id: { $in: referencedIds }, isDeleted: false })
        .select('_id')
        .lean();
    const liveIds = new Set(stillLive.map((booking) => booking._id.toString()));
    const emptiedOrderIds = affectedOrders
        .filter((order) => !order.items.some((item) => liveIds.has(item.bookingId.toString())))
        .map((order) => order._id);
    if (!emptiedOrderIds.length)
        return 0;
    const result = await workshopOrders_1.default.updateMany({ _id: { $in: emptiedOrderIds } }, { $set: { isDeleted: true } });
    return result.modifiedCount;
};
/**
 * Soft delete — the rows keep existing in Mongo with isDeleted: true, which is
 * what every booking read query already filters on, so they simply disappear
 * from the dashboard and can be restored by flipping the flag back.
 */
const softDeleteBookings = async (filters) => {
    const query = (0, exports.buildDeletableBookingsQuery)(filters);
    const targets = await workshopBookingModel_1.default.find(query).select('_id').lean();
    if (!targets.length)
        return { deletedCount: 0, deletedOrderCount: 0 };
    const targetIds = targets.map((booking) => booking._id);
    const result = await workshopBookingModel_1.default.updateMany({ _id: { $in: targetIds } }, { $set: { isDeleted: true } });
    const deletedOrderCount = await softDeleteEmptiedOrders(targetIds);
    return { deletedCount: result.modifiedCount, deletedOrderCount };
};
exports.softDeleteBookings = softDeleteBookings;
/* ---------------- ITEM TRACKING ---------------- */
/**
 * The booking behind an admin tracking action, as a live document rather than
 * a lean object — the use case mutates nested tracking fields and saves.
 */
const getBookingForTrackingRepo = async (id) => {
    return await workshopBookingModel_1.default.findOne({
        _id: new mongoose_1.default.Types.ObjectId(id),
        isDeleted: false,
    });
};
exports.getBookingForTrackingRepo = getBookingForTrackingRepo;
/**
 * The booking behind a tracking link. The token is the only credential the
 * customer has, so the lookup is by token alone and everything the public page
 * does not need stays unselected.
 */
const getBookingByTrackingTokenRepo = async (token) => {
    return await workshopBookingModel_1.default
        .findOne({ 'tracking.token': token, isDeleted: false })
        .populate({ path: 'workshopId', select: 'title image bannerImage' })
        .select({
        bookingNumber: 1,
        bookingDate: 1,
        startTime: 1,
        endTime: 1,
        workshopId: 1,
        items: 1,
        totalPeople: 1,
        makingType: 1,
        currency: 1,
        totalAmount: 1,
        taxAmount: 1,
        grandTotal: 1,
        'customer.firstName': 1,
        'customer.lastName': 1,
        'customer.email': 1,
        'customer.phone': 1,
        tracking: 1,
        createdAt: 1,
    })
        .lean();
};
exports.getBookingByTrackingTokenRepo = getBookingByTrackingTokenRepo;
/**
 * Every tracked piece the scheduler still has work to do on.
 *
 * `ready` is included because a ready piece still has a warning email and a
 * discard date ahead of it; only collected and discarded pieces are finished.
 */
const findActiveTrackedBookingsRepo = async () => {
    return await workshopBookingModel_1.default
        .find({
        isDeleted: false,
        'tracking.status': { $in: ['created', 'drying', 'firing', 'painting', 'delay', 'ready'] },
    })
        .sort({ 'tracking.startedAt': 1 });
};
exports.findActiveTrackedBookingsRepo = findActiveTrackedBookingsRepo;
/** Bookings whose pieces are still in the studio, for the dashboard summary. */
const countTrackedBookingsByStatusRepo = async () => {
    const rows = await workshopBookingModel_1.default.aggregate([
        { $match: { isDeleted: false, 'tracking.status': { $exists: true } } },
        { $group: { _id: '$tracking.status', count: { $sum: 1 } } },
    ]);
    return rows.reduce((counts, row) => ({ ...counts, [row._id]: row.count }), {});
};
exports.countTrackedBookingsByStatusRepo = countTrackedBookingsByStatusRepo;
/** True when the token is already taken — collisions are vanishingly rare but free to rule out. */
const trackingTokenExistsRepo = async (token) => {
    return !!(await workshopBookingModel_1.default.exists({ 'tracking.token': token }));
};
exports.trackingTokenExistsRepo = trackingTokenExistsRepo;
