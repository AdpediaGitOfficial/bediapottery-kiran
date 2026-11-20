"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReportLeadSchema = void 0;
exports.createReportLeadSchema = {
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
