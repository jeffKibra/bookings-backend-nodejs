export default function generateRangeFilter(
  field: string,
  values: (string | number | Date)[]
) {
  if (values.length !== 2) {
    return null;
  }

  const min = +values[0];
  const max = +values[1];
  return {
    range: {
      path: field,
      gte: min,
      lte: max,
    },
  };
}
