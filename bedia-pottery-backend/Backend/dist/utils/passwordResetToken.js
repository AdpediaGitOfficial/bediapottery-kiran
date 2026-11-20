"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeResetTokenUserId = exports.verifyResetToken = exports.generateResetToken = exports.buildResetLink = exports.RESET_TOKEN_DURATION = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const configKeys_1 = __importDefault(require("../configKeys"));
/**
 * Password reset tokens are signed with the user's *current* password hash
 * appended to the app secret. Once the password is changed the signing key no
 * longer reproduces, so any previously issued reset token stops verifying.
 * That gives us single-use tokens without persisting them anywhere.
 */
const resetSecret = (currentPasswordHash) => `${configKeys_1.default.JWT_SECRET}${currentPasswordHash}`;
exports.RESET_TOKEN_DURATION = '15m';
/**
 * Configured base URLs may or may not carry a trailing slash, which would
 * otherwise produce links containing '//'.
 */
const buildResetLink = (baseUrl, path, token) => {
    const base = (baseUrl || '').replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}?token=${encodeURIComponent(token)}`;
};
exports.buildResetLink = buildResetLink;
const generateResetToken = (userId, currentPasswordHash) => {
    const payload = { userId, purpose: 'password_reset' };
    return jsonwebtoken_1.default.sign(payload, resetSecret(currentPasswordHash), {
        expiresIn: exports.RESET_TOKEN_DURATION,
    });
};
exports.generateResetToken = generateResetToken;
/**
 * Returns the payload when the token is valid for this user, otherwise null.
 * Callers must look the user up first so the current hash is available.
 */
const verifyResetToken = (token, currentPasswordHash) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, resetSecret(currentPasswordHash));
        if (decoded.purpose !== 'password_reset')
            return null;
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.verifyResetToken = verifyResetToken;
/**
 * Reset tokens are handed back to the client, so the userId has to be readable
 * before we can fetch the hash needed to verify the signature. Decoding without
 * verification is safe here precisely because the signature is checked after.
 */
const decodeResetTokenUserId = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded || decoded.purpose !== 'password_reset')
            return null;
        return decoded.userId;
    }
    catch (error) {
        return null;
    }
};
exports.decodeResetTokenUserId = decodeResetTokenUserId;
