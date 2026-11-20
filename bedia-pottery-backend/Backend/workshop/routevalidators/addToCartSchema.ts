import { JSONSchemaType } from 'ajv';

export interface AddToCartInput {
  userId: string;
  workshopId: string;
  bookingDate: string;
  slotId: string;
  optionId: string;
  people: number;
}

export const addToCartSchema: JSONSchemaType<AddToCartInput> = {
  type: 'object',
  properties: {
    userId: {
      type: 'string',
      minLength: 24,
      maxLength: 24,
    },
    workshopId: {
      type: 'string',
      minLength: 24,
      maxLength: 24,
    },
    bookingDate: { type: 'string' },
    slotId: {
      type: 'string',
      minLength: 24,
      maxLength: 24,
    },
    optionId: {
      type: 'string',
      minLength: 24,
      maxLength: 24,
    },
    people: {
      type: 'integer',
      minimum: 1,
    },
  },
  required: ['userId', 'workshopId', 'bookingDate', 'slotId', 'optionId', 'people'],
  additionalProperties: false,
};
