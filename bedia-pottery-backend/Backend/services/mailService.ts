import nodemailer from 'nodemailer';
import logger from '../config/logger';
import configKeys from '../configKeys';

interface Attachment {
  filename: string;
  path: string;
}

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  attachments?: Attachment[],
) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: configKeys.CLIENT_MAIL,
      pass: configKeys.CLIENT_PASSWORD,
    },
    socketTimeout: 60000, // Set timeout to 60 seconds
  });

  const mailOptions = {
    from: `Three lions Group <${configKeys.CLIENT_MAIL}>,`,
    to: to,
    subject: subject,
    text: text,
    attachments: attachments,
    headers: {
      'List-Unsubscribe': `<mailto:${configKeys.CLIENT_MAIL}?subject=unsubscribe>`, // List-Unsubscribe Header
      'X-Priority': '3 (Normal)', // X-Priority Header
      'X-Mailer': 'Nodemailer', // X-Mailer Header
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Mail sent to client.');
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};
