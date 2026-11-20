"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessPropertyFinderToken = getAccessPropertyFinderToken;
const axios_1 = __importDefault(require("axios"));
let cachedToken = null;
// let tokenExpiry: number | null = null;
async function getAccessPropertyFinderToken() {
    // ✅ Reuse token if not expired
    // if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    //   return cachedToken;
    // }
    try {
        const response = await axios_1.default.post('https://atlas.propertyfinder.com/v1/auth/token', {
            apiKey: 'RsZxI.npYFBvFS8x3kEQOYoNEWj4AsdFY5SyHpxH',
            apiSecret: 'pqpZMAPZmXhQvEZNJ7J3eSViHEqMLVKk',
        });
        cachedToken = response.data.accessToken;
        // const expiresIn = response.data.expires_in || 3600;
        // tokenExpiry = Date.now() + expiresIn * 1000 - 60000;
        return cachedToken || '';
    }
    catch (error) {
        console.error('Error fetching token:', error.response?.data || error.message);
        throw new Error('Unable to authenticate with PropertyFinder API');
    }
}
