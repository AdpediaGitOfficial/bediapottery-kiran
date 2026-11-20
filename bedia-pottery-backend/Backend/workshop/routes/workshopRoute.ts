import { Router } from 'express';
import {
  createWorkshop,
  deleteWorkshopById,
  updateWorkshopById,
  getAllWorkshops,
  getWorkshopById,
  getAllWorkshopsForAdmin,
  getWorkshopBySlug,
  getHomepageWorkshops,
  getWorkshopsByCategory,
  checkWorkshopAvailability,
  createWorkshopBooking,
  // stripeWebhookController,
  getWorkshopBookings,
  getWorkshopBookingById,
  addToCart,
  getCartController,
  removeCartItem,
  checkoutCart,
} from '../controllers/workshopController';
import sanitizeBody from '../../middleware/sanitizeMiddleware';
import { validateQuery, validateReqBody } from '../../middleware/validate';
import { getAllWorkshopSchema } from '../routevalidators/getAllWorkshops';
import { JSONSchemaType } from 'ajv';
import { createWorkshopSchema } from '../routevalidators/createWorkshop';
import { userAuthMiddleware } from '../../middleware/auth/authMiddleware';
import { createWorkshopBookingSchema } from '../routevalidators/createWorkshopBooking';
import { addToCartSchema } from '../routevalidators/addToCartSchema';

const router = Router();

router.get('/all', validateQuery(getAllWorkshopSchema as JSONSchemaType<unknown>), getAllWorkshops);
router.get(
  '/homepage',
  validateQuery(getAllWorkshopSchema as JSONSchemaType<unknown>),
  getHomepageWorkshops,
);

router.get(
  '/byCategory',
  validateQuery(getAllWorkshopSchema as JSONSchemaType<unknown>),
  getWorkshopsByCategory,
);

router.get(
  '/adminAll',
  userAuthMiddleware,
  validateQuery(getAllWorkshopSchema as JSONSchemaType<unknown>),
  getAllWorkshopsForAdmin,
);
router.post(
  '/',
  userAuthMiddleware,
  validateReqBody(createWorkshopSchema as JSONSchemaType<unknown>),
  sanitizeBody,
  createWorkshop,
);
router.put(
  '/:id',
  userAuthMiddleware,
  validateReqBody(createWorkshopSchema as JSONSchemaType<unknown>),
  sanitizeBody,
  updateWorkshopById,
);
router.delete('/:id', userAuthMiddleware, deleteWorkshopById);
router.get('/bySlug/:slug', getWorkshopBySlug);
router.get('/:id', userAuthMiddleware, getWorkshopById);

router.post('/availability', checkWorkshopAvailability);
router.post(
  '/booking',
  validateReqBody(createWorkshopBookingSchema as JSONSchemaType<unknown>),
  sanitizeBody,
  createWorkshopBooking,
);

router.get('/bookings/all', userAuthMiddleware, getWorkshopBookings);
router.get('/workshop-booking/:id', userAuthMiddleware, getWorkshopBookingById);

// Cart apis
router.post(
  '/cart',
  validateReqBody(addToCartSchema as JSONSchemaType<unknown>),
  sanitizeBody,
  addToCart,
);

router.get('/cart/:userId', getCartController);
router.delete('/cart/item', removeCartItem);
router.post('/cart/checkout', checkoutCart);

export default router;
