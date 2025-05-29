import { capitalizeFirstLetter, truncateString } from '../stringUtils';

describe('String Utilities', () => {
  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
      expect(capitalizeFirstLetter('world')).toBe('World');
    });

    it('should return an empty string when given an empty string', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });

    it('should handle strings that are already capitalized', () => {
      expect(capitalizeFirstLetter('Hello')).toBe('Hello');
    });

    it('should handle single character strings', () => {
      expect(capitalizeFirstLetter('a')).toBe('A');
    });
  });

  describe('truncateString', () => {
    it('should truncate a string if it exceeds the maximum length', () => {
      expect(truncateString('Hello world', 5)).toBe('Hello...');
    });

    it('should not truncate a string if it is shorter than the maximum length', () => {
      expect(truncateString('Hello', 10)).toBe('Hello');
    });

    it('should return an empty string when given an empty string', () => {
      expect(truncateString('', 5)).toBe('');
    });

    it('should handle strings that are exactly the maximum length', () => {
      expect(truncateString('Hello', 5)).toBe('Hello');
    });
  });
});