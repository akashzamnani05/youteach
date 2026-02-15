// src/utils/slug.utils.ts

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const generateUniqueSlug = (
  baseName: string,
  existingSlugs: string[]
): string => {
  let slug = generateSlug(baseName);
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${generateSlug(baseName)}-${counter}`;
    counter++;
  }

  return slug;
};

// Generate random slug suffix if needed
export const generateRandomSuffix = (length: number = 6): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};