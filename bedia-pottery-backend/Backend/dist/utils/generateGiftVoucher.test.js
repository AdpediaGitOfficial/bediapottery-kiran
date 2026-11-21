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
const { generateGiftVoucher, normalizeVoucherMessage, wrapText, VOUCHER_MESSAGE_MAX_LENGTH, describeIncludes, formatValidUntil, } = require("./generateGiftVoucher");
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
describe('the wording of the newer voucher artwork', () => {
    it('says who the voucher is for', () => {
        expect(describeIncludes('1', 'Kids')).toBe("1 Kids' Pottery Experience");
        expect(describeIncludes('2', 'adults')).toBe("2 Adults' Pottery Experience");
        expect(describeIncludes('3', 'Child')).toBe("3 Kids' Pottery Experience");
    });
    it('leaves the audience out when it is not known', () => {
        expect(describeIncludes('2', '')).toBe('2 Pottery Experience');
        expect(describeIncludes('2', undefined)).toBe('2 Pottery Experience');
        expect(describeIncludes(undefined, '')).toBe('Pottery Experience');
    });
    it('writes the validity date as the artwork shows it', () => {
        expect(formatValidUntil(new Date('2027-10-16T08:00:00Z'))).toBe('16 October 2027');
        expect(formatValidUntil('2027-01-05T08:00:00Z')).toBe('5 January 2027');
    });
    it('uses the UAE calendar day, not the server\'s', () => {
        // 21:00 UTC on the 15th is already the 16th in Dubai (UTC+4).
        expect(formatValidUntil(new Date('2027-10-15T21:00:00Z'))).toBe('16 October 2027');
    });
    it('falls back to the text it was given when there is no usable date', () => {
        expect(formatValidUntil(undefined, 'November 21, 2027')).toBe('November 21, 2027');
        expect(formatValidUntil('not a date', 'fallback')).toBe('fallback');
        expect(formatValidUntil(undefined, undefined)).toBe('');
    });
});
describeWithFont('generateGiftVoucher — the newer, half-size template', () => {
    let workDir;
    const base = {
        guests: '2',
        audience: 'Adults',
        validUntil: new Date('2027-11-21T08:00:00Z'),
        voucherCode: 'BPAB12CD',
        clayType: 'Air-Dry Clay',
        redeemUrl: 'https://example.com/redeem?ref=abc',
    };
    beforeAll(async () => {
        workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'voucher-compact-test-'));
        fs.mkdirSync(path.join(workDir, 'uploads/templates'), { recursive: true });
        fs.mkdirSync(path.join(workDir, 'uploads/fonts'), { recursive: true });
        fs.mkdirSync(path.join(workDir, 'uploads/vouchers'), { recursive: true });
        // Only Alata is provided, so this also covers the fallback when Poppins is absent.
        fs.copyFileSync(FONT_PATH, path.join(workDir, 'uploads/fonts/Alata-Regular.ttf'));
        // Stand-in for the new artwork: three pages of its size, whose visible area
        // starts 8.25 pt above the file's bottom edge, as the real file's does.
        const template = await PDFDocument.create();
        for (let i = 0; i < 3; i += 1) {
            const page = template.addPage([419.25, 306]);
            page.setMediaBox(0, 8.25, 419.25, 297.75);
        }
        fs.writeFileSync(path.join(workDir, 'uploads/templates/gift-voucher-template.pdf'), await template.save());
        jest.spyOn(process, 'cwd').mockReturnValue(workDir);
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);
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
        ['a message of spaces', '   \n '],
    ])('%s -> two pages', async (_label, message) => {
        const { result, pdf } = await build(message);
        expect(result.hasMessage).toBe(false);
        expect(pdf.getPageCount()).toBe(2);
    });
    it.each([
        ['a short message', 'Happy Birthday!'],
        ['the longest allowed message', 'Happy birthday! '.repeat(20)],
        ['a long run with no spaces', 'A'.repeat(250)],
        ['many short lines', Array.from({ length: 80 }, (_, i) => `line ${i}`).join('\n')],
    ])('%s -> three pages', async (_label, message) => {
        const { result, pdf } = await build(message);
        expect(result.hasMessage).toBe(true);
        expect(pdf.getPageCount()).toBe(3);
    });
    it('keeps the redeem link on the last page, with or without a message', async () => {
        for (const message of [undefined, 'Happy Birthday!']) {
            const { pdf } = await build(message);
            const pages = pdf.getPages();
            const linksOn = (page) => page.node.Annots()?.size() ?? 0;
            expect(linksOn(pages[pages.length - 1])).toBe(1);
            expect(pages.slice(0, -1).every((page) => linksOn(page) === 0)).toBe(true);
        }
    });
    it('places the link inside the visible area of the page', async () => {
        const { pdf } = await build(undefined);
        const last = pdf.getPages()[pdf.getPageCount() - 1];
        const annotation = last.node.Annots().lookup(0);
        const [x1, y1, x2, y2] = annotation.lookup(require('pdf-lib').PDFName.of('Rect')).asArray().map((n) => n.asNumber());
        expect(x1).toBeGreaterThan(100);
        expect(x2).toBeLessThanOrEqual(419.25);
        // Visible area is y 8.25 – 306; the link strip sits in its lower part.
        expect(y1).toBeGreaterThan(8.25);
        expect(y2).toBeLessThan(120);
    });
    it('still builds a voucher when a clay type or code is very long', async () => {
        const result = await generateGiftVoucher({
            ...base,
            clayType: 'Extra Long Terracotta Clay With A Very Long Name Indeed',
            voucherCode: 'BP'.padEnd(40, 'X'),
            redeemUrl: `https://example.com/redeem?ref=${'a'.repeat(120)}`,
            personalMessage: 'Hi',
        });
        expect(result.pageCount).toBe(3);
    });
});
describeWithFont('generateGiftVoucher — where the template and fonts are read from', () => {
    let workDir;
    const base = {
        guests: '2',
        audience: 'Kids',
        validUntil: new Date('2027-11-21T08:00:00Z'),
        voucherCode: 'BPAB12CD',
        clayType: 'Air-Dry Clay',
        redeemUrl: 'https://example.com/redeem?ref=abc',
        personalMessage: 'Happy Birthday!',
    };
    const standIn = async (file, width, height) => {
        const template = await PDFDocument.create();
        for (let i = 0; i < 3; i += 1)
            template.addPage([width, height]);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, await template.save());
    };
    beforeEach(() => {
        workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'voucher-assets-test-'));
        jest.spyOn(process, 'cwd').mockReturnValue(workDir);
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        // The font ships with the code in assets/voucher/fonts, as it does in the repo.
        fs.mkdirSync(path.join(workDir, 'assets/voucher/fonts'), { recursive: true });
        fs.copyFileSync(FONT_PATH, path.join(workDir, 'assets/voucher/fonts/Alata-Regular.ttf'));
    });
    afterEach(() => {
        jest.restoreAllMocks();
        fs.rmSync(workDir, { recursive: true, force: true });
    });
    const pageWidthOf = async (result) => {
        const pdf = await PDFDocument.load(fs.readFileSync(result.outputPath));
        return Math.round(pdf.getPages()[0].getSize().width);
    };
    it('works on a server with no uploads folder at all, using the files that ship with the code', async () => {
        await standIn(path.join(workDir, 'assets/voucher/gift-voucher-template.pdf'), 419.25, 297.75);
        const result = await generateGiftVoucher(base);
        expect(result.pageCount).toBe(3);
        expect(await pageWidthOf(result)).toBe(419);
    });
    it('creates the vouchers folder when it does not exist', async () => {
        await standIn(path.join(workDir, 'assets/voucher/gift-voucher-template.pdf'), 419.25, 297.75);
        expect(fs.existsSync(path.join(workDir, 'uploads/vouchers'))).toBe(false);
        const result = await generateGiftVoucher(base);
        expect(fs.existsSync(result.outputPath)).toBe(true);
        expect(path.dirname(result.outputPath)).toBe(path.join(workDir, 'uploads/vouchers'));
    });
    it('a template placed in uploads wins over the one that ships with the code', async () => {
        await standIn(path.join(workDir, 'assets/voucher/gift-voucher-template.pdf'), 419.25, 297.75);
        // The older, larger artwork, as an existing server may still have it.
        await standIn(path.join(workDir, 'uploads/templates/gift-voucher-template.pdf'), 874, 621);
        const result = await generateGiftVoucher(base);
        expect(await pageWidthOf(result)).toBe(874);
    });
    it('a font placed in uploads wins over the one that ships with the code', async () => {
        await standIn(path.join(workDir, 'assets/voucher/gift-voucher-template.pdf'), 419.25, 297.75);
        // An unreadable font in uploads proves it is the one chosen.
        fs.mkdirSync(path.join(workDir, 'uploads/fonts'), { recursive: true });
        fs.writeFileSync(path.join(workDir, 'uploads/fonts/Poppins-Regular.ttf'), 'not a font');
        fs.writeFileSync(path.join(workDir, 'uploads/fonts/Poppins-Bold.ttf'), 'not a font');
        await expect(generateGiftVoucher(base)).rejects.toBeTruthy();
    });
    it('falls back to Alata when Poppins is in neither place', async () => {
        await standIn(path.join(workDir, 'assets/voucher/gift-voucher-template.pdf'), 419.25, 297.75);
        const result = await generateGiftVoucher(base);
        expect(result.pageCount).toBe(3);
    });
});
