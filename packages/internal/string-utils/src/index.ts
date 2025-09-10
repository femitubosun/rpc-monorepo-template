import { randomBytes, randomUUID } from 'node:crypto';
import cuid from 'cuid';

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

export function toPascalCase(str: string): string {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

export function truncate(
  str: string,
  length: number,
  suffix: string = '...'
): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

export function genereateRandomUuid() {
  return randomUUID();
}

export function generateCuid() {
  return cuid();
}

export function numberStringGenerator(input: {
  characterLength: number;
  outputOption?: {
    letters?: boolean;
    numeric?: boolean;
    special?: boolean;
    exclude?: Array<string>;
  };
  isCapitalized?: boolean;
}): string {
  const { characterLength, isCapitalized, outputOption } = input;

  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specials = '!@#$%^&*()_+-=[]{}|;:,.<>?/';

  let charset = '';
  if (outputOption?.letters ?? true) charset += letters;
  if (outputOption?.numeric ?? true) charset += numbers;
  if (outputOption?.special) charset += specials;

  if (!charset) {
    throw new Error('At least one character set must be enabled.');
  }

  if (outputOption?.exclude?.length) {
    charset = charset
      .split('')
      .filter((ch) => !outputOption.exclude!.includes(ch))
      .join('');
  }

  const bytes = randomBytes(characterLength);
  let result = '';
  for (let i = 0; i < characterLength; i++) {
    result += charset[bytes[i] % charset.length];
  }

  return isCapitalized ? result.toUpperCase() : result.toLowerCase();
}

export function pluralize(input: {
  modifierCount: number;
  plural: string;
  singular: string;
}) {
  const { modifierCount, plural, singular } = input;

  return modifierCount === 1 ? singular : plural;
}
