"use strict";
/**
 * The gift voucher PDF is built from a three-page template: an empty message
 * card, the "Gift Voucher" page and the "How To Redeem" page. The message card is
 * only part of the voucher when the buyer wrote a message; without one the
 * voucher is the other two pages.
 *
 * The first block needs no files. The second builds a stand-in template with the
 * same three pages and needs the Alata font, so it runs where
 * uploads/fonts/Alata-Regular.ttf exists (or VOUCHER_TEST_FONT points to it) and
 * is skipped elsewhere. The real template artwork is not used or stored here.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const os = require('os');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { generateGiftVoucher, normalizeVoucherMessage, wrapText, VOUCHER_MESSAGE_MAX_LENGTH, } = require("./generateGiftVoucher");
/** A font that gives every character the same width, so wrapping is easy to predict. */
const fakeFont = { widthOfTextAtSize: (text, size) => Array.from(text).length * size * 0.5 };
describe('normalizeVoucherMessage — what counts as a message', () => {
    it.each([
        ['nothing', undefined],
        ['null', null],
        ['an empty string', ''],
        ['spaces only', '   '],
        ['line breaks and tabs only', ' \n\t\r\n '],
        ['invisible characters only', '​‌⁠﻿'],
        ['a number', 42],
    ])('%s is no message', (_label, value) => {
        expect(normalizeVoucherMessage(value)).toBe('');
    });
    it('keeps an ordinary message and trims it', () => {
        expect(normalizeVoucherMessage('  Happy Birthday!  ')).toBe('Happy Birthday!');
    });
    it('turns the sanitiser\'s codes back into the characters the buyer typed', () => {
        expect(normalizeVoucherMessage('I &lt;3 pottery and you &gt; everything')).toBe('I <3 pottery and you > everything');
        expect(normalizeVoucherMessage('Mom &amp; Dad')).toBe('Mom & Dad');
        expect(normalizeVoucherMessage('say &quot;hi&quot; &#39;now&#39;')).toBe('say "hi" \'now\'');
    });
    it('does not decode twice: an escaped code stays as typed', () => {
        expect(normalizeVoucherMessage('&amp;lt;')).toBe('&lt;');
    });
    it('keeps "I <3 you" even when it was not sanitised', () => {
        expect(normalizeVoucherMessage('I <3 you > me')).toBe('I <3 you > me');
    });
    it('drops HTML tags that got through', () => {
        expect(normalizeVoucherMessage('<b>Happy</b> birthday<br>')).toBe('Happy birthday');
    });
    it('drops emoji, which the template font cannot draw', () => {
        expect(normalizeVoucherMessage('Enjoy ❤️ it 🎉')).toBe('Enjoy  it');
    });
    it('a message made only of emoji is no message', () => {
        expect(normalizeVoucherMessage('🎉🎂')).toBe('');
    });
    it('keeps normal line breaks but not runs of blank lines', () => {
        expect(normalizeVoucherMessage('one\ntwo')).toBe('one\ntwo');
        expect(normalizeVoucherMessage('one\n\n\n\n\ntwo')).toBe('one\n\ntwo');
    });
    it('keeps at most the 250 characters the gift card form allows', () => {
        expect(VOUCHER_MESSAGE_MAX_LENGTH).toBe(250);
        expect(normalizeVoucherMessage('a'.repeat(400))).toHaveLength(250);
    });
});
describe('wrapText', () => {
    it('wraps at spaces', () => {
        // 10 characters per line at size 2 and 0.5 width per character -> width 10.
        expect(wrapText('aaaa bbbb cccc', fakeFont, 2, 10)).toEqual(['aaaa bbbb', 'cccc']);
    });
    it('keeps explicit line breaks', () => {
        expect(wrapText('one\ntwo', fakeFont, 2, 100)).toEqual(['one', 'two']);
    });
    it('breaks a word wider than the card instead of letting it run past', () => {
        const lines = wrapText('a'.repeat(25), fakeFont, 2, 10);
        expect(lines.length).toBeGreaterThan(1);
        for (const line of lines) {
            expect(fakeFont.widthOfTextAtSize(line, 2)).toBeLessThanOrEqual(10);
        }
        expect(lines.join('')).toBe('a'.repeat(25));
    });
    it('does not lose a long word that follows other words', () => {
        const lines = wrapText(`hi ${'b'.repeat(25)}`, fakeFont, 2, 10);
        expect(lines.join('').replace(/ /g, '')).toBe(`hi${'b'.repeat(25)}`);
    });
});
const FONT_PATH = process.env.VOUCHER_TEST_FONT || path.join(process.cwd(), 'uploads/fonts/Alata-Regular.ttf');
const describeWithFont = fs.existsSync(FONT_PATH) ? describe : describe.skip;
describeWithFont('generateGiftVoucher — which pages the voucher has', () => {
    let workDir;
    const base = {
        guests: '2',
        giftFor: 'adult',
        giftValidity: 'November 21, 2027',
        voucherCode: 'BPAB12CD',
        clayType: 'Air-Dry Clay',
        redeemUrl: 'https://example.com/redeem?ref=abc',
    };
    beforeAll(async () => {
        workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'voucher-test-'));
        fs.mkdirSync(path.join(workDir, 'uploads/templates'), { recursive: true });
        fs.mkdirSync(path.join(workDir, 'uploads/fonts'), { recursive: true });
        fs.mkdirSync(path.join(workDir, 'uploads/vouchers'), { recursive: true });
        fs.copyFileSync(FONT_PATH, path.join(workDir, 'uploads/fonts/Alata-Regular.ttf'));
        // Stand-in for the real template: three blank pages of the same size.
        const template = await PDFDocument.create();
        for (let i = 0; i < 3; i += 1)
            template.addPage([874, 621]);
        fs.writeFileSync(path.join(workDir, 'uploads/templates/gift-voucher-template.pdf'), await template.save());
        jest.spyOn(process, 'cwd').mockReturnValue(workDir);
    });
    afterAll(() => {
        jest.restoreAllMocks();
        fs.rmSync(workDir, { recursive: true, force: true });
    });
    const build = async (personalMessage) => {
        const result = await generateGiftVoucher({ ...base, personalMessage });
        const pdf = await PDFDocument.load(fs.readFileSync(result.outputPath));
        return { result, pdf };
    };
    it.each([
        ['no message', undefined],
        ['an empty message', ''],
        ['a message of spaces', '    \n  '],
        ['a message of only emoji', '🎉🎂'],
    ])('%s -> two pages, without the message card', async (_label, message) => {
        const { result, pdf } = await build(message);
        expect(result.hasMessage).toBe(false);
        expect(result.pageCount).toBe(2);
        expect(pdf.getPageCount()).toBe(2);
    });
    it.each([
        ['a short message', 'Happy Birthday!'],
        ['a message with an ampersand', 'Mom & Dad'],
        ['a message with "<3"', 'I &lt;3 you'],
        ['the longest allowed message', 'Happy birthday! '.repeat(20)],
        ['a long run with no spaces', 'A'.repeat(250)],
        ['many short lines', Array.from({ length: 80 }, (_, i) => `line ${i}`).join('\n')],
    ])('%s -> three pages, with the message card first', async (_label, message) => {
        const { result, pdf } = await build(message);
        expect(result.hasMessage).toBe(true);
        expect(result.pageCount).toBe(3);
        expect(pdf.getPageCount()).toBe(3);
    });
    it.each([
        ['without a message', undefined],
        ['with a message', 'Happy Birthday!'],
    ])('the redeem link is on the last page %s', async (_label, message) => {
        const { pdf } = await build(message);
        const linksOn = (page) => page.node.Annots()?.size() ?? 0;
        const pages = pdf.getPages();
        expect(linksOn(pages[pages.length - 1])).toBe(1);
        for (const page of pages.slice(0, -1)) {
            expect(linksOn(page)).toBe(0);
        }
    });
});
