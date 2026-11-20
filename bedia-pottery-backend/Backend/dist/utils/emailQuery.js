"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailMatchQuery = exports.normalizeEmail = void 0;
/**
 * Addresses are stored exactly as they were typed at registration, so a plain
 * equality match misses "Soniya@Gmail.com" when the user types
 * "soniya@gmail.com" on the forgot-password form. That silently looked like a
 * mail delivery failure, so lookups that start from a user-typed address match
 * case-insensitively instead.
 */
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalizeEmail = (email) => (email || '').trim().toLowerCase();
exports.normalizeEmail = normalizeEmail;
const emailMatchQuery = (email) => new RegExp(`^${escapeRegex((0, exports.normalizeEmail)(email))}$`, 'i');
exports.emailMatchQuery = emailMatchQuery;
