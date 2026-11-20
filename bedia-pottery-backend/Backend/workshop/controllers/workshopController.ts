import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import {
  createWorkshopUseCase,
  deleteWorkshopByIdUseCase,
  getAllWorkshopsUseCase,
  getWorkshopByIdUseCase,
  updateWorkshopByIdUseCase,
  getAllWorkshopsForAdminUseCase,
  getDashboardCountsUseCase,
  getWorkshopBySlugUseCase,
  getHomepageWorkshopsUseCase,
  getWorkshopsByCategoryUseCase,
  checkWorkshopAvailabilityUseCase,
  createWorkshopBookingUseCase,
  getWorkshopBookingsUseCase,
  getWorkshopBookingByIdUseCase,
  addToCartUseCase,
  removeCartItemUseCase,
  checkoutCartUseCase,
} from '../useCases/workshopUseCase';
import { IWorkshopBody } from '../../types/workshopTypes';
import { stripe } from '../../config/stripe';
import {
  updateOrderPaymentStatus,
  updateBookingsPaymentStatusByOrder,
  getCartByUserIdRepo,
  clearCartRepo,
} from '../repos/workshopRepo';
import { validationResult } from 'express-validator';
import { HttpStatus } from '../../common/httpStatus';

export const getAllWorkshops = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const workshops = await getAllWorkshopsUseCase(req.query);
  res.status(200).json({
    success: true,
    message: 'Fetched All Workshops successfully',
    result: workshops,
  });
});

export const getHomepageWorkshops = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = await getHomepageWorkshopsUseCase();

    res.status(200).json({
      success: true,
      message: 'Homepage workshops fetched successfully',
      result: data,
    });
  },
);

export const getWorkshopsByCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = await getWorkshopsByCategoryUseCase(req.query);
    res.status(200).json({
      success: true,
      message: 'Homepage workshops fetched successfully',
      result: data,
    });
  },
);

export const getAllWorkshopsForAdmin = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const workshops = await getAllWorkshopsForAdminUseCase(req.query);
    res.status(200).json({
      success: true,
      message: 'Fetched All Workshops successfully',
      result: workshops,
    });
  },
);
export const createWorkshop = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = req.body as IWorkshopBody;
  await createWorkshopUseCase(data);
  res.status(200).json({
    success: true,
    message: 'Created Workshop successfully',
    result: true,
  });
});
export const updateWorkshopById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data = req.body as IWorkshopBody;
    await updateWorkshopByIdUseCase(id, data);
    res.status(200).json({
      success: true,
      message: 'Updated Workshop successfully',
      result: true,
    });
  },
);

export const deleteWorkshopById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await deleteWorkshopByIdUseCase(id);
    res.status(200).json({
      success: true,
      message: 'Deleted Workshop successfully',
      result: true,
    });
  },
);
export const getWorkshopById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const workshop = await getWorkshopByIdUseCase({ _id: id });
  res.status(200).json({
    success: true,
    message: 'Fetched Workshop successfully',
    result: workshop,
  });
});

export const getWorkshopBySlug = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    const workshop = await getWorkshopBySlugUseCase({ slug: slug });
    res.status(200).json({
      success: true,
      message: 'Fetched Workshop successfully',
      result: workshop,
    });
  },
);

export const getDashboardCounts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const counts = await getDashboardCountsUseCase();

    res.status(200).json({
      success: true,
      message: 'Fetched dashboard counts successfully',
      result: counts,
    });
  },
);

export const checkWorkshopAvailability = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workshopId, bookingDate, slotId, guests } = req.body;

    const result = await checkWorkshopAvailabilityUseCase({
      workshopId,
      bookingDate,
      slotId,
      guests,
    });

    res.status(200).json({
      success: true,
      message: 'Workshop availability checked successfully',
      result,
    });
  },
);

export const createWorkshopBooking = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = req.body;
    const result = await createWorkshopBookingUseCase(data);
    res.status(200).json({
      success: true,
      checkoutUrl: result.checkoutUrl,
    });
  },
);

// export const stripeWebhookController = async (req: Request, res: Response) => {
//   try {
//     const sig = req.headers['stripe-signature'];

//     if (!sig) {
//       return res.status(400).send('Missing Stripe signature');
//     }

//     const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object as any;

//       const orderId = session.metadata?.orderId;

//       if (!orderId) {
//         return res.status(400).send('Missing orderId in metadata');
//       }

//       await updateOrderPaymentStatus(orderId, {
//         paymentStatus: 'paid',
//         paymentId: session.payment_intent,
//       });

//       await updateBookingsPaymentStatusByOrder(orderId, 'paid');
//     }

//     res.json({ received: true });
//   } catch (error: any) {
//     console.error('Stripe webhook error:', error.message);
//     res.status(400).send(`Webhook Error: ${error.message}`);
//   }
// };

export const stripeWebhookController = async (req: Request, res: Response) => {
  console.log('WEBHOOK HIT');

  try {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).send('Missing Stripe signature');
    }

    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    console.log('EVENT TYPE:', event.type);

    // PAYMENT SUCCESS
    if (event.type === 'payment_intent.succeeded') {
      console.log('PAYMENT SUCCESS WEBHOOK');

      const paymentIntent = event.data.object as any;

      console.log('PAYMENT INTENT:', paymentIntent);

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

      const order = await updateOrderPaymentStatus(orderId, {
        paymentStatus: 'paid',
        paymentId: paymentIntent.id,
      });

      //console.log('UPDATED ORDER:', order);

      await updateBookingsPaymentStatusByOrder(orderId, 'paid');

      console.log('BOOKINGS UPDATED');

      try {
        if (order?.userId) {
          const userId = order.userId.toString();

          const cart = await getCartByUserIdRepo(userId);

          if (cart) {
            await clearCartRepo(userId);
          }
        }
      } catch (err) {
        console.error('Cart clear failed:', err);
      }
    }

    return res.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error.message);

    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

export const getWorkshopBookings = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  // const saltRounds = 10;

  // const password = 'BediaPotteryAdmin@123';

  // const hashedPassword = bcrypt.hash(password, saltRounds);

  // console.log(hashedPassword);

  if (!errors.isEmpty()) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const filters = {
      search: req.query.search as string,
      bookingStatus: req.query.bookingStatus as string,
      paymentStatus: req.query.paymentStatus as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;

    const result = await getWorkshopBookingsUseCase(filters, limit, page);

    return res.status(200).json({
      success: true,
      message: 'Workshop bookings fetched successfully',
      result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred',
    });
  }
};

export const getWorkshopBookingById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const booking = await getWorkshopBookingByIdUseCase({ _id: id });

    res.status(200).json({
      success: true,
      message: 'Fetched Workshop Booking successfully',
      result: booking,
    });
  },
);

export const addToCart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await addToCartUseCase(req.body);

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: result,
  });
});

export const getCartController = asyncHandler(async (req, res) => {
  const cart = await getCartByUserIdRepo(req.params.userId);

  res.json({
    success: true,
    data: cart,
  });
});

export const removeCartItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await removeCartItemUseCase(req.body);

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: result,
  });
});

export const checkoutCart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await checkoutCartUseCase(req.body);

  res.status(200).json({
    success: true,
    message: 'Checkout successful',
    data: result,
  });
});
