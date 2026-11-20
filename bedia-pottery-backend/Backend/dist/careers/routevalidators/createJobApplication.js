"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJobApplicationSchema = void 0;
exports.createJobApplicationSchema = {
    type: 'object',
    properties: {
        applicantName: { type: 'string', minLength: 1 },
        email: { type: 'string', minLength: 1 },
        phone: { type: 'string', minLength: 1 },
        resume: { type: 'string', nullable: true },
        coverLetter: { type: 'string', nullable: true },
        jobTitle: { type: 'string', minLength: 1 },
        jobSlug: { type: 'string', minLength: 1 },
    },
    required: ['applicantName', 'email', 'phone', 'jobTitle', 'jobSlug'],
    additionalProperties: true,
};
