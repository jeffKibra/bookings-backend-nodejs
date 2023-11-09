export default function generateQueryStringFilter(
  field: string,
  values: (string | number | Date)[]
) {
  let queryString = '';

  values.forEach((value, index) => {
    const subString = String(value);

    if (index === 0) {
      queryString = subString;
    } else {
      queryString = `${queryString} OR ${subString}`;
    }
  });

  return {
    queryString: {
      defaultPath: field,
      query: queryString,
    },
  };
}
