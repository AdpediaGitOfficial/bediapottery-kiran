import { JSONSchemaType } from 'ajv';
import { ICreateWorkshopBookingBody } from '../../types/workshopTypes';

const objectIdPattern = '^[a-fA-F0-9]{24}$';

export const createWorkshopBookingSchema: JSONSchemaType<ICreateWorkshopBookingBody> = {
  type: 'object',

  properties: {
    workshops: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          workshopId: { type: 'string', pattern: objectIdPattern },
          bookingDate: { type: 'string' },
          slotId: { type: 'string', pattern: objectIdPattern },
          items: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              properties: {
                optionId: { type: 'string', pattern: objectIdPattern },
                people: { type: 'number', minimum: 1 },
              },
              required: ['optionId', 'people'],
              additionalProperties: false,
            },
          },
        },
        required: ['workshopId', 'bookingDate', 'slotId', 'items'],
        additionalProperties: false,
      },
    },
    giftFor: { type: 'string', nullable: true },
    occasion: { type: 'string', nullable: true },
    personalMessage: { type: 'string', nullable: true },

    customer: {
      type: 'object',
      properties: {
        firstName: { type: 'string', minLength: 1 },
        lastName: { type: 'string', minLength: 1 },
        companyName: { type: 'string', nullable: true },
        notes: { type: 'string', nullable: true },
        country: { type: 'string', nullable: true },
        address: { type: 'string', nullable: true },
        city: { type: 'string', nullable: true },
        state: { type: 'string', nullable: true },
        zipCode: { type: 'string', nullable: true },
        phone: { type: 'string', minLength: 5 },
        email: { type: 'string' },
      },
      required: ['firstName', 'lastName', 'phone', 'email'],
      additionalProperties: false,
    },
  },

  required: ['workshops', 'customer'],
  additionalProperties: false,
};
