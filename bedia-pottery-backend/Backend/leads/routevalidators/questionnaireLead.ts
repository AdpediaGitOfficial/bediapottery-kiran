import { JSONSchemaType } from 'ajv';
import { IQuestionnaireBody } from '../../types/leadsTypes';

export const questionnaireLeadSchema: JSONSchemaType<IQuestionnaireBody> = {
  type: 'object',
  properties: {
    userName: { type: 'string', minLength: 1 },
    email: { type: 'string', minLength: 1 },
    phone: { type: 'string', minLength: 1 },
    preferredLanguage: { type: 'string', minLength: 1 },
    propertyType: { type: 'string', minLength: 1 },
    // property type, area preferred,  ideal budget, bedrooms, user type, expected time, communication preferred, preferred time,  name , email , phone, language
    preferredArea: { type: 'string', minLength: 1 },
    idealBudget: { type: 'string', minLength: 1 },
    bedrooms: { type: 'string', minLength: 1 },
    userType: { type: 'string', minLength: 1 },
    expectedPurchaseTime: { type: 'string', minLength: 1 },
    preferredContactMethod: { type: 'string', minLength: 1 },
    preferredContactTime: { type: 'string', minLength: 1 },
    leadType: { type: 'string', minLength: 1 },
  },
  required: [
    'userName',
    'email',
    'phone',
    'preferredLanguage',
    'propertyType',
    'preferredArea',
    'idealBudget',
    'bedrooms',
    'userType',
    'expectedPurchaseTime',
    'preferredContactMethod',
    'preferredContactTime',
    'leadType',
  ],
  additionalProperties: true,
};
