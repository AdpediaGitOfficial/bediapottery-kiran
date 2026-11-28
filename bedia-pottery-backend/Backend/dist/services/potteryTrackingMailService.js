"use strict";
/**
 * The five emails a tracked pottery piece sends over its life:
 *
 *   1. the tracking link, when the admin marks the piece Created
 *   2. the painting invitation, when a Ceramic piece reaches Painting
 *   3. taking a little longer, when the studio marks the piece Delayed
 *   4. ready for collection, when the piece is ready
 *   5. the final-collection warning, a week before the discard deadline
 *
 * They share the booking confirmation email's chrome — logo, dividers, social
 * footer, dark-mode swaps and the deep green bottom bar — so a customer sees
 * one consistent studio voice. That chrome lives in `renderTrackingEmail` here
 * rather than being copied five times.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRACKING_STATUS_COPY = exports.sendCollectionWarningMail = exports.sendReadyForCollectionMail = exports.sendDelayMail = exports.sendPaintingReadyMail = exports.sendTrackingLinkMail = exports.resolveRecipient = exports.formatMailDate = void 0;
const mailService_1 = require("./mailService");
const potteryTracking_1 = require("../utils/potteryTracking");
const configKeys_1 = __importDefault(require("../configKeys"));
const STUDIO_MAP_URL = 'https://www.google.com/maps/place/Bedia+Pottery+%7C+Adults+%26+Kids+Birthday+Party+Packages+%2B+Fun+Beginners+Workshop/@25.1393368,55.2263525,17z/data=!4m6!3m5!1s0x3e5f69be5e716b71:0x79d624863c4c5812!8m2!3d25.1396865!4d55.2286163!16s%2Fg%2F11vdldm6g6';
const WHATSAPP_NUMBER = '+971569569088';
const WHATSAPP_LINK = 'https://wa.me/message/GCWBT42WZ2TOP1';
/** Dates are shown to the customer in the studio's own format. */
const formatMailDate = (date) => date
    ? new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })
    : '';
exports.formatMailDate = formatMailDate;
/**
 * Where a tracking email is actually delivered.
 *
 * With TRACKING_TEST_EMAIL set, all five emails are redirected to that inbox
 * so the studio can review the live templates without mailing real customers.
 * Nothing about the message itself changes, so what arrives in the test inbox
 * is exactly what the customer would have received.
 *
 * Unset or blank — the normal case, and what production must run with — and
 * the customer's own address is used.
 */
