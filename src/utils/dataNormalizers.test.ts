import {
  cleanText,
  parseDate,
  normalizeName,
} from './dataNormalizers';

describe('Data Normalizers', () => {
  describe('cleanText', () => {
    it('should trim leading and trailing whitespace', () => {
      expect(cleanText('  hello world  ')).toBe('hello world');
    });

    it('should remove non-breaking spaces', () => {
      expect(cleanText('hello\u00a0world')).toBe('hello world');
    });

    it('should return an empty string for null or undefined input', () => {
      expect(cleanText(null)).toBe('');
      expect(cleanText(undefined)).toBe('');
    });

    it('should handle empty strings', () => {
      expect(cleanText('')).toBe('');
    });
  });

  describe('parseDate', () => {
    it('should parse a valid date string', () => {
      const date = parseDate('15 January 2026');
      expect(date).toEqual(new Date('2026-01-15T00:00:00.000Z'));
    });

    it('should return null for an invalid date string', () => {
      expect(parseDate('not a date')).toBeNull();
    });

    it('should return null for an empty string', () => {
      expect(parseDate('')).toBeNull();
    });
  });

  describe('normalizeName', () => {
    it('should normalize a name to title case', () => {
      expect(normalizeName('jules verne')).toBe('Jules Verne');
    });

    it('should handle uppercase and mixed-case names', () => {
      expect(normalizeName('JULES VERNE')).toBe('Jules Verne');
      expect(normalizeName('jULeS vErNe')).toBe('Jules Verne');
    });

    it('should trim whitespace from the name', () => {
      expect(normalizeName('  jules verne  ')).toBe('Jules Verne');
    });

    it('should return an empty string for an empty input', () => {
      expect(normalizeName('')).toBe('');
    });
  });
});
