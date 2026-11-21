"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGiftVoucher = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_lib_1 = require("pdf-lib");
const fontkit_1 = __importDefault(require("@pdf-lib/fontkit"));
// ─── helpers ──────────────────────────────────────────────────────────────────
// Visual coordinates use origin = BOTTOM-LEFT of the displayed page.
// These helpers convert visual → native PDF space for any page rotation.
function visToPdf(vx, vy, angle, pw, ph) {
    switch (angle) {
        case 90:
            return { x: ph - vy, y: vx };
        case 180:
            return { x: pw - vx, y: ph - vy };
        case 270:
            return { x: vy, y: pw - vx };
        default:
            return { x: vx, y: vy };
    }
}
function placeText(page, text, vx, vy, opts, angle, pw, ph) {
    const { x, y } = visToPdf(vx, vy, angle, pw, ph);
    const rotate = (0, pdf_lib_1.degrees)((360 - angle) % 360);
    page.drawText(text, { x, y, rotate, ...opts });
}
// Same limit as the message box on the gift card page.
const VOUCHER_MESSAGE_MAX_LENGTH = 250;
/**
 * Turns what the buyer typed into the text printed on the voucher.
 *
 * The request passes through an HTML sanitiser, which writes "<" as "&lt;" and
 * ">" as "&gt;"; those are turned back so "I <3 you" prints as typed. Anything
 * left over is trimmed, so a message of only spaces or line breaks counts as no
 * message at all. An empty string means "no message".
 */
