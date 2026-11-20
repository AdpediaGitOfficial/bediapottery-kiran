"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.potteryBookingSchema = void 0;
const objectIdPattern = '^[a-fA-F0-9]{24}$';
// ajv-formats is not installed, so `format: 'email'` would fail to compile the
// schema. A pattern keeps the check local to this route.
const emailPattern = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$';
/**
 * Same customer block as `checkoutCartSchema`, but the booking entries come in
 * the body instead of a stored cart and there is no userId — the pottery site
 * checks out without asking the visitor to log in.
 *
 * `workshops` mirrors the shape POST /workshop/booking already takes, except
 * bookingType (and giftDetails) sit on each entry rather than at the top level,
 * so one request can mix a gift with a dated pottery session.
 */
exports.potteryBookingSchema = {
    type: 'object',
    properties: {
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
                email: { type: 'string', pattern: emailPattern },
            },
            required: ['firstName', 'lastName', 'phone', 'email'],
            additionalProperties: false,
        },
        workshops: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                properties: {
                    workshopId: { type: 'string', pattern: objectIdPattern },
                    // Required for every booking type except 'gift', which carries no
                    // schedule until the recipient redeems it. Enforced in the use case,
                    // where the entry's bookingType is known.
                    bookingDate: { type: 'string', nullable: true },
                    slotId: { type: 'string', pattern: objectIdPattern, nullable: true },
                    bookingType: {
                        type: 'string',
                        enum: ['normal', 'gift', 'pottery', 'events'],
                        nullable: true,
                    },
                    // 'family' asks for party pricing: the option's price covers the party
                    // named in its priceDescription ("1 Adult + 1 Child") and the guests
                    // beyond it are charged from the workshop's "Extra Adult"/"Extra
                    // Child" options. Sent only for the family workshop; see
                    // utils/workshopOptionPricing.ts.
                    workshopType: { type: 'string', nullable: true },
                    makingType: { type: 'string', nullable: true },
                    giftDetails: {
                        type: 'object',
                        nullable: true,
                        properties: {
                            recipientName: { type: 'string', nullable: true },
                            giftEmail: { type: 'string', nullable: true },
                            giftPhone: { type: 'string', nullable: true },
                            giftFor: { type: 'string', nullable: true },
                            occasion: { type: 'string', nullable: true },
                            personalMessage: { type: 'string', nullable: true },
                        },
                        required: [],
                        additionalProperties: false,
                    },
                    items: {
                        type: 'array',
                        minItems: 1,
                        items: {
                            type: 'object',
                            properties: {
                                optionId: { type: 'string', pattern: objectIdPattern },
                                people: { type: 'integer', minimum: 1 },
                                adult: { type: 'number', nullable: true },
                                child: { type: 'number', nullable: true },
                                // Accepted on the item as well as on the entry, since either
                                // reads naturally from the front end; the item wins.
                                workshopType: { type: 'string', nullable: true },
                                handBuild: { type: 'number', nullable: true },
                                wheelPottery: { type: 'number', nullable: true },
                            },
                            required: ['optionId', 'people'],
                            additionalProperties: false,
                        },
                    },
                },
                required: ['workshopId', 'items'],
                additionalProperties: false,
            },
        },
    },
    required: ['customer', 'workshops'],
    additionalProperties: false,
};
