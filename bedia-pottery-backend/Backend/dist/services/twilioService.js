"use strict";
/*
import twilio from 'twilio';
import configKeys from '../configKeys';

const client = twilio(configKeys.TWILIO_ACCOUNT_SID, configKeys.TWILIO_AUTH_TOKEN);

export const sendOtp = async (to: number, otp: string): Promise<void> => {
  await client.messages.create({
    body: `${otp} is your verification code for Etern Learning. This code will expire in 10 minutes.`,
    from: configKeys.TWILIO_PHONE_NUMBER,
    to: `+91${to}`,
  });
};
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtp = void 0;
const axios_1 = __importDefault(require("axios"));
const sendOtp = async (to, otp) => {
    try {
        const response = await axios_1.default.get('https://www.sapteleservices.com/SMS_API/sendsms.php', {
            params: {
                apikey: process.env.SAP_API_KEY,
                sendername: process.env.SAP_SENDER_NAME,
                tid: '1707174678706116453',
                mobile: `${to}`,
                routetype: 1,
                message: `Your Verification code for Etern learning is ${otp}. This code expires in 10 minutes. ETERN LEARNING`,
            },
        });
        console.log('Status Code:', response.status);
    }
    catch (error) {
        console.error('Failed to send SMS via SAP TeleServices:', error);
        throw new Error('SMS sending failed');
    }
};
exports.sendOtp = sendOtp;
