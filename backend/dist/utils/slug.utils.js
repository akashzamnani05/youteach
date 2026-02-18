"use strict";
// src/utils/slug.utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomSuffix = exports.generateUniqueSlug = exports.generateSlug = void 0;
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
        .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};
exports.generateSlug = generateSlug;
const generateUniqueSlug = (baseName, existingSlugs) => {
    let slug = (0, exports.generateSlug)(baseName);
    let counter = 1;
    while (existingSlugs.includes(slug)) {
        slug = `${(0, exports.generateSlug)(baseName)}-${counter}`;
        counter++;
    }
    return slug;
};
exports.generateUniqueSlug = generateUniqueSlug;
// Generate random slug suffix if needed
const generateRandomSuffix = (length = 6) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.generateRandomSuffix = generateRandomSuffix;
//# sourceMappingURL=slug.utils.js.map