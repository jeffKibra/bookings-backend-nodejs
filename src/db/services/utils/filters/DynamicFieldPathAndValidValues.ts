export type IUserFilterValues = (string | number | Date)[];
export type IUserFilters = Record<string, IUserFilterValues>;

export interface IDynamicFilter {
  path: string;
  type: 'range' | 'normal';
}
export type IDynamicFiltersFieldsMap = Record<string, IDynamicFilter>;

export type IFilterCB = (fieldPath: string, values: IUserFilterValues) => void;

export type IRangeFilterValues = [number, number];
export type IRangeFilterCB = (
  fieldPath: string,
  values: IRangeFilterValues
) => void;

//
//
//

export default class DynamicFieldPathAndValidValues {
  //
  fieldsMap: IDynamicFiltersFieldsMap;
  userFilters?: IUserFilters;
  //

  constructor(
    fieldsMap: DynamicFieldPathAndValidValues['fieldsMap'],
    userFilters?: DynamicFieldPathAndValidValues['userFilters']
  ) {
    console.log('userFilters', userFilters);

    this.fieldsMap = fieldsMap;
    this.userFilters = userFilters;
  }

  getFieldPath(field: string) {
    const { fieldsMap } = this;

    return fieldsMap[field].path;
  }

  //-------------------------------------------------------------------------

  appendValues(
    field: string,
    rangeFilterCB: IRangeFilterCB,
    normalFilterCB: IFilterCB
  ) {
    const { userFilters, fieldsMap } = this;

    console.log('fieldsMap', fieldsMap);
    console.log({ field });

    const fieldMap = fieldsMap[field];
    const fieldMapIsValid =
      typeof fieldMap === 'object' && fieldMap.path && fieldMap.type;
    console.log({ fieldMap, fieldMapIsValid, userFilters });

    if (userFilters && fieldMapIsValid) {
      const fieldPath = fieldMap.path;
      const fieldType = fieldMap.type;

      const values = userFilters[field];

      const { generateRange, generateValidFilterValues } =
        DynamicFieldPathAndValidValues;

      if (fieldType === 'range') {
        this.append(rangeFilterCB, fieldPath, generateRange(values));
      } else {
        this.append(
          normalFilterCB,
          fieldPath,
          generateValidFilterValues(values)
        );
      }
    }
  }

  append<T extends (...args: any[]) => void>(
    cb: T,
    fieldPath: Parameters<T>[0],
    values: Parameters<T>[1] | null
  ) {
    if (fieldPath && values) {
      cb(fieldPath, values);
    } else {
      console.info(
        `Invalid filter values - ${fieldPath}:${JSON.stringify(values)}`
      );
    }
  }

  //-------------------------------------------------------------------------

  //-------------------------------------------------------------------------
  //static methods
  //-------------------------------------------------------------------------
  static generateValidFilterValues(values: IUserFilterValues) {
    let validatedValues: IUserFilterValues | null = null;

    try {
      this.validateFilterValues(values);

      validatedValues = values;
    } catch (error) {
      console.warn(error);
    }

    return validatedValues;
  }

  //--------------------------------------------------------------------

  static generateRange(values: IUserFilterValues) {
    let validatedRange: Parameters<IRangeFilterCB>[1] | null = null;

    try {
      this.validateFilterValues(values);

      const min = +values[0];
      const max = +values[1];

      if (values.length === 2 && min <= max) {
        validatedRange = [min, max];
      } else {
        throw new Error('Invalid Range' + JSON.stringify(values));
      }
    } catch (error) {
      console.warn(error);
    }

    return validatedRange;
  }

  static checkFilterValuesValidity(values: IUserFilterValues) {
    const isValid = Array.isArray(values) && values.length > 0;
    console.log({ isValid, values });

    return isValid;
  }

  //-------------------------------------------------------------------------

  static validateFilterValues(values: IUserFilterValues) {
    const isValid = this.checkFilterValuesValidity(values);
    console.log({ isValid, values });

    if (!isValid) {
      throw new Error('Invalid filter values: ' + JSON.stringify(values));
    }
  }

  //--------------------------------------------------------------------
}
