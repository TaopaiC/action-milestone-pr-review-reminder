/**
 * Returns a new array with unique items from the input array.
 *
 * @param array - An array of items to filter for uniqueness.
 * @returns A new array containing only unique items from the input array.
 */
export function uniq<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}
