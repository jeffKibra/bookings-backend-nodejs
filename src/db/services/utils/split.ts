export function splitBigArray<T>(array: T[], maxEntries = 500): T[][] {
  /**
   * split arrays with over the given entries (500)
   * mainly for firestore batch writes
   * returns arrays in an array
   */
  /**
   * stopping condition
   * 1: if value is not a valid array
   * 2. if array is empty
   */
  if (!Array.isArray(array) || array.length === 0) {
    return []; //accumulator
  }

  const firstHalf = array.splice(0, maxEntries);
  //call split recursively
  const accumulator = splitBigArray<T>(array, maxEntries);

  return [firstHalf, ...accumulator];
}
