/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns a colon-separated string: iv:authTag:ciphertext (all hex encoded).
 */
export declare function encrypt(plainText: string): string;
/**
 * Decrypts a string produced by encrypt().
 */
export declare function decrypt(encryptedText: string): string;
//# sourceMappingURL=encryption.utils.d.ts.map