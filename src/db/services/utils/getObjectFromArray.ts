interface AnyObject {
  [key: string]: unknown;
}

export default function getObjectFromArray(
  queryString: string,
  array: AnyObject[],
  queryField: string,
  dataName: string
) {
  const found = array.find((obj) => obj[queryField] === queryString);

  if (!found) {
    throw new Error(
      `${dataName} with ${queryField} ${queryString} not found! Check your data and try again!`
    );
  }

  return found;
}
