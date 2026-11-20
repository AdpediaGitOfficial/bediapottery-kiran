"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetMail = exports.buildPasswordResetMail = void 0;
const mailService_1 = require("./mailService");
const logger_1 = __importDefault(require("../config/logger"));
const configKeys_1 = __importDefault(require("../configKeys"));
/**
 * Split from the sender so the rendered output can be inspected without
 * dispatching a live email.
 */
const buildPasswordResetMail = ({ to, name, resetLink, variant = 'customer', }) => {
    const logoUrl = `${process.env.BASE_URL}/uploads/logo/logo.png`;
    const logoIconUrl = `${process.env.BASE_URL}/uploads/logo/bediaprive_logo_icon.svg?v=4`;
    const instagramIcon = `${process.env.BASE_URL}/uploads/logo/instagram.svg?v=5`;
    const tiktokIcon = `${process.env.BASE_URL}/uploads/logo/tiktok.svg?v=5`;
    const youtubeIcon = `${process.env.BASE_URL}/uploads/logo/youtube.svg?v=5`;
    const logoIconDarkUrl = `${process.env.BASE_URL}/uploads/logo/bediaprive-logo-icon-dark.png?v=2`;
    const instagramIconDark = `${process.env.BASE_URL}/uploads/logo/instagram-dark.svg?v=2`;
    const tiktokIconDark = `${process.env.BASE_URL}/uploads/logo/tiktok-dark.svg?v=2`;
    const youtubeIconDark = `${process.env.BASE_URL}/uploads/logo/youtube-dark.svg?v=3`;
    const logoDarkUrl = `${process.env.BASE_URL}/uploads/logo/bediaprive-logo-dark.svg?v=6`;
    const greetingName = name && name.trim() !== '' ? name : 'there';
    const isDashboard = variant === 'dashboard';
    const accountLabel = isDashboard ? 'dashboard password' : 'password';
    const subject = isDashboard
        ? 'Reset your Bedia Pottery dashboard password'
        : 'Reset your Bedia Pottery password';
    const text = `Hi ${greetingName},

We received a request to reset your ${accountLabel}. Open the link below to choose a new one.

${resetLink}

This link expires in 15 minutes and can only be used once.

If you didn't request this, you can ignore this email - your password stays unchanged.

Bedia Pottery LLC, Warehouse 10, Al Khayat Avenue, 19th Street, Al Quoz 1, Dubai, UAE`;
    const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Reset your password</title>
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
      .body-text { font-size: 14px !important; }
      .logo-icon { height: 38px !important; }
      /* Full-width tap target - a 22px-padded inline button is easy to miss on a phone. */
      .btn { display: block !important; width: 100% !important; text-align: center !important; padding-left: 0 !important; padding-right: 0 !important; }
      .link-fallback { font-size: 12px !important; }
    }

    @media (prefers-color-scheme: dark) {
      body, .email-bg { background-color: #0b0f0d !important; }
      .main-card { background-color: #11201c !important; }
      .text-strong { color: #f4f5f3 !important; }
      .text-muted { color: #a8b3ad !important; }
      .hr { border-top-color: #2c3a35 !important; }
      .footer-badge { background-color: transparent !important; border: 0 !important; }
      .btn-cell a { background: #f4f5f3 !important; color: #11201c !important; }
      .link-fallback a { color: #8ab4a4 !important; }
      .light-img { display: none !important; }
      .dark-img { display: block !important; max-height: none !important; overflow: visible !important; line-height: inherit !important; font-size: inherit !important; }
      .dark-img img { filter: none !important; -webkit-filter: none !important; forced-color-adjust: none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#fbfaf5;">
    Reset your Bedia Pottery ${accountLabel} - this link expires in 15 minutes.
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
              Hi ${greetingName},
            </td>
          </tr>

          <!-- Headline -->
          <tr>
            <td class="px" style="padding:0 30px 12px 30px;">
              <h1 class="title text-strong" style="color:#000000;margin:0;font-size:22px;font-weight:600;letter-spacing:-0.4px;line-height:1.2;">
                Reset your ${accountLabel}
              </h1>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td class="px body-text text-strong" style="padding:0 30px 16px 30px;font-size:15px;line-height:1.5;color:#000000;">
              We received a request to reset your ${accountLabel}. Choose a new one using the button below.
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td class="px btn-cell" style="padding:0 30px 16px 30px;">
              <a href="${resetLink}" class="btn"
                style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:0.3px;">
                Reset Password
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 0 6px 0;">
              <div class="hr" style="border-top:1px solid #e5e7eb;font-size:1px;line-height:1px;height:1px;">&nbsp;</div>
            </td>
          </tr>

          <!-- Expiry + fallback link -->
          <tr>
            <td class="px body-text text-strong" style="padding:8px 30px 4px 30px;font-size:14px;line-height:1.5;color:#000000;">
              This link expires in <strong style="font-weight:700;">15 minutes</strong> and can only be used once.
            </td>
          </tr>
          <tr>
            <td class="px link-fallback text-muted" style="padding:0 30px 14px 30px;font-size:13px;line-height:1.5;color:#6b7280;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${resetLink}" style="color:#0d463d;text-decoration:underline;word-break:break-all;">${resetLink}</a>
            </td>
          </tr>

          <!-- Reassurance -->
          <tr>
            <td class="px link-fallback text-muted" style="padding:0 30px 14px 30px;font-size:13px;line-height:1.5;color:#6b7280;">
              If you didn't request this, you can safely ignore this email &mdash; your password stays unchanged.
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
    return { to, subject, text, html };
};
exports.buildPasswordResetMail = buildPasswordResetMail;
const sendPasswordResetMail = async (input) => {
    const { to, subject, text, html } = (0, exports.buildPasswordResetMail)(input);
    /**
     * Every line here is tagged so one attempt can be pulled out of a mixed log
     * with `pm2 logs --lines 500 | grep password-reset`. The reset token is
     * deliberately never logged - it is a live credential until it is spent.
     */
    logger_1.default.info('[password-reset] sending mail', {
        to,
        variant: input.variant ?? 'customer',
        subject,
        /**
         * Logged together because a mismatch between them is what makes Gmail
         * rewrite the From header and hurts inbox placement.
         */
        smtpAuthUser: configKeys_1.default.CLIENT_MAIL,
        fromHeader: process.env.MAIL_FROM,
    });
    try {
        const info = (await (0, mailService_1.sendEmail)(to, subject, text, html));
        logger_1.default.info('[password-reset] smtp server accepted the message', {
            to,
            messageId: info?.messageId,
            accepted: info?.accepted,
            rejected: info?.rejected,
            envelopeFrom: info?.envelope?.from,
            envelopeTo: info?.envelope?.to,
            response: info?.response,
        });
        /**
         * A 250 on the transaction with the address in `rejected` still means that
         * recipient got nothing, so it is called out rather than left to be
         * spotted inside the success line.
         */
        if (info?.rejected?.length) {
            logger_1.default.error('[password-reset] recipient was rejected by the smtp server', {
                to,
                rejected: info.rejected,
                response: info?.response,
            });
        }
        return info;
    }
    catch (error) {
        logger_1.default.error('[password-reset] mail send failed', {
            to,
            errorMessage: error?.message,
            code: error?.code,
            command: error?.command,
            responseCode: error?.responseCode,
            smtpResponse: error?.response,
        });
        throw error;
    }
};
exports.sendPasswordResetMail = sendPasswordResetMail;
