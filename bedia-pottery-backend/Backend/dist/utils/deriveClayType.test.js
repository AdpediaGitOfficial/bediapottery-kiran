"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deriveClayType_1 = require("./deriveClayType");
describe('deriveClayType', () => {
    it('strips a trailing " - Kids" audience suffix', () => {
        expect((0, deriveClayType_1.deriveClayType)('Air-Dry Clay - Kids')).toBe('Air-Dry Clay');
    });
    it('strips a trailing " - Adults" audience suffix', () => {
        expect((0, deriveClayType_1.deriveClayType)('Ceramic Clay - Adults')).toBe('Ceramic Clay');
    });
    it('is case-insensitive for the audience suffix', () => {
        expect((0, deriveClayType_1.deriveClayType)('Ceramic Clay - adults')).toBe('Ceramic Clay');
        expect((0, deriveClayType_1.deriveClayType)('Air-Dry Clay - KIDS')).toBe('Air-Dry Clay');
    });
    it('keeps the title unchanged when there is no audience suffix', () => {
        expect((0, deriveClayType_1.deriveClayType)('Ceramic Clay')).toBe('Ceramic Clay');
    });
    it('only strips the suffix at the end, not internal hyphens', () => {
        expect((0, deriveClayType_1.deriveClayType)('Air-Dry Clay - Adults')).toBe('Air-Dry Clay');
    });
    it('returns an empty string for undefined/null/empty input', () => {
        expect((0, deriveClayType_1.deriveClayType)(undefined)).toBe('');
        expect((0, deriveClayType_1.deriveClayType)(null)).toBe('');
        expect((0, deriveClayType_1.deriveClayType)('')).toBe('');
    });
});
