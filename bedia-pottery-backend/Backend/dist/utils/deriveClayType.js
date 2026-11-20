"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveClayType = void 0;
/**
 * Derives the clay type for a gift voucher from a booking item's optionTitle.
 *
 * optionTitle looks like "Air-Dry Clay - Kids" or "Ceramic Clay - Adults".
 * The trailing " - Kids"/" - Adults" audience suffix is stripped so only the
 * clay type remains (e.g. "Air-Dry Clay", "Ceramic Clay").
 */
const deriveClayType = (optionTitle) => {
    return (optionTitle || '').replace(/\s*-\s*(Kids|Adults)\s*$/i, '').trim();
};
exports.deriveClayType = deriveClayType;
