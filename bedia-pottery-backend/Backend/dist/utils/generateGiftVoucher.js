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
// Word-wrap a block of text to fit within maxWidth (in pts).
// Respects explicit \n line breaks, then wraps each segment by word.
function wrapText(text, font, fontSize, maxWidth) {
    const result = [];
    for (const paragraph of text.split('\n')) {
        const words = paragraph.trim().split(/\s+/).filter(Boolean);
        if (!words.length) {
            result.push('');
            continue;
        }
        let line = '';
        for (const word of words) {
            const candidate = line ? `${line} ${word}` : word;
            if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth && line) {
                result.push(line);
                line = word;
            }
            else {
                line = candidate;
            }
        }
        if (line)
            result.push(line);
    }
    return result;
}
// ─── main export ──────────────────────────────────────────────────────────────
const generateGiftVoucher = async ({ personalMessage, guests, giftFor, giftValidity, voucherCode, clayType, redeemUrl, }) => {
    const templatePath = path_1.default.join(process.cwd(), 'uploads/templates/gift-voucher-template.pdf');
    const existingPdfBytes = new Uint8Array(fs_1.default.readFileSync(templatePath));
    const pdfDoc = await pdf_lib_1.PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit_1.default);
    const pages = pdfDoc.getPages();
    const page1 = pages[0];
    const page2 = pages[1];
    // Alata — the display font used by the template artwork. Alata ships only a
    // Regular weight, so it backs both the regular and "bold" text runs.
    const alataBytes = new Uint8Array(fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'uploads/fonts/Alata-Regular.ttf')));
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
    const MSG_CENTER_Y = 300; // vertical centre of the card
    const MSG_MAX_WIDTH = 640;
    const MSG_LEFT_X = (pw1 - MSG_MAX_WIDTH) / 2; // left edge of the text block
    const msgFontSize = 18;
    const msgLineGap = Math.round(msgFontSize * 0.55);
    const msgLines = wrapText(personalMessage || '', font, msgFontSize, MSG_MAX_WIDTH);
    const totalMsgH = msgLines.length * msgFontSize + (msgLines.length - 1) * msgLineGap;
    let msgVY = MSG_CENTER_Y + totalMsgH / 2 - msgFontSize;
    for (const line of msgLines) {
        placeText(page1, line, MSG_LEFT_X, msgVY, { size: msgFontSize, font, color: (0, pdf_lib_1.rgb)(0.1, 0.1, 0.1) }, angle1, pw1, ph1);
        msgVY -= msgFontSize + msgLineGap;
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
    const pdfBytes = await pdfDoc.save();
    const fileName = `voucher-${Date.now()}.pdf`;
    const outputPath = path_1.default.join(process.cwd(), 'uploads/vouchers', fileName);
    fs_1.default.writeFileSync(outputPath, pdfBytes);
    return { fileName, outputPath };
};
exports.generateGiftVoucher = generateGiftVoucher;
