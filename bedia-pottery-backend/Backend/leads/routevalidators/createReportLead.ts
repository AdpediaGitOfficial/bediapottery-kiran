import { JSONSchemaType } from 'ajv';
import { IReportLeadsBody } from '../../types/leadsTypes';

export const createReportLeadSchema: JSONSchemaType<IReportLeadsBody> = {
  type: 'object',
  properties: {
    userName: { type: 'string', minLength: 1 },
    email: { type: 'string', minLength: 1 },
    phone: { type: 'string', minLength: 1 },
    leadType: { type: 'string', minLength: 1 },
    preferredLanguage: { type: 'string', minLength: 1 },
    propertyIdentifier: { type: 'string', minLength: 1 },
  },
  required: ['userName', 'email', 'phone', 'leadType', 'preferredLanguage', 'propertyIdentifier'],
  additionalProperties: true,
};
