import { describe, it, expect } from 'vitest';

describe('Example Test Suite', () => {
    it('should return true for a valid condition', () => {
        expect(1 + 1).toBe(2);
    });

    it('should return false for an invalid condition', () => {
        expect(1 + 1).not.toBe(3);
    });
});