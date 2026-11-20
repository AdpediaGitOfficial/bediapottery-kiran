import {
  createWorkshop,
  deleteWorkshopById,
  fetchAllWorkshops,
  fetchWorkshopById,
  getWorkshopsCount,
  updateWorkshopById,
  fetchAllWorkshopsForAdmin,
  fetchWorkshopBySlug,
  fetchHomepageWorkshops,
  fetchWorkshopsByCategory,
  fetchWorkshopAvailability,
  getSlotBookedCount,
  createWorkshopBookingRepo,
  getWorkshopByIdRepo,
  createWorkshopOrderRepo,
  getAllWorkshopBookings,
  fetchWorkshopBookingById,
  getCartByUserIdRepo,
  createCartRepo,
} from '../repos/workshopRepo';
import {
  IWorkshopBody,
  IWorkshopModel,
  IGetAllQuery,
  IWorkshopBookingDetail,
} from '../../types/workshopTypes';
import { ObjectID } from '../../utils/objectIdParser';
import AppError from '../../common/appError';
import { HttpStatus } from '../../common/httpStatus';
import { getCareersCount } from '../../careers/repos/careerRepo';
import { getJobApplicationsCount } from '../../careers/repos/jobApplicationRepo';
import { fetchCategoryBySlug, getCategoriesCount } from '../../category/repos/categoryRepo';
import { stripe } from '../../config/stripe';
import mongoose from 'mongoose';

export const getAllWorkshopsUseCase = async (queryParams: IGetAllQuery): Promise<any> => {
  const { page = '1', search, categoryId } = queryParams;
  const { limit = '10' } = queryParams;
  const query: any = { isDeleted: false };
  if (search && search.length > 0) {
    query['$or'] = [{ title: { $regex: search, $options: 'i' } }];
  }
  if (categoryId) {
    query.categoryId = categoryId;
  }
  const totalCount = await getWorkshopsCount(query);
  if (!totalCount) return { totalCount: 0, workshops: [] };
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const workshops = await fetchAllWorkshops(query, skip, parseInt(limit));
  return { totalCount, workshops };
};
export const getHomepageWorkshopsUseCase = async () => {
  return await fetchHomepageWorkshops();
};

export const getWorkshopsByCategoryUseCase = async (queryParams: IGetAllQuery): Promise<any> => {
  const { page = '1', search, slug } = queryParams;
  const { limit = '10' } = queryParams;

  if (!slug) {
    return { totalCount: 0, workshops: [] };
  }

  // find category first
  const category = await fetchCategoryBySlug(slug);
  if (!category) {
    return { totalCount: 0, workshops: [] };
  }

  const query: any = {
    categoryId: category._id,
    isDeleted: false,
    isActive: true,
  };

  if (search && search.length > 0) {
    query['$or'] = [{ title: { $regex: search, $options: 'i' } }];
  }

  const totalCount = await getWorkshopsCount(query);

  if (!totalCount) {
    return { totalCount: 0, category, workshops: [] };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const workshops = await fetchWorkshopsByCategory(query, skip, parseInt(limit));

  return { totalCount, category, workshops };
};

export const getAllWorkshopsForAdminUseCase = async (queryParams: IGetAllQuery): Promise<any> => {
  const { page = '1', search } = queryParams;
  const { limit = '10' } = queryParams;
  const query: any = { isDeleted: false };
  if (search && search.length > 0) {
    query['$or'] = [{ title: { $regex: search, $options: 'i' } }]; // Case-insensitive search
  }

  const totalCount = await getWorkshopsCount(query);
  if (!totalCount) return { totalCount: 0, workshops: [] };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const workshops = await fetchAllWorkshopsForAdmin(query, skip, parseInt(limit));
  return { totalCount, workshops };
};

export const createWorkshopUseCase = async (data: IWorkshopBody): Promise<boolean> => {
  // check for  unique value duplications
  const workshop = await createWorkshop(data);
  if (!workshop) {
    throw new AppError('Couldn\'t Create new Workshop. Try again', HttpStatus.BAD_REQUEST);
  }
  return true;
};

export const updateWorkshopByIdUseCase = async (
  id: string,
  data: IWorkshopBody,
): Promise<IWorkshopModel> => {
  if (ObjectID(id)) {
    // const existingWorkshop = await fetchWorkshopById(id);
    // check for  unique value updations

    const workshop = await updateWorkshopById(id, data);
    if (!workshop) throw new AppError('Couldn\'t update Workshop', HttpStatus.NOT_FOUND);
    return workshop;
  }
  throw new AppError('No Workshop Found', HttpStatus.NOT_FOUND);
};
export const deleteWorkshopByIdUseCase = async (id: string): Promise<boolean> => {
  if (ObjectID(id)) {
    const workshop = await deleteWorkshopById(id);
    // check for  unique value updations
    if (workshop) return true;
  }
  throw new AppError('No Workshop Found', HttpStatus.NOT_FOUND);
};

export const getWorkshopByIdUseCase = async (query: { _id: string }): Promise<IWorkshopModel> => {
  if (ObjectID(query._id)) {
    const workshop = await fetchWorkshopById(query._id);
    if (workshop) return workshop;
  }
  throw new AppError('No Workshop Found', HttpStatus.NOT_FOUND);
};

export const getWorkshopBySlugUseCase = async (query: {
  slug: string;
}): Promise<IWorkshopModel> => {
  if (query.slug) {
    const workshop = await fetchWorkshopBySlug(query.slug);
    if (workshop) return workshop;
  }
  throw new AppError('No Workshop Found', HttpStatus.NOT_FOUND);
};

export const getDashboardCountsUseCase = async (): Promise<any> => {
  const query: any = { isDeleted: false };
  const [categoryCount, workshopCount, careerCount, jobApplicationCount] = await Promise.all([
    getCategoriesCount(query),
    getWorkshopsCount(query),
    getCareersCount(query),
    getJobApplicationsCount(query),
  ]);

  return {
    categories: categoryCount,
    workshops: workshopCount,
    careers: careerCount,
    jobApplications: jobApplicationCount,
  };
};

export const checkWorkshopAvailabilityUseCase = async (data: {
  workshopId: string;
  bookingDate: string;
  slotId: string;
  guests: number;
}) => {
  const { workshopId, bookingDate, slotId, guests } = data;

  if (!ObjectID(workshopId)) {
    throw new AppError('Invalid Workshop Id', HttpStatus.BAD_REQUEST);
  }

  if (!ObjectID(slotId)) {
    throw new AppError('Invalid Slot Id', HttpStatus.BAD_REQUEST);
  }

  if (!bookingDate || !guests) {
    throw new AppError('Required fields missing', HttpStatus.BAD_REQUEST);
  }

  const result = await fetchWorkshopAvailability({
    workshopId,
    bookingDate,
    slotId,
    guests,
  });

  if (result) return result;

  throw new AppError('Unable to check availability', HttpStatus.BAD_REQUEST);
};

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

export const createWorkshopBookingUseCase = async (data: any): Promise<{ checkoutUrl: string }> => {
  // const session = await mongoose.startSession();
  // session.startTransaction();

  //try {
  const orderNumber = `ORD-${Date.now()}`;

  let orderSubtotal = 0;
  let orderTaxAmount = 0;
  let orderGrandTotal = 0;

  const orderItems: any[] = [];

  for (const workshopInput of data.workshops) {
    const workshop = await getWorkshopByIdRepo(workshopInput.workshopId);

    if (!workshop) {
      throw new AppError('Workshop not found', HttpStatus.NOT_FOUND);
    }

    const slot = workshop.defaultSlots.find((s: any) => s._id.equals(workshopInput.slotId));

    if (!slot) {
      throw new AppError('Selected slot not found', HttpStatus.BAD_REQUEST);
    }

    const totalRequestedPeople = workshopInput.items.reduce(
      (sum: number, item: any) => sum + item.people,
      0,
    );

    const bookedCount = await getSlotBookedCount(
      workshopInput.workshopId,
      workshopInput.bookingDate,
      workshopInput.slotId,
    );

    if (bookedCount + totalRequestedPeople > slot.capacity) {
      throw new AppError('Slot capacity exceeded', HttpStatus.BAD_REQUEST);
    }

    let totalAmount = 0;
    const validatedItems: any[] = [];

    for (const item of workshopInput.items) {
      const option = workshop.options.find((o: any) => o._id.equals(item.optionId));

      if (!option) {
        throw new AppError('Invalid option selected', HttpStatus.BAD_REQUEST);
      }

      const subtotal = option.price * item.people;
      totalAmount += subtotal;

      validatedItems.push({
        optionId: option._id,
        optionTitle: option.title,
        price: option.price,
        people: item.people,
        subtotal,
      });
    }

    const bookingNumber = `WB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const taxPercent = 5;
    const taxAmount = (totalAmount * taxPercent) / 100;
    const grandTotal = totalAmount + taxAmount;

    const booking = await createWorkshopBookingRepo(
      {
        workshopId: workshop._id,
        bookingNumber,
        bookingDate: workshopInput.bookingDate,
        slotId: workshopInput.slotId,
        items: validatedItems,
        totalPeople: totalRequestedPeople,
        totalAmount,
        taxPercent,
        taxAmount,
        grandTotal,
        currency: 'AED',
        customer: data.customer,
        bookingStatus: 'pending',
        paymentStatus: 'pending',
        userId: data.userId,
      },
      //  session,
    );

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

  const order = await createWorkshopOrderRepo(
    {
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
    },
    //  session,
  );

  if (!order) {
    throw new AppError('Order creation failed.', HttpStatus.BAD_REQUEST);
  }

  const stripeSession = await createOrderPaymentSessionUseCase(order);

  if (!stripeSession.url) {
    throw new AppError('Stripe session URL not generated', HttpStatus.BAD_REQUEST);
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

export const createOrderPaymentSessionUseCase = async (order: any) => {
  const session = await stripe.checkout.sessions.create({
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

    success_url: `${process.env.FRONTEND_URL}/success`,
    cancel_url: `${process.env.FRONTEND_URL}/failure`,
  });

  console.log('SESSION CREATED');
  // console.log(session.id);
  // console.log(session.metadata);
  return session;
};

export const getWorkshopBookingsUseCase = async (filters: any, limit: number, page: number) => {
  const result = await getAllWorkshopBookings(filters, limit, page);

  return result;
};

export const getWorkshopBookingByIdUseCase = async (query: {
  _id: string;
}): Promise<IWorkshopBookingDetail> => {
  if (ObjectID(query._id)) {
    const booking = await fetchWorkshopBookingById(query._id);
    if (booking) return booking;
  }
  throw new AppError('No Workshop Booking Found', HttpStatus.NOT_FOUND);
};

export const addToCartUseCase = async (data: any) => {
  const { userId, workshopId, bookingDate, slotId, optionId, people } = data;

  const workshop = await getWorkshopByIdRepo(workshopId);
  if (!workshop) throw new AppError('Workshop not found', 404);

  // Validate SLOT
  const slot = workshop.defaultSlots.find((s: any) =>
    s._id.equals(new mongoose.Types.ObjectId(slotId)),
  );

  if (!slot) {
    throw new AppError('Invalid slot selected', 400);
  }

  //  Validate OPTION
  const option = workshop.options.find((o: any) =>
    o._id.equals(new mongoose.Types.ObjectId(optionId)),
  );

  if (!option) {
    throw new AppError('Invalid option selected', 400);
  }

  //check non-availability day
  const dayName = new Date(bookingDate).toLocaleDateString('en-US', {
    weekday: 'long',
  });

  if (workshop.nonAvailabilityDays.includes(dayName)) {
    throw new AppError('Workshop not available on selected day', 400);
  }

  // check blocked dates
  if (workshop.nonAvailabilityDates?.includes(bookingDate)) {
    throw new AppError('Workshop not available on selected date', 400);
  }

  const price = option.price;
  const subtotal = price * people;

  let cart = await getCartByUserIdRepo(userId);

  if (!cart) {
    cart = await createCartRepo({
      userId,
      items: [],
    });
  }

  // Check existing item
  const existingItemIndex = cart.items.findIndex(
    (item: any) =>
      item.workshopId.equals(workshopId) &&
      item.slotId.equals(slotId) &&
      item.bookingDate === bookingDate &&
      item.optionId.equals(optionId),
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].people += people;
    cart.items[existingItemIndex].subtotal += subtotal;
  } else {
    cart.items.push({
      workshopId,
      bookingDate,
      slotId,
      optionId,
      people,
      price,
      subtotal,
      currency: option.currency || 'AED',
    });
  }

  //  Recalculate totals
  cart.totalPeople = cart.items.reduce((sum: number, i: any) => sum + i.people, 0);
  cart.totalAmount = cart.items.reduce((sum: number, i: any) => sum + i.subtotal, 0);

  cart.taxPercent = 5;
  cart.taxAmount = (cart.totalAmount * 5) / 100;
  cart.grandTotal = cart.totalAmount + cart.taxAmount;

  await cart.save();

  return cart;
};

export const removeCartItemUseCase = async (data: any) => {
  const { userId, itemIndex } = data;

  const cart = await getCartByUserIdRepo(userId);
  if (!cart) throw new AppError('Cart not found', 404);

  // Validate index
  if (itemIndex === undefined || itemIndex < 0 || itemIndex >= cart.items.length) {
    throw new AppError('Invalid item index', 400);
  }

  //  Remove item
  cart.items.splice(itemIndex, 1);

  // Recalculate totals
  cart.totalPeople = cart.items.reduce((sum: number, i: any) => sum + i.people, 0);

  cart.totalAmount = cart.items.reduce((sum: number, i: any) => sum + i.subtotal, 0);

  // Tax + Grand Total
  cart.taxPercent = 5;
  cart.taxAmount = (cart.totalAmount * cart.taxPercent) / 100;
  cart.grandTotal = cart.totalAmount + cart.taxAmount;
  await cart.save();
  return cart;
};

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

export const checkoutCartUseCase = async (data: any) => {
  const { userId, customer } = data;

  try {
    const cart = await getCartByUserIdRepo(userId);
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    const orderNumber = `ORD-${Date.now()}`;

    let orderSubtotal = 0;
    let orderTaxAmount = 0;
    let orderGrandTotal = 0;

    const orderItems: any[] = [];

    // Group cart items
    const groupedItems: Record<string, any> = {};

    for (const item of cart.items) {
      const key = `${item.workshopId}_${item.bookingDate}_${item.slotId}`;

      if (!groupedItems[key]) {
        groupedItems[key] = {
          workshopId: item.workshopId,
          bookingDate: item.bookingDate,
          slotId: item.slotId,
          items: [],
        };
      }

      groupedItems[key].items.push(item);
    }

    // Process each group
    for (const group of Object.values(groupedItems)) {
      const workshop = await getWorkshopByIdRepo(group.workshopId);

      if (!workshop || !workshop.isActive) {
        throw new AppError('Workshop not available', 404);
      }

      // Validate SLOT
      const slot = workshop.defaultSlots.find((s: any) => s._id.equals(group.slotId));

      if (!slot) {
        throw new AppError('Invalid slot selected', 400);
      }

      // Check day availability
      const dayName = new Date(group.bookingDate).toLocaleDateString('en-US', {
        weekday: 'long',
      });

      if (workshop.nonAvailabilityDays?.includes(dayName)) {
        throw new AppError('Workshop not available on selected day', 400);
      }

      // Check blocked dates
      if (workshop.nonAvailabilityDates?.includes(group.bookingDate)) {
        throw new AppError('Workshop not available on selected date', 400);
      }

      // Capacity check
      const totalPeople = group.items.reduce((sum: number, i: any) => sum + i.people, 0);

      const bookedCount = await getSlotBookedCount(
        group.workshopId,
        group.bookingDate,
        group.slotId,
      );

      if (bookedCount + totalPeople > slot.capacity) {
        throw new AppError('Slot capacity exceeded', 400);
      }

      let totalAmount = 0;
      const validatedItems: any[] = [];

      // Validate options
      for (const item of group.items) {
        const option = workshop.options.find((o: any) => o._id.equals(item.optionId));

        if (!option) {
          throw new AppError('Invalid option selected', 400);
        }

        const subtotal = option.price * item.people;
        totalAmount += subtotal;

        validatedItems.push({
          optionId: option._id,
          optionTitle: option.title,
          price: option.price,
          people: item.people,
          subtotal,
        });
      }

      const bookingNumber = `WB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const taxPercent = 5;
      const taxAmount = (totalAmount * taxPercent) / 100;
      const grandTotal = totalAmount + taxAmount;

      // Create booking
      const booking = await createWorkshopBookingRepo({
        workshopId: group.workshopId,
        bookingNumber,
        bookingDate: group.bookingDate,
        slotId: group.slotId,
        items: validatedItems,
        totalPeople,
        totalAmount,
        taxPercent,
        taxAmount,
        grandTotal,
        currency: 'AED',
        customer,
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
        bookingDate: group.bookingDate,
        slotId: group.slotId,
        totalAmount: grandTotal,
      });
    }

    // Create order
    const order = await createWorkshopOrderRepo({
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
      throw new AppError('Order creation failed', 400);
    }

    //  Create Stripe session AFTER DB save
    const stripeSession = await createOrderPaymentSessionUseCase(order);

    if (!stripeSession.url) {
      throw new AppError('Stripe session failed', 400);
    }

    return {
      checkoutUrl: stripeSession.url,
      orderId: order._id,
    };
  } catch (error) {
    throw new AppError('Checkout failed', 500);
  }
};