const resolveRecipient = (customerEmail) => {
    const override = (configKeys_1.default.TRACKING_TEST_EMAIL || '').trim();
    if (!override)
        return customerEmail;
    console.log(`TRACKING MAIL REDIRECTED — intended: ${customerEmail} → sent to: ${override}`);
    return override;
};
exports.resolveRecipient = resolveRecipient;
const renderTrackingEmail = ({ previewText, greeting, headline, bodyHtml, signOff, }) => {
    const logoUrl = `${process.env.BASE_URL}/uploads/logo/logo.png`;
    const logoIconUrl = `${process.env.BASE_URL}/uploads/logo/BP_ICON_email.png?v=1`;
    const instagramIcon = `${process.env.BASE_URL}/uploads/logo/instagram.png?v=5`;
    const tiktokIcon = `${process.env.BASE_URL}/uploads/logo/tiktok.png?v=5`;
    const youtubeIcon = `${process.env.BASE_URL}/uploads/logo/youtube.png?v=5`;
    const logoIconDarkUrl = `${process.env.BASE_URL}/uploads/logo/pottery-icon-dark.svg?v=2`;
    const instagramIconDark = `${process.env.BASE_URL}/uploads/logo/instagram-dark.svg?v=2`;
    const tiktokIconDark = `${process.env.BASE_URL}/uploads/logo/tiktok-dark.svg?v=2`;
    const youtubeIconDark = `${process.env.BASE_URL}/uploads/logo/youtube-dark.svg?v=3`;
    const logoDarkUrl = `${process.env.BASE_URL}/uploads/logo/bediapottery-logo-dark.svg?v=6`;
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${headline}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #ffffff; }
    * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; line-height: 100%; }
    a { text-decoration: none; }
    .dark-img { display: none; }

    @media only screen and (max-width: 600px) {
      .main-card { width: 100% !important; max-width: 100% !important; }
      .px { padding-left: 16px !important; padding-right: 16px !important; }
      .title { font-size: 20px !important; }
      .row-label, .row-value { font-size: 13px !important; }
      .logo-icon { height: 38px !important; }
    }

    @media (prefers-color-scheme: dark) {
      body, .email-bg { background-color: #0b0f0d !important; }
      .main-card { background-color: #11201c !important; }
      .text-strong { color: #f4f5f3 !important; }
      .text-muted { color: #a8b3ad !important; }
      .hr { border-top-color: #2c3a35 !important; }
      .note-box { background-color: #16261f !important; border-color: #2c3a35 !important; }
      .footer-badge { background-color: transparent !important; border: 0 !important; }
      .light-img { display: none !important; }
      .dark-img { display: block !important; max-height: none !important; overflow: visible !important; line-height: inherit !important; font-size: inherit !important; }
      .dark-img img { filter: none !important; -webkit-filter: none !important; forced-color-adjust: none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#fbfaf5;">
    ${previewText}
  </div>

  <table role="presentation" class="email-bg" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:0;">
        <!--[if mso]><table role="presentation" align="center" width="540" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->

        <table role="presentation" width="100%" class="main-card" style="max-width:540px;width:100%;background-color:#fbfaf5;margin:0 auto;padding:0;" cellpadding="0" cellspacing="0" border="0">

          <!-- Logo -->
          <tr>
            <td align="left" class="px" style="padding:15px 30px 10px 30px;">
              <img src="${logoIconUrl}" alt="Bedia Pottery" class="logo-icon light-img" style="height:45px;width:auto;display:block;border:0;outline:none;" />
              <!--[if !mso]><!-->
              <div class="dark-img" style="display:none;mso-hide:all;overflow:hidden;max-height:0;font-size:0;line-height:0;">
                <img src="${logoIconDarkUrl}" alt="Bedia Pottery" class="logo-icon" style="height:45px;width:auto;display:block;border:0;outline:none;filter:none;-webkit-filter:none;" />
              </div>
              <!--<![endif]-->
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 0 10px 0;">
              <div class="hr" style="border-top:1px solid #e5e7eb;font-size:1px;line-height:1px;height:1px;">&nbsp;</div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td class="px text-strong" style="padding:0 30px 10px 30px;font-size:15px;color:#000000;font-weight:400;">
              ${greeting}
            </td>
          </tr>

          <!-- Headline -->
          <tr>
            <td class="px" style="padding:0 30px 12px 30px;">
              <h1 class="title text-strong" style="color:#000000;margin:0;font-size:22px;font-weight:600;letter-spacing:-0.4px;line-height:1.2;">
                ${headline}
              </h1>
            </td>
          </tr>

          ${bodyHtml}

          <!-- Sign off -->
          <tr>
            <td class="px text-strong" style="padding:12px 30px 8px 30px;font-size:14px;color:#000000;line-height:1.6;">
              ${signOff}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 0 6px 0;">
              <div class="hr" style="border-top:1px solid #e5e7eb;font-size:1px;line-height:1px;height:1px;">&nbsp;</div>
            </td>
          </tr>

          <!-- Footer: logo + social -->
          <tr>
            <td class="px" style="padding:4px 30px 14px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <table role="presentation" class="footer-badge" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;border:0;">
                      <tr>
                        <td style="padding:0;">
                          <img src="${logoUrl}" alt="Bedia Pottery" class="light-img" style="height:20px;width:auto;display:block;border:0;" />
                          <!--[if !mso]><!-->
                          <div class="dark-img" style="display:none;mso-hide:all;overflow:hidden;max-height:0;font-size:0;line-height:0;">
                            <img src="${logoDarkUrl}" alt="Bedia Pottery" style="height:20px;width:auto;display:block;border:0;filter:none;-webkit-filter:none;" />
                          </div>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:middle;white-space:nowrap;font-size:0;">
                    <a href="https://www.instagram.com/bediapottery/" style="display:inline-block;margin-left:12px;text-decoration:none;vertical-align:middle;">
                      <img src="${instagramIcon}" alt="Instagram" width="20" height="20" class="light-img" style="display:block;width:20px;height:20px;border:0;border-radius:100%;" />
                      <!--[if !mso]><!-->
                      <div class="dark-img" style="display:none;mso-hide:all;overflow:hidden;max-height:0;font-size:0;line-height:0;">
                        <img src="${instagramIconDark}" alt="Instagram" width="20" height="20" style="display:block;width:20px;height:20px;border:0;" />
                      </div>
                      <!--<![endif]-->
                    </a>
                    <a href="https://www.tiktok.com/@bediapottery" style="display:inline-block;margin-left:12px;text-decoration:none;vertical-align:middle;">
                      <img src="${tiktokIcon}" alt="TikTok" width="20" height="20" class="light-img" style="display:block;width:20px;height:20px;border:0;border-radius:100%;" />
                      <!--[if !mso]><!-->
                      <div class="dark-img" style="display:none;mso-hide:all;overflow:hidden;max-height:0;font-size:0;line-height:0;">
                        <img src="${tiktokIconDark}" alt="TikTok" width="20" height="20" style="display:block;width:20px;height:20px;border:0;" />
                      </div>
                      <!--<![endif]-->
                    </a>
                    <a href="https://www.youtube.com/@bediapottery" style="display:inline-block;margin-left:12px;text-decoration:none;vertical-align:middle;">
                      <img src="${youtubeIcon}" alt="YouTube" width="20" height="20" class="light-img" style="display:block;width:20px;height:20px;border:0;border-radius:100%;" />
                      <!--[if !mso]><!-->
                      <div class="dark-img" style="display:none;mso-hide:all;overflow:hidden;max-height:0;font-size:0;line-height:0;">
                        <img src="${youtubeIconDark}" alt="YouTube" width="20" height="20" style="display:block;width:20px;height:20px;border:0;" />
                      </div>
                      <!--<![endif]-->
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bottom bar -->
          <tr>
            <td style="background-color:#0d463d;height:30px;font-size:1px;line-height:1px;">&nbsp;</td>
          </tr>

        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
};
/* ---------------- shared body fragments ---------------- */
const paragraph = (text, padding = '0 30px 12px 30px') => `
          <tr>
            <td class="px text-strong" style="padding:${padding};font-size:14px;color:#000000;line-height:1.6;">
              ${text}
            </td>
          </tr>`;
/** The piece codes, which the customer quotes at reception. */
const itemCodesBlock = (itemCodes = []) => {
    if (!itemCodes.length)
        return '';
    return `
          <tr>
            <td class="px" style="padding:0 30px 14px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="note-box" style="background-color:#f4f2ea;border:1px solid #e5e7eb;border-radius:8px;">
                <tr>
                  <td style="padding:12px 14px;">
                    <p class="text-muted" style="margin:0 0 4px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">
                      Item Code${itemCodes.length === 1 ? '' : 's'}
                    </p>
                    <p class="text-strong" style="margin:0;font-size:16px;font-weight:700;color:#000000;letter-spacing:0.5px;">
                      ${itemCodes.join(' &nbsp;·&nbsp; ')}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
};
const buttonBlock = (href, label) => `
          <tr>
            <td class="px" style="padding:4px 30px 16px 30px;">
              <a href="${href}" style="display:inline-block;background:#0d463d;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:0.3px;">
                ${label}
              </a>
            </td>
          </tr>`;
/** Falls back to the plain URL for clients that strip the button styling. */
const linkFallbackBlock = (href) => `
          <tr>
            <td class="px" style="padding:0 30px 14px 30px;">
              <p class="text-muted" style="margin:0;font-size:12px;color:#6b7280;word-break:break-all;line-height:1.5;">
                Or paste this into your browser: <a href="${href}" style="color:#0d463d;text-decoration:underline;">${href}</a>
              </p>
            </td>
          </tr>`;
/* ---------------- 1. tracking link ---------------- */
/**
 * Sent the moment the admin completes the workshop and adds the item codes.
 * The link is the customer's only route back to the journey page, so this is
 * the one email in the set that must never be silently skipped.
 */
const sendTrackingLinkMail = async ({ booking, trackingUrl, }) => {
    try {
        const customer = booking?.customer;
        if (!customer?.email) {
            console.log('TRACKING LINK MAIL SKIPPED — no customer email');
            return;
        }
        const itemCodes = booking?.tracking?.itemCodes || [];
        const bodyHtml = [
            paragraph('Thank you for joining us for the pottery experience. We hope you truly enjoyed the experience and had a wonderful time creating your piece.'),
            paragraph('You can track the progress of your masterpiece using the link below:'),
            buttonBlock(trackingUrl, 'Track My Pottery'),
            linkFallbackBlock(trackingUrl),
            itemCodesBlock(itemCodes),
            paragraph('We look forward to sharing the finished piece with you.'),
        ].join('');
        const html = renderTrackingEmail({
            previewText: 'Follow your pottery from the studio to collection day.',
            greeting: `Hi ${customer.firstName || 'there'},`,
            headline: 'Track Your Pottery Experience',
            bodyHtml,
            signOff: 'Warm regards,<br/>Team Bedia Pottery.',
        });
        await (0, mailService_1.sendEmail)((0, exports.resolveRecipient)(customer.email), 'Track Your Pottery Experience', `Track your pottery: ${trackingUrl}`, html, undefined, undefined, { fromName: mailService_1.POTTERY_MAIL_NAME });
    }
    catch (error) {
        console.error('TRACKING LINK MAIL FAILED:', error?.message);
    }
};
exports.sendTrackingLinkMail = sendTrackingLinkMail;
/* ---------------- 2. ready for painting (ceramic) ---------------- */
const PAINTING_WEEKDAY_SLOTS = '10:30&ndash;11:30 am / 12:00&ndash;1:00 pm / 1:00&ndash;2:00 pm / 3:00&ndash;4:00 pm / 4:00&ndash;5:00 pm / 5:00&ndash;6:00 pm / 6:00&ndash;7:00 pm / 7:00&ndash;8:00 pm / 7:30&ndash;8:30 pm';
const PAINTING_WEEKEND_SLOTS = '10:30&ndash;11:30 am / 12:00&ndash;1:00 pm / 4:00&ndash;5:00 pm / 5:00&ndash;6:00 pm / 6:00&ndash;7:00 pm / 7:00&ndash;8:00 pm / 7:30&ndash;8:30 pm';
/** Ceramic only — the piece is fired and the customer comes back to paint it. */
const sendPaintingReadyMail = async ({ booking }) => {
    try {
        const customer = booking?.customer;
        if (!customer?.email) {
            console.log('PAINTING MAIL SKIPPED — no customer email');
            return;
        }
        const itemCodes = booking?.tracking?.itemCodes || [];
        const bodyHtml = [
            paragraph('Your pottery has now been fired and is ready for painting &mdash; no additional payment is required!'),
            itemCodesBlock(itemCodes),
            paragraph('Following are the available options to schedule your painting session:', '0 30px 8px 30px'),
            paragraph('🗓️ <strong>Monday to Sunday</strong> (Duration: 1 hour)', '0 30px 10px 30px'),
            `
          <tr>
            <td class="px" style="padding:0 30px 14px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="note-box" style="background-color:#f4f2ea;border:1px solid #e5e7eb;border-radius:8px;">
                <tr>
                  <td style="padding:12px 14px;">
                    <p class="text-strong" style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#000000;">Weekday</p>
                    <p class="text-strong" style="margin:0 0 12px 0;font-size:13px;color:#000000;line-height:1.6;">${PAINTING_WEEKDAY_SLOTS}</p>
                    <p class="text-strong" style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#000000;">Weekend</p>
                    <p class="text-strong" style="margin:0;font-size:13px;color:#000000;line-height:1.6;">${PAINTING_WEEKEND_SLOTS}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`,
            paragraph('To schedule your painting session, please WhatsApp us with your preferred date and time from the available options.'),
            paragraph(`WhatsApp: <strong>${WHATSAPP_NUMBER}</strong>`, '0 30px 10px 30px'),
            buttonBlock(WHATSAPP_LINK, 'Book via WhatsApp'),
            paragraph('We will confirm your selected date and time once your booking has been received.'),
        ].join('');
        const html = renderTrackingEmail({
            previewText: 'Your ceramic piece is fired and ready for you to paint.',
            greeting: 'Hello dear!',
            headline: 'Your Pottery is Ready for Painting',
            bodyHtml,
            signOff: 'Warm Regards,<br/>Team Bedia Pottery',
        });
        await (0, mailService_1.sendEmail)((0, exports.resolveRecipient)(customer.email), 'Your Pottery is Ready for Painting', 'Your pottery has been fired and is ready for painting.', html, undefined, undefined, { fromName: mailService_1.POTTERY_MAIL_NAME });
    }
    catch (error) {
        console.error('PAINTING MAIL FAILED:', error?.message);
    }
};
exports.sendPaintingReadyMail = sendPaintingReadyMail;
/* ---------------- 3. taking a little longer ---------------- */
/**
 * Sent the moment the studio marks a piece delayed.
 *
 * Deliberately quiet about what comes next beyond the revised estimate: the
 * piece stops advancing on its own while it is delayed, and the customer hears
 * again through the ready-for-collection email once the repair is done.
 */
const sendDelayMail = async ({ booking, estimatedReadyFrom, estimatedReadyTo, trackingUrl, }) => {
    try {
        const customer = booking?.customer;
        if (!customer?.email) {
            console.log('DELAY MAIL SKIPPED — no customer email');
            return;
        }
        const tracking = booking?.tracking || {};
        const itemCodes = tracking.itemCodes || [];
        // The studio's own note, when they left one, in place of the standard copy.
        const reason = tracking.delayNote ||
            'We found a small crack in your piece, so we are giving it some extra care before firing. This may take a little longer than usual, but it helps ensure the best quality for your creation.';
        const updatedEstimate = estimatedReadyFrom && estimatedReadyTo
            ? `
          <tr>
            <td class="px" style="padding:0 30px 14px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="note-box" style="background-color:#f4f2ea;border:1px solid #e5e7eb;border-radius:8px;">
                <tr>
                  <td style="padding:12px 14px;">
                    <p class="text-muted" style="margin:0 0 4px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">
                      Updated Estimated Ready Date
                    </p>
                    <p class="text-strong" style="margin:0;font-size:16px;font-weight:700;color:#000000;">
                      ${(0, exports.formatMailDate)(estimatedReadyFrom)} &ndash; ${(0, exports.formatMailDate)(estimatedReadyTo)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
            : '';
        const bodyHtml = [
            paragraph(reason),
            itemCodesBlock(itemCodes),
            updatedEstimate,
            paragraph('Thank you for your patience!'),
            trackingUrl ? buttonBlock(trackingUrl, 'Track My Pottery') : '',
        ].join('');
        const html = renderTrackingEmail({
            previewText: 'Your piece needs a little extra care before firing.',
            greeting: `Hi ${customer.firstName || 'there'},`,
            headline: 'Taking a Little Longer',
            bodyHtml,
            signOff: 'Warm regards,<br/>Team Bedia Pottery.',
        });
        await (0, mailService_1.sendEmail)((0, exports.resolveRecipient)(customer.email), 'An Update on Your Pottery', 'Your piece needs a little extra care before firing.', html, undefined, undefined, { fromName: mailService_1.POTTERY_MAIL_NAME });
    }
    catch (error) {
        console.error('DELAY MAIL FAILED:', error?.message);
    }
};
exports.sendDelayMail = sendDelayMail;
/* ---------------- 4. ready for collection ---------------- */
const sendReadyForCollectionMail = async ({ booking, estimatedCollectionDate, }) => {
    try {
        const customer = booking?.customer;
        if (!customer?.email) {
            console.log('READY MAIL SKIPPED — no customer email');
            return;
        }
        const itemCodes = booking?.tracking?.itemCodes || [];
        const collectionLine = estimatedCollectionDate
            ? paragraph(`We would love to see you by <strong>${(0, exports.formatMailDate)(estimatedCollectionDate)}</strong>.`)
            : '';
        const bodyHtml = [
            itemCodesBlock(itemCodes),
            paragraph('Your incredible creation is ready for collection!'),
            paragraph('You may visit anytime between 10:30 AM and 9:30 PM, Monday to Sunday. Please share your item code at the reception when collecting your piece.'),
            paragraph('⚠️ <strong>Kindly notify us at least 1 hour before your arrival so we can have your item ready for pickup.</strong>'),
            collectionLine,
            buttonBlock(STUDIO_MAP_URL, 'Open in Google Maps'),
        ].join('');
        const html = renderTrackingEmail({
            previewText: 'Your pottery is ready — come and collect it.',
            greeting: 'Hello there!',
            headline: 'Ready for Collection',
            bodyHtml,
            signOff: 'Warm Regards,<br/>Team Bedia Pottery',
        });
        await (0, mailService_1.sendEmail)((0, exports.resolveRecipient)(customer.email), 'Your Pottery is Ready for Collection', 'Your creation is ready for collection at Bedia Pottery.', html, undefined, undefined, { fromName: mailService_1.POTTERY_MAIL_NAME });
    }
    catch (error) {
        console.error('READY FOR COLLECTION MAIL FAILED:', error?.message);
    }
};
exports.sendReadyForCollectionMail = sendReadyForCollectionMail;
/* ---------------- 5. final collection warning ---------------- */
/**
 * A week before the deadline. This is the last word before a piece is
 * discarded, so it names the exact date rather than a relative "next week".
 */
const sendCollectionWarningMail = async ({ booking, collectionDeadline, }) => {
    try {
        const customer = booking?.customer;
        if (!customer?.email) {
            console.log('COLLECTION WARNING MAIL SKIPPED — no customer email');
            return;
        }
        const deadline = (0, exports.formatMailDate)(collectionDeadline);
        const itemCodes = booking?.tracking?.itemCodes || [];
        const bodyHtml = [
            paragraph('Thank you for joining us for the pottery experience. We hope you enjoyed creating your piece with us.'),
            paragraph(`This is an important reminder that <strong>${deadline}</strong> is the final date to collect your pottery item.`),
            itemCodesBlock(itemCodes),
            paragraph('Please ensure your piece is collected by this date, as any items remaining after the final collection date will be respectfully discarded.'),
            paragraph('Thank you for your understanding, and we look forward to seeing you at the studio.'),
            buttonBlock(STUDIO_MAP_URL, 'Open in Google Maps'),
        ].join('');
        const html = renderTrackingEmail({
            previewText: `${deadline} is the final date to collect your pottery.`,
            greeting: `Hi ${customer.firstName || 'there'},`,
            headline: 'Important Notice – Final Collection Date',
            bodyHtml,
            signOff: 'Best regards,<br/>Team Bedia Pottery.',
        });
        await (0, mailService_1.sendEmail)((0, exports.resolveRecipient)(customer.email), 'Important Notice – Final Collection Date', `${deadline} is the final date to collect your pottery item.`, html, undefined, undefined, { fromName: mailService_1.POTTERY_MAIL_NAME });
    }
    catch (error) {
        console.error('COLLECTION WARNING MAIL FAILED:', error?.message);
    }
};
exports.sendCollectionWarningMail = sendCollectionWarningMail;
/** Re-exported so the tracking page and the emails cannot drift apart. */
exports.TRACKING_STATUS_COPY = potteryTracking_1.STATUS_COPY;
