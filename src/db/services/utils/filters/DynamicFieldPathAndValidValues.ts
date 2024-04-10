export type IUserFiltersValues = (string | number | Date)[];
export type IUserFilters = Record<string, IUserFiltersValues>;

export interface IDynamicFilter {
  path: string;
  type: 'range' | 'normal';
}
export type IDynamicFiltersFieldsMap = Record<string, IDynamicFilter>;

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
    this.fieldsMap = fieldsMap;
    this.userFilters = userFilters;
  }

  getFieldPath(field: string) {
    const { fieldsMap } = this;

    return fieldsMap[field].path;
  }

  //-------------------------------------------------------------------------

  get(field: string) {
    const { userFilters, fieldsMap } = this;

    const fieldMap = fieldsMap[field];
    const fieldMapIsValid =
      typeof fieldMap === 'object' && fieldMap.path && fieldMap.type;

    // { path, type }

    let fieldPath = '';
    let fieldValues = null;

    if (userFilters && fieldMapIsValid) {
      fieldPath = fieldMap.path;
      //
      const fieldType = fieldMap.type;

      const values = userFilters[field];

      const { generateRange, generateValidFilterValues } =
        DynamicFieldPathAndValidValues;

      if (fieldType === 'range') {
        fieldValues = generateRange(values);
      } else {
        fieldValues = generateValidFilterValues(values);
      }
    }

    /**
     * Incase the field was invalid and thus lacks a valid fieldPath
     * set fieldValues to null
     */
    if (!fieldPath) {
      fieldValues = null;
    }

    return {
      fieldPath,
      values: fieldValues,
    };
  }

  //-------------------------------------------------------------------------

  //-------------------------------------------------------------------------
  //static methods
  //-------------------------------------------------------------------------
  static generateValidFilterValues(values: IUserFiltersValues) {
    let validatedValues: IUserFiltersValues | null = null;

    try {
      this.validateFilterValues(values);

      validatedValues = values;
    } catch (error) {
      console.warn(error);
    }

    return validatedValues;
  }

  //--------------------------------------------------------------------

  static generateRange(values: IUserFiltersValues) {
    let validatedRange: [number, number] | null = null;

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

  static checkFilterValuesValidity(values: IUserFiltersValues) {
    const isValid = Array.isArray(values) && values.length > 0;
    console.log({ isValid, values });

    return isValid;
  }

  //-------------------------------------------------------------------------

  static validateFilterValues(values: IUserFiltersValues) {
    const isValid = this.checkFilterValuesValidity(values);
    console.log({ isValid, values });

    if (!isValid) {
      throw new Error('Invalid filter values: ' + JSON.stringify(values));
    }
  }

  //--------------------------------------------------------------------
}
