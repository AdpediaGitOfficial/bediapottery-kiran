import { Router } from 'express';
import {
  createLead,
  createListPropertyLead,
  createQuestionnaireLead,
  createReportLead,
  getAllLeads,
  getLeadsByDate,
} from '../controllers/createLeadController';
import sanitizeBody from '../../middleware/sanitizeMiddleware';
import { validateQuery, validateReqBody } from '../../middleware/validate';
import { createLeadSchema } from '../routevalidators/createLead';
import { JSONSchemaType } from 'ajv';
import { questionnaireLeadSchema } from '../routevalidators/questionnaireLead';
import { getLeadByDateSchema } from '../routevalidators/getLeadByDate';
import { createLeadQuerySchema } from '../routevalidators/createLeadQuery';
import { createReportLeadSchema } from '../routevalidators/createReportLead';
import { createListPropertyLeadSchema } from '../routevalidators/createListPropertyLead';
import { userAuthMiddleware } from '../../middleware/auth/authMiddleware';

const router = Router();

router.post(
  '/',
  validateQuery(createLeadQuerySchema as JSONSchemaType<unknown>),
  validateReqBody(createLeadSchema as JSONSchemaType<unknown>),
  sanitizeBody,
  createLead,
);
router.post(
  '/report',
  validateReqBody(createReportLeadSchema as JSONSchemaType<unknown>),
  sanitizeBody,
  createReportLead,
);
router.post(
  '/list-property',
  validateReqBody(createListPropertyLeadSchema as JSONSchemaType<unknown>),
  sanitizeBody,
  createListPropertyLead,
);
router.post(
  '/questionnaire',
  validateReqBody(questionnaireLeadSchema as JSONSchemaType<unknown>),
  sanitizeBody,
  createQuestionnaireLead,
);
router.get('/all', userAuthMiddleware, getAllLeads);
router.get(
  '/fetch-by-date',
  userAuthMiddleware,
  validateQuery(getLeadByDateSchema as JSONSchemaType<unknown>),
  getLeadsByDate,
);

export default router;
