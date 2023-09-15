export default function removeEmptySpacesFromString(sourceString: string) {
  return String(sourceString)
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(val => val !== ' ')
    .join('');
}
