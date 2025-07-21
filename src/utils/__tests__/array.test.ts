/**
 * Unit tests for array utility functions, src/utils/array.ts
 */
import { jest } from '@jest/globals'

// The module being tested should be imported dynamically
const { uniq } = await import('../array.js')

describe('array.ts', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('uniq', () => {
    it('removes duplicate strings from array', () => {
      const input = ['apple', 'banana', 'apple', 'cherry', 'banana']
      const expected = ['apple', 'banana', 'cherry']

      const result = uniq(input)

      expect(result).toEqual(expected)
    })

    it('handles empty array', () => {
      const input: string[] = []
      const expected: string[] = []

      const result = uniq(input)

      expect(result).toEqual(expected)
    })

    it('handles array with no duplicates', () => {
      const input = ['apple', 'banana', 'cherry']
      const expected = ['apple', 'banana', 'cherry']

      const result = uniq(input)

      expect(result).toEqual(expected)
    })

    it('handles array with undefined values', () => {
      const input = ['apple', undefined, 'banana', undefined, 'apple']
      const expected = ['apple', undefined, 'banana']

      const result = uniq(input)

      expect(result).toEqual(expected)
    })

    it('handles array with only undefined values', () => {
      const input = [undefined, undefined, undefined]
      const expected = [undefined]

      const result = uniq(input)

      expect(result).toEqual(expected)
    })

    it('handles array with empty strings', () => {
      const input = ['', 'apple', '', 'banana', '']
      const expected = ['', 'apple', 'banana']

      const result = uniq(input)

      expect(result).toEqual(expected)
    })

    it('handles array with single element', () => {
      const input = ['apple']
      const expected = ['apple']

      const result = uniq(input)

      expect(result).toEqual(expected)
    })

    it('handles array with all duplicate elements', () => {
      const input = ['apple', 'apple', 'apple']
      const expected = ['apple']

      const result = uniq(input)

      expect(result).toEqual(expected)
    })
  })
})
