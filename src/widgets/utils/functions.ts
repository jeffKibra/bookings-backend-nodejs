export function sortStrings(
  a: string,
  b: string,
  direction: "asc" | "desc" = "asc"
) {
  if (direction === "desc") {
    if (b < a) {
      //b is less than a
      return -1;
    }
    if (b > a) {
      //b is greater than a
      return 1;
    }
    //b and a are equal
    return 0;
  } else {
    if (a < b) {
      //a is less than b
      return -1;
    }
    if (a > b) {
      //a is greater than b
      return 1;
    }
    //a and b are equal
    return 0;
  }
}

interface DirtyFields {
  [key: string]: boolean | DirtyFields;
}

type FormValue =
  | string
  | number
  | { [key: string]: string | number | FormValue }
  | [];

interface FormValues {
  [key: string]: FormValue;
}

export function getDirtyFields(
  dirtyFields: DirtyFields,
  formValues: FormValues
): FormValues {
  return Object.keys(dirtyFields).reduce((fields: FormValues, key) => {
    const formValue = formValues[key];

    return {
      ...fields,
      [key]: formValue,
    };
  }, {});
}
