"use strict";
// src/config/youtube.config.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateYoutubeConfig = exports.youtubeConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.youtubeConfig = {
    clientId: process.env.YOUTUBE_CLIENT_ID || '',
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || '',
    scopes: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/userinfo.email',
    ],
};
const validateYoutubeConfig = () => {
    const required = ['clientId', 'clientSecret'];
    const missing = required.filter(key => !exports.youtubeConfig[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required YouTube configuration: ${missing.join(', ')}. ` +
            `Please set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in .env`);
    }
};
exports.validateYoutubeConfig = validateYoutubeConfig;
//# sourceMappingURL=youtube.config.js.map