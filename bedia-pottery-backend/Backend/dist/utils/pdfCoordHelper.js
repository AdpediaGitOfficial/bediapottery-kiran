"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCoordGrid = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_lib_1 = require("pdf-lib");
/**
 * Generates a copy of the gift voucher template with a coordinate grid overlaid.
 * Open the output PDF to read exact X,Y positions for text placement.
 * Grid lines every 50pts; major lines (100pt) are darker.
 */
const generateCoordGrid = async (pageIndex = 0) => {
    const templatePath = path_1.default.join(process.cwd(), 'uploads/templates/gift-voucher-template.pdf');
    const existingPdfBytes = new Uint8Array(fs_1.default.readFileSync(templatePath));
    const pdfDoc = await pdf_lib_1.PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
    const page = pdfDoc.getPages()[pageIndex];
    const { width, height } = page.getSize();
    const STEP = 50;
    for (let x = 0; x <= width; x += STEP) {
        const isMajor = x % 100 === 0;
        page.drawLine({
            start: { x, y: 0 },
            end: { x, y: height },
            thickness: isMajor ? 0.6 : 0.3,
            color: isMajor ? (0, pdf_lib_1.rgb)(1, 0, 0) : (0, pdf_lib_1.rgb)(0.7, 0.3, 0.3),
            opacity: 0.5,
        });
        if (isMajor) {
            page.drawText(String(x), {
                x: x + 2,
                y: height - 12,
                size: 8,
                font,
                color: (0, pdf_lib_1.rgb)(1, 0, 0),
                opacity: 0.9,
            });
        }
    }
    for (let y = 0; y <= height; y += STEP) {
        const isMajor = y % 100 === 0;
        page.drawLine({
            start: { x: 0, y },
            end: { x: width, y },
            thickness: isMajor ? 0.6 : 0.3,
            color: isMajor ? (0, pdf_lib_1.rgb)(0, 0, 1) : (0, pdf_lib_1.rgb)(0.3, 0.3, 0.8),
            opacity: 0.5,
        });
        if (isMajor) {
            page.drawText(String(y), {
                x: 2,
                y: y + 2,
                size: 8,
                font,
                color: (0, pdf_lib_1.rgb)(0, 0, 1),
                opacity: 0.9,
            });
        }
    }
    // Draw a small red dot at origin (0,0) so you can orient the axes
    page.drawCircle({ x: 0, y: 0, size: 5, color: (0, pdf_lib_1.rgb)(1, 0, 0) });
    page.drawText(`Page ${pageIndex + 1}  |  width=${width.toFixed(0)}  height=${height.toFixed(0)}  (PDF pts, origin = bottom-left)`, {
        x: 10,
        y: height - 20,
        size: 9,
        font,
        color: (0, pdf_lib_1.rgb)(0, 0, 0),
        opacity: 0.85,
    });
    const pdfBytes = await pdfDoc.save();
    const outPath = path_1.default.join(process.cwd(), 'uploads/vouchers', `coord-grid-p${pageIndex + 1}-${Date.now()}.pdf`);
    fs_1.default.writeFileSync(outPath, pdfBytes);
    return outPath;
};
exports.generateCoordGrid = generateCoordGrid;
