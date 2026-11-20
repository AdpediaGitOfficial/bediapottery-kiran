import { JSONSchemaType } from 'ajv';
import { IGetByDateQuery } from '../../types/leadsTypes';

export const getLeadByDateSchema: JSONSchemaType<IGetByDateQuery> = {
  type: 'object',
  properties: {
    startDate: { type: 'string', minLength: 1 },
    endDate: { type: 'string', minLength: 1 },
    leadType: { type: 'string', nullable: true },
  },
  required: ['startDate', 'endDate'],
  additionalProperties: true,
};
