"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.POTTERY_MAIL_NAME = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../config/logger"));
const configKeys_1 = __importDefault(require("../configKeys"));
/**
 * Sender name for Bedia Pottery's own emails. Pottery and Prive bookings share
 * one Stripe webhook, so a pottery email can be sent from the Prive
 * deployment, whose MAIL_NAME reads "Bediaprive".
 */
exports.POTTERY_MAIL_NAME = process.env.POTTERY_MAIL_NAME || 'Bediapottery';
// export const sendEmail = async (
//   to: string,
//   subject: string,
//   text: string,
//   html?: string,
//   attachments?: Attachment[],
// ) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: configKeys.CLIENT_MAIL,
//       pass: configKeys.CLIENT_PASSWORD,
//     },
//     socketTimeout: 60000,
//   });
//   const mailOptions = {
//     from: `Bediapottery <${configKeys.CLIENT_MAIL}>`,
//     to,
//     subject,
//     text,
//     html,
//     attachments,
//     headers: {
//       'List-Unsubscribe': `<mailto:${configKeys.CLIENT_MAIL}?subject=unsubscribe>`,
//       'X-Priority': '3 (Normal)',
//       'X-Mailer': 'Nodemailer',
//     },
//   };
//   try {
//     const info = await transporter.sendMail(mailOptions);
//     logger.info(`Mail sent successfully to ${to}`);
//     return info;
//   } catch (error) {
//     logger.error('Error sending email:', error);
//     throw error;
//   }
// };
const sendEmail = async (to, subject, text, html, attachments, cc, options = {}) => {
    console.log('================ EMAIL START ================');
    console.log('TO:', to);
    console.log('SUBJECT:', subject);
    console.log('CLIENT_MAIL:', configKeys_1.default.CLIENT_MAIL);
    console.log('CLIENT_PASSWORD:', configKeys_1.default.CLIENT_PASSWORD ? 'CONFIGURED' : 'MISSING');
    /////////////// Use for Gmail
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: configKeys_1.default.CLIENT_MAIL,
            pass: configKeys_1.default.CLIENT_PASSWORD,
        },
        socketTimeout: 60000,
        logger: true,
        debug: true,
    });
    //Live one
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: Number(process.env.SMTP_PORT),
    //   secure: false, // 587 uses TLS
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASSWORD,
    //   },
    //   tls: {
    //     rejectUnauthorized: false,
    //   },
    //   socketTimeout: 60000,
    //   logger: true,
    //   debug: true,
    // });
    try {
        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('SMTP CONNECTION SUCCESSFUL');
        const mailOptions = {
            //   from: `Bediapottery <${configKeys.CLIENT_MAIL}>`,
            from: {
                name: options.fromName || process.env.MAIL_NAME,
                address: process.env.MAIL_FROM,
            },
            to,
            cc,
            subject,
            text,
            html,
            attachments,
            headers: {
                'List-Unsubscribe': `<mailto:${configKeys_1.default.CLIENT_MAIL}?subject=unsubscribe>`,
                'X-Priority': '3 (Normal)',
                'X-Mailer': 'Nodemailer',
            },
        };
        console.log('Sending email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('EMAIL SENT SUCCESSFULLY');
        console.log('MESSAGE ID:', info.messageId);
        console.log('ACCEPTED:', info.accepted);
        console.log('REJECTED:', info.rejected);
        console.log('RESPONSE:', info.response);
        /**
         * `accepted`/`rejected` are the part that says whether this recipient
         * actually got a message - a 250 response on its own does not.
         */
        logger_1.default.info(`Mail sent successfully to ${to}`, {
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
            envelopeFrom: info?.envelope?.from,
            response: info.response,
        });
        console.log('================ EMAIL END ================');
        return info;
    }
    catch (error) {
        console.error('================ EMAIL ERROR ================');
        console.error('TO:', to);
        console.error('SUBJECT:', subject);
        console.error('ERROR MESSAGE:', error?.message);
        console.error('ERROR CODE:', error?.code);
        console.error('ERROR COMMAND:', error?.command);
        console.error('FULL ERROR:', error);
        console.error('================ EMAIL ERROR END ================');
        /**
         * Handing the Error straight to winston's json format drops `code` and
         * `response`, which are the fields that say why the server refused it.
         */
        logger_1.default.error('Error sending email', {
            to,
            subject,
            errorMessage: error?.message,
            code: error?.code,
            command: error?.command,
            responseCode: error?.responseCode,
            smtpResponse: error?.response,
        });
        throw error;
    }
};
exports.sendEmail = sendEmail;
