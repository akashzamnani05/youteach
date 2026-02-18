"use strict";
// src/utils/encryption.utils.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto_1 = __importDefault(require("crypto"));
const ALGORITHM = 'aes-256-gcm';
const KEY_HEX = process.env.ENCRYPTION_KEY || '';
function getKey() {
    if (!KEY_HEX || KEY_HEX.length !== 64) {
        throw new Error('ENCRYPTION_KEY must be set in .env as a 64-char hex string (32 bytes). ' +
            'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    }
    return Buffer.from(KEY_HEX, 'hex');
}
/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns a colon-separated string: iv:authTag:ciphertext (all hex encoded).
 */
function encrypt(plainText) {
    const key = getKey();
    const iv = crypto_1.default.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}
/**
 * Decrypts a string produced by encrypt().
 */
function decrypt(encryptedText) {
    const key = getKey();
    const [ivHex, authTagHex, cipherHex] = encryptedText.split(':');
    if (!ivHex || !authTagHex || !cipherHex) {
        throw new Error('Invalid encrypted text format');
    }
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const cipherText = Buffer.from(cipherHex, 'hex');
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(cipherText), decipher.final()]).toString('utf8');
}
//# sourceMappingURL=encryption.utils.js.map