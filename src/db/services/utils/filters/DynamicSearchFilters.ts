import DynamicFieldPathAndValidValues, {
  IRangeFilterValues,
  IUserFilterValues,
  IUserFilters,
} from './DynamicFieldPathAndValidValues';
import DynamicFilters from './DynamicFilters';
//

interface IRangeFilter {
  range: {
    path: string;
    gte: number;
    lte: number;
  };
}
interface IQueryStringFilter {
  queryString: {
    defaultPath: string;
    query: string;
  };
}

export default class DynamicSearchFilters {
  filters: (IRangeFilter | IQueryStringFilter)[] = [];
  query: string | number;

  //
  fieldsMap: DynamicFieldPathAndValidValues['fieldsMap'];
  userFilters?: DynamicFieldPathAndValidValues['userFilters'];
  //

  constructor(
    query: DynamicSearchFilters['query'],
    fieldsMap: DynamicSearchFilters['fieldsMap'],
    userFilters?: DynamicSearchFilters['userFilters']
  ) {
    // console.log('dsfc', { userFilters });
    // super(fieldsMap, userFilters);
    //
    this.query = query;
    //
    this.fieldsMap = fieldsMap;
    this.userFilters = userFilters;
  }

  generateFilters() {
    const { fieldsMap, userFilters } = this;
    const { formatRangeFilter, formatQueryStringFilter } = DynamicSearchFilters;

    const filters = new DynamicFilters(
      formatRangeFilter,
      formatQueryStringFilter,
      fieldsMap,
      userFilters
    ).generateFilters();

    const filtersArray = Object.values(filters).filter(filter => filter);

    return filtersArray;
  }

  //-------------------------------------------------------------------------
  //static methods
  //-------------------------------------------------------------------------

  static formatQueryStringFilter(values: IUserFilterValues, fieldPath: string) {
    try {
      // console.log({ fieldPath, values });
      DynamicFieldPathAndValidValues.validateFilterValues(values);

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
          defaultPath: fieldPath,
          query: queryString,
        },
      };
    } catch (error) {
      console.warn('Error formatting String Filter', error);

      return null;
    }
  }
  //--------------------------------------------------------------------

  static formatRangeFilter(values: IRangeFilterValues, fieldPath: string) {
    if (!Array.isArray(values) || values.length !== 2) {
      return null;
    }

    const min = +values[0];
    const max = +values[1];

    return {
      range: {
        path: fieldPath,
        gte: min,
        lte: max,
      },
    };
  }

  //--------------------------------------------------------------------
}
