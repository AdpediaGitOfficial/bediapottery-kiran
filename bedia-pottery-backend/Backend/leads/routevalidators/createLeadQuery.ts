import { JSONSchemaType } from 'ajv';
import { ICreateLeadQuery } from '../../types/leadsTypes';

export const createLeadQuerySchema: JSONSchemaType<ICreateLeadQuery> = {
  type: 'object',
  properties: {
    download: { type: 'string', enum: ['floorplan', 'brochure', 'report'], nullable: true },
  },
  required: [],
  additionalProperties: true,
};
