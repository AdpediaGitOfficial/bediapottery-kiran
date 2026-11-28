"use strict";
/**
 * Every picture the emails ask for exists, and the pictures that show in every mail
 * program (the header logo and the social icons) are PNG. Gmail and Outlook do not
 * display SVG, and one file name that did not exist left the header logo broken.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
const LOGO_DIR = path.join(__dirname, '..', 'uploads', 'logo');
const SERVICES = ['workshopBookingMailService.js', 'potteryTrackingMailService.js', 'passwordResetMailService.js'];
const source = (file) => fs.readFileSync(path.join(__dirname, file), 'utf8');
const references = (text) => Array.from(text.matchAll(/uploads\/logo\/([^?`"' )]+)/g), (m) => m[1]);
describe('email pictures', () => {
    it.each(SERVICES)('%s: every picture it asks for exists in uploads/logo', (file) => {
        const missing = references(source(file)).filter((name) => !fs.existsSync(path.join(LOGO_DIR, name)));
        expect(missing).toEqual([]);
    });
    it.each(SERVICES)('%s: the header logo and the social icons are PNG, not SVG', (file) => {
        const light = references(source(file)).filter((name) => /^(BP_ICON|instagram|tiktok|youtube)/.test(name) && !/-dark/.test(name));
        const svg = light.filter((name) => name.endsWith('.svg'));
        expect(svg).toEqual([]);
    });
    it('the pottery emails use the BP header logo', () => {
        expect(references(source('workshopBookingMailService.js'))).toContain('BP_ICON_email.png');
        expect(references(source('potteryTrackingMailService.js'))).toContain('BP_ICON_email.png');
    });
    it('the header logo is a small PNG (it loads fast in an email)', () => {
        const file = path.join(LOGO_DIR, 'BP_ICON_email.png');
        expect(fs.statSync(file).size).toBeLessThan(60 * 1024);
        // a PNG starts with this signature
        expect(fs.readFileSync(file).subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    });
});