function normalizeVoucherMessage(raw) {
    if (typeof raw !== 'string')
        return '';
    return (raw
        // Real tags that survived the sanitiser (<b>, <br>) are not part of a message.
        .replace(/<\/?[a-z][^>]*>/gi, '')
        // "&amp;" last, so an escaped "&amp;lt;" prints as the literal "&lt;".
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'")
        .replace(/&amp;/g, '&')
        // The template font has no emoji, which would print as empty boxes.
        .replace(/[\p{Extended_Pictographic}\uFE0E\uFE0F]/gu, '')
        // Invisible characters would make a blank message look like a real one.
        .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
        .replace(/\r\n?/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .slice(0, VOUCHER_MESSAGE_MAX_LENGTH)
        .trim());
}
// Word-wrap a block of text to fit within maxWidth (in pts).
// Respects explicit \n line breaks, then wraps each segment by word. A single
// word wider than the card (a long run with no spaces) is broken across lines
// instead of running past the border.
function wrapText(text, font, fontSize, maxWidth) {
    const result = [];
    const fits = (value) => font.widthOfTextAtSize(value, fontSize) <= maxWidth;
    for (const paragraph of text.split('\n')) {
        const words = paragraph.trim().split(/\s+/).filter(Boolean);
        if (!words.length) {
            result.push('');
            continue;
        }
        let line = '';
        for (let word of words) {
            let candidate = line ? `${line} ${word}` : word;
            if (!fits(candidate) && line) {
                result.push(line);
                line = '';
                candidate = word;
            }
            // Break what is still too wide, one character at a time.
            while (!fits(candidate) && Array.from(candidate).length > 1) {
                const chars = Array.from(candidate);
                let cut = chars.length - 1;
                while (cut > 1 && !fits(chars.slice(0, cut).join(''))) {
                    cut -= 1;
                }
                result.push(chars.slice(0, cut).join(''));
                candidate = chars.slice(cut).join('');
            }
            line = candidate;
        }
        if (line)
            result.push(line);
    }
    return result;
}
/**
 * Where a voucher file (template or font) is read from. A copy in `uploads/` wins,
 * so a design swapped in on the server is used as it is; otherwise the copy that
 * ships with the code in `assets/voucher/` is used, so a fresh checkout works
 * without anything being copied by hand.
 */
function voucherAssetPath(uploadsRelative, bundledRelative) {
    const uploaded = path_1.default.join(process.cwd(), 'uploads', uploadsRelative);
    if (fs_1.default.existsSync(uploaded))
        return uploaded;
    return path_1.default.join(process.cwd(), 'assets/voucher', bundledRelative);
}
/**
 * Removes the empty message card when there is no message, saves the PDF and
 * reports what was made. Shared by both template layouts.
 */
async function finishVoucher(pdfDoc, hasMessage) {
    // No message: remove the empty message card (page 1). Done last, after the
    // other pages have been written, so none of their positions shift.
    if (!hasMessage) {
        pdfDoc.removePage(0);
    }
    const pdfBytes = await pdfDoc.save();
    const fileName = `voucher-${Date.now()}.pdf`;
    const outputDir = path_1.default.join(process.cwd(), 'uploads/vouchers');
    // A new server has no vouchers folder yet.
    fs_1.default.mkdirSync(outputDir, { recursive: true });
    const outputPath = path_1.default.join(outputDir, fileName);
    fs_1.default.writeFileSync(outputPath, pdfBytes);
    return { fileName, outputPath, hasMessage, pageCount: pdfDoc.getPageCount() };
}
// ─── compact template (419 × 298 pt) ──────────────────────────────────────────
// The newer voucher artwork is the same three pages at about half the size,
// with the clay type, guests, validity and code laid out in a box on page 2.
// Coordinates are PDF pts from the bottom-left corner, measured from the artwork.
const COMPACT_TEMPLATE_MAX_WIDTH = 600; // the older template is 874 pt wide
const BRAND_BROWN = (0, pdf_lib_1.rgb)(72 / 255, 50 / 255, 42 / 255); // #483229
const BRAND_GREEN = (0, pdf_lib_1.rgb)(13 / 255, 70 / 255, 61 / 255); // #0d463d
/**
 * Where a page's visible area starts. The newer template's visible area begins
 * 8.25 pt above the file's own bottom edge, and the positions below were measured
 * on what is visible, so each one is shifted by this before drawing.
 */
const originOf = (page) => {
    const box = page.getMediaBox();
    return { x: box.x, y: box.y };
};
/** Poppins is the template's text font; Alata (always present) is the fallback. */
async function embedCompactFonts(pdfDoc) {
    const read = (name) => {
        const file = voucherAssetPath(`fonts/${name}`, `fonts/${name}`);
        return fs_1.default.existsSync(file) ? new Uint8Array(fs_1.default.readFileSync(file)) : null;
    };
    const regular = read('Poppins-Regular.ttf');
    const bold = read('Poppins-Bold.ttf');
    if (regular && bold) {
        return {
            font: await pdfDoc.embedFont(regular, { subset: true }),
            fontBold: await pdfDoc.embedFont(bold, { subset: true }),
        };
    }
    console.warn('Poppins fonts not found in uploads/fonts or assets/voucher/fonts; the voucher text uses Alata instead.');
    const alata = await pdfDoc.embedFont(new Uint8Array(fs_1.default.readFileSync(voucherAssetPath('fonts/Alata-Regular.ttf', 'fonts/Alata-Regular.ttf'))), { subset: true });
    return { font: alata, fontBold: alata };
}
/** Draws one line of text, shrunk (not below minSize) until it fits maxWidth. */
function drawFittedLine(page, text, { font, x, y, size, minSize, maxWidth, color }) {
    let fontSize = size;
    while (fontSize > minSize && font.widthOfTextAtSize(text, fontSize) > maxWidth) {
        fontSize -= 0.25;
    }
    page.drawText(text, { x, y, size: fontSize, font, color });
    return { size: fontSize, width: font.widthOfTextAtSize(text, fontSize) };
}
/** "2 Adults' Pottery Experience" — who the voucher is for, when that is known. */
function describeIncludes(guests, audience) {
    const who = /^kid|^child/i.test(String(audience || ''))
        ? "Kids' "
        : /^adult/i.test(String(audience || ''))
            ? "Adults' "
            : '';
    return `${guests ? `${guests} ` : ''}${who}Pottery Experience`;
}
/** "16 October 2027", in UAE time, as the template's example shows it. */
function formatValidUntil(validUntil, fallback) {
    const date = validUntil ? new Date(validUntil) : null;
    if (date && !Number.isNaN(date.getTime())) {
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'Asia/Dubai',
        });
    }
    return fallback || '';
}
async function drawCompactVoucher(pdfDoc, pages, { personalMessage, guests, audience, giftValidity, validUntil, voucherCode, clayType, redeemUrl, }) {
    const [page1, page2, page3] = pages;
    const origin1 = originOf(page1);
    const origin2 = originOf(page2);
    const { font, fontBold } = await embedCompactFonts(pdfDoc);
    // ── PAGE 1 — personal message, inside the bordered card (x 30–387, y 47–227) ──
    const message = normalizeVoucherMessage(personalMessage);
    const hasMessage = message.length > 0;
    if (hasMessage) {
        const MSG_MAX_WIDTH = 300;
        const MSG_MAX_HEIGHT = 150;
        const MSG_CENTER_Y = 137; // vertical centre of the card
        const MSG_LEFT_X = (page1.getSize().width - MSG_MAX_WIDTH) / 2;
        // 11 pt, shrunk to 6.5 pt if too tall; if still too tall, many short lines
        // are run together as one paragraph, which always fits (250 characters).
        const fit = (text) => {
            let size = 11;
            for (;;) {
                const gap = Math.round(size * 0.55);
                const lines = wrapText(text, font, size, MSG_MAX_WIDTH);
                const height = lines.length * size + (lines.length - 1) * gap;
                if (height <= MSG_MAX_HEIGHT || size <= 6.5) {
                    return { size, gap, lines, height };
                }
                size -= 0.5;
            }
        };
        let layout = fit(message);
        if (layout.height > MSG_MAX_HEIGHT) {
            layout = fit(message.replace(/\s*\n\s*/g, ' '));
        }
        let lineY = MSG_CENTER_Y + layout.height / 2 - layout.size;
        for (const line of layout.lines) {
            page1.drawText(line, {
                x: MSG_LEFT_X + origin1.x,
                y: lineY + origin1.y,
                size: layout.size,
                font,
                color: BRAND_BROWN,
            });
            lineY -= layout.size + layout.gap;
        }
    }
    // ── PAGE 2 — the four values that follow the template's labels ──────────────
    const FIELD_RIGHT_EDGE = 380; // inside the info box (right edge ≈ 388)
    const field = (text, x, y, useBold = false) => {
        if (!text)
            return;
        drawFittedLine(page2, text, {
            font: useBold ? fontBold : font,
            x: x + origin2.x,
            y: y + origin2.y,
            size: 9.5,
            minSize: 6.5,
            maxWidth: FIELD_RIGHT_EDGE - x,
            color: BRAND_BROWN,
        });
    };
    field(clayType, 240.9, 71.3);
    field(describeIncludes(guests, audience), 241.6, 57.0);
    field(formatValidUntil(validUntil, giftValidity), 241.2, 42.8);
    field(voucherCode, 259.1, 28.6, true);
    // ── PAGE 3 — clickable booking link after the "Booking Link:" label ─────────
    if (redeemUrl && page3) {
        const origin3 = originOf(page3);
        const LINK_X = 110.5;
        const LINK_Y = 52.1;
        const { size, width } = drawFittedLine(page3, redeemUrl, {
            font,
            x: LINK_X + origin3.x,
            y: LINK_Y + origin3.y,
            size: 7.5,
            minSize: 4.5,
            maxWidth: 380 - LINK_X,
            color: BRAND_GREEN,
        });
        const linkAnnotation = pdfDoc.context.obj({
            Type: 'Annot',
            Subtype: 'Link',
            Rect: [
                LINK_X + origin3.x,
                LINK_Y + origin3.y - 2,
                LINK_X + origin3.x + width,
                LINK_Y + origin3.y + size + 2,
            ],
            Border: [0, 0, 0],
            A: { Type: 'Action', S: 'URI', URI: pdf_lib_1.PDFString.of(redeemUrl) },
        });
        const annotRef = pdfDoc.context.register(linkAnnotation);
        if (page3.node.get(pdf_lib_1.PDFName.of('Annots'))) {
            page3.node.lookup(pdf_lib_1.PDFName.of('Annots'), pdf_lib_1.PDFArray).push(annotRef);
        }
        else {
            page3.node.set(pdf_lib_1.PDFName.of('Annots'), pdfDoc.context.obj([annotRef]));
        }
    }
    return hasMessage;
}
// ─── main export ──────────────────────────────────────────────────────────────
const generateGiftVoucher = async ({ personalMessage, guests, giftFor, giftValidity, voucherCode, clayType, redeemUrl, audience, validUntil, }) => {
    const templatePath = voucherAssetPath('templates/gift-voucher-template.pdf', 'gift-voucher-template.pdf');
    const existingPdfBytes = new Uint8Array(fs_1.default.readFileSync(templatePath));
    const pdfDoc = await pdf_lib_1.PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit_1.default);
    const pages = pdfDoc.getPages();
    // The newer, half-size template has its own layout; the older one (874 pt
    // wide) keeps the layout below, so either file works on any server.
    if (pages[0].getSize().width < COMPACT_TEMPLATE_MAX_WIDTH) {
        const compactHasMessage = await drawCompactVoucher(pdfDoc, pages, {
            personalMessage,
            guests,
            audience,
            giftValidity,
            validUntil,
            voucherCode,
            clayType,
            redeemUrl,
        });
        return finishVoucher(pdfDoc, compactHasMessage);
    }
    const page1 = pages[0];
    const page2 = pages[1];
    // Alata — the display font used by the template artwork. Alata ships only a
    // Regular weight, so it backs both the regular and "bold" text runs.
    const alataBytes = new Uint8Array(fs_1.default.readFileSync(voucherAssetPath('fonts/Alata-Regular.ttf', 'fonts/Alata-Regular.ttf')));
    const font = await pdfDoc.embedFont(alataBytes, { subset: true });
    const fontBold = font;
    const { width: pw1, height: ph1 } = page1.getSize();
    const { width: pw2, height: ph2 } = page2.getSize();
    const angle1 = page1.getRotation().angle;
    const angle2 = page2.getRotation().angle;
    // Template pages are 874 × 621 pt (no rotation).
    // All coordinates are PDF pts measured from the bottom-left corner.
    // ── PAGE 1 — personal message ───────────────────────────────────────────────
    // The message is vertically centred within the bordered card, left-aligned
    // horizontally, and wraps line by line.
    // Page 1 of the template is an empty message card. It is only part of the
    // voucher when the buyer wrote a message; without one, that page is removed
    // below and the voucher starts at the "Gift Voucher" page.
    const message = normalizeVoucherMessage(personalMessage);
    const hasMessage = message.length > 0;
    if (hasMessage) {
        const MSG_CENTER_Y = 300; // vertical centre of the card
        const MSG_MAX_WIDTH = 640;
        const MSG_MAX_HEIGHT = 300; // the card's usable height
        const MSG_LEFT_X = (pw1 - MSG_MAX_WIDTH) / 2; // left edge of the text block
        // 18 pt, shrunk a point at a time (to 10 pt) if the message is too tall for
        // the card. A message of many short lines that is still too tall at 10 pt
        // is run together as one paragraph, which always fits (250 characters at most).
        const fit = (text) => {
            let size = 18;
            for (;;) {
                const gap = Math.round(size * 0.55);
                const lines = wrapText(text, font, size, MSG_MAX_WIDTH);
                const height = lines.length * size + (lines.length - 1) * gap;
                if (height <= MSG_MAX_HEIGHT || size <= 10) {
                    return { size, gap, lines, height };
                }
                size -= 1;
            }
        };
        let layout = fit(message);
        if (layout.height > MSG_MAX_HEIGHT) {
            layout = fit(message.replace(/\s*\n\s*/g, ' '));
        }
        const { size: msgFontSize, gap: msgLineGap, lines: msgLines, height: totalMsgH } = layout;
        let msgVY = MSG_CENTER_Y + totalMsgH / 2 - msgFontSize;
        for (const line of msgLines) {
            placeText(page1, line, MSG_LEFT_X, msgVY, { size: msgFontSize, font, color: (0, pdf_lib_1.rgb)(0.1, 0.1, 0.1) }, angle1, pw1, ph1);
            msgVY -= msgFontSize + msgLineGap;
        }
    }
    // ── PAGE 2 — clay type, voucher code, banner ────────────────────────────────
    const VOUCHER_CENTER_X = 639; // matches the "Gift Voucher" heading centre
    // Clay type + "Pottery Experience", just below the big "Gift Voucher" heading
    // (dropped a few pts to give the heading breathing room).
    if (clayType) {
        const clayFontSize = 18;
        const clayText = `${clayType} Pottery Experience`.toUpperCase();
        const clayWidth = font.widthOfTextAtSize(clayText, clayFontSize);
        placeText(page2, clayText, VOUCHER_CENTER_X - clayWidth / 2, 338, { size: clayFontSize, font, color: (0, pdf_lib_1.rgb)(0.27, 0.18, 0.12) }, angle2, pw2, ph2);
    }
    // The template artwork draws the code strip in black, so it is repainted in
    // the brand brown (#48322a). Strip geometry in the template: 282×26 pt at
    // (489, 302), overdrawn by 0.5 pt on each side to hide antialiased edges.
    page2.drawRectangle({
        x: 485,
        y: 302,
        width: 290,
        height: 28,
        //  width: 283,
        // height: 27,
        color: (0, pdf_lib_1.rgb)(72 / 255, 50 / 255, 42 / 255),
    });
    // Voucher code centred inside the strip (white text, auto-shrunk to fit).
    if (voucherCode) {
        const BLACK_BOX_WIDTH = 290;
        const codeText = `CODE: ${voucherCode}`;
        let codeFontSize = 18;
        while (codeFontSize > 9 &&
            fontBold.widthOfTextAtSize(codeText, codeFontSize) > BLACK_BOX_WIDTH) {
            codeFontSize -= 1;
        }
        const codeWidth = fontBold.widthOfTextAtSize(codeText, codeFontSize);
        placeText(page2, codeText, VOUCHER_CENTER_X - codeWidth / 2, 310, { size: codeFontSize, font: fontBold, color: (0, pdf_lib_1.rgb)(1, 1, 1) }, angle2, pw2, ph2);
    }
    // ── PAGE 2 — bottom banner: redemption package + validity note ──────────────
    const bannerFontSize = 19;
    const bannerColor = (0, pdf_lib_1.rgb)(0.17, 0.17, 0.17);
    // e.g. "This voucher can be redeemed for 1 Adult's Pottery Wheel Workshop"
    {
        const audience = giftFor ? `${giftFor.charAt(0).toUpperCase()}${giftFor.slice(1)}'s ` : '';
        const packageLine = `This voucher can be redeemed for ${guests ? `${guests} ` : ''}${audience}Pottery Wheel Workshop`;
        const pkgWidth = font.widthOfTextAtSize(packageLine, bannerFontSize);
        placeText(page2, packageLine, (pw2 - pkgWidth) / 2, 108, { size: bannerFontSize, font, color: bannerColor }, angle2, pw2, ph2);
    }
    if (giftValidity) {
        const dateLine = `Note: This voucher is valid only until ${giftValidity}`;
        const dateWidth = font.widthOfTextAtSize(dateLine, bannerFontSize);
        placeText(page2, dateLine, (pw2 - dateWidth) / 2, 
        // 86,
        79, { size: bannerFontSize, font, color: bannerColor }, angle2, pw2, ph2);
    }
    // ── PAGE 3 — clickable booking/redeem link on the "How to redeem" page ──────
    if (redeemUrl && pages.length > 2) {
        const page3 = pages[2];
        const label = 'Booking Link: ';
        // Free strip just below the instruction text block (text ends at y≈193).
        // The pottery images occupy the bottom-left up to x≈330, and the marble
        // border starts around x≈715 at this height, so the line is anchored at
        // LINK_X and auto-shrunk to fit LINK_MAX_WIDTH.
        // const LINK_X = 330;
        // const LINK_Y = 170;
        const LINK_X = 194;
        // The page-3 artwork moved down ~17pt when the template's origin offset
        // was corrected, so the link follows it to keep the same visual spot.
        const LINK_Y = 101;
        const LINK_MAX_WIDTH = 385;
        const urlFontSize = 18;
        let linkFontSize = 56;
        while (linkFontSize > 9 &&
            fontBold.widthOfTextAtSize(label, linkFontSize) +
                font.widthOfTextAtSize(redeemUrl, linkFontSize) >
                LINK_MAX_WIDTH) {
            linkFontSize -= 1;
        }
        const labelWidth = fontBold.widthOfTextAtSize(label, linkFontSize);
        const urlWidth = font.widthOfTextAtSize(redeemUrl, linkFontSize);
        const totalWidth = labelWidth + urlWidth;
        const linkX = LINK_X;
        const linkY = LINK_Y;
        // page3.drawText(label, {
        //   x: linkX,
        //   y: linkY,
        //   size: linkFontSize,
        //   font: fontBold,
        //   color: rgb(0.17, 0.17, 0.17),
        // });
        page3.drawText(redeemUrl, {
            x: linkX + labelWidth,
            y: linkY,
            // size: linkFontSize,
            size: urlFontSize,
            font,
            // Brand green (#0d463d), matching the logo.
            color: (0, pdf_lib_1.rgb)(13 / 255, 70 / 255, 61 / 255),
        });
        // Link annotation so the whole line is clickable in PDF viewers.
        const linkAnnotation = pdfDoc.context.obj({
            Type: 'Annot',
            Subtype: 'Link',
            Rect: [linkX, linkY - 5, linkX + totalWidth, linkY + linkFontSize + 4],
            Border: [0, 0, 0],
            A: { Type: 'Action', S: 'URI', URI: pdf_lib_1.PDFString.of(redeemUrl) },
        });
        const annotRef = pdfDoc.context.register(linkAnnotation);
        const existingAnnots = page3.node.get(pdf_lib_1.PDFName.of('Annots'));
        if (existingAnnots) {
            const annotsArray = page3.node.lookup(pdf_lib_1.PDFName.of('Annots'), pdf_lib_1.PDFArray);
            annotsArray.push(annotRef);
        }
        else {
            page3.node.set(pdf_lib_1.PDFName.of('Annots'), pdfDoc.context.obj([annotRef]));
        }
    }
    return finishVoucher(pdfDoc, hasMessage);
};
exports.generateGiftVoucher = generateGiftVoucher;
exports.normalizeVoucherMessage = normalizeVoucherMessage;
exports.wrapText = wrapText;
exports.VOUCHER_MESSAGE_MAX_LENGTH = VOUCHER_MESSAGE_MAX_LENGTH;
exports.describeIncludes = describeIncludes;
exports.formatValidUntil = formatValidUntil;
