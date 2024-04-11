import DynamicFieldPathAndValidValues, {
  IRangeFilterValues,
  IUserFilterValues,
  IUserFilters,
} from './DynamicFieldPathAndValidValues';
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

export default class DynamicSearchFilters extends DynamicFieldPathAndValidValues {
  filters: (IRangeFilter | IQueryStringFilter)[] = [];
  query: string | number;

  constructor(
    query: DynamicSearchFilters['query'],
    fieldsMap: DynamicSearchFilters['fieldsMap'],
    userFilters?: DynamicSearchFilters['userFilters']
  ) {
    console.log('dsfc', { userFilters });
    super(fieldsMap, userFilters);
    //
    this.query = query;
  }

  generateFilters() {
    const { userFilters } = this;

    if (userFilters && typeof userFilters === 'object') {
      console.log('user filters valid');

      const { fieldsMap } = this;

      const fields = Object.keys(fieldsMap);
      console.log({ fields });

      const { appendRangeFilter, appendQueryStringFilter } = this;

      fields.forEach(field => {
        // const values = userFilters[field];
        // this.appendFilter(field, values);

        this.appendValues(field, appendRangeFilter, appendQueryStringFilter);
      });
    }

    return this.filters;
  }

  // appendFilter(field: string, values: IUserFilterValues) {
  //   const { fieldsMap } = this;

  //   const { appendRangeFilter, appendQueryStringFilter } = this;
  //   this.appendValues(field, appendRangeFilter, appendQueryStringFilter);
  // }

  appendRangeFilter(fieldPath: string, values: IRangeFilterValues) {
    const { formatRangeFilter } = DynamicSearchFilters;

    //append to search filters
    this.appendSearchFilter(formatRangeFilter, fieldPath, values);
  }

  appendQueryStringFilter(fieldPath: string, values: IUserFilterValues) {
    const { formatQueryStringFilter } = DynamicSearchFilters;

    this.appendSearchFilter(formatQueryStringFilter, fieldPath, values);
  }

  // appendSearchFilter(filter: IRangeFilter | IQueryStringFilter | null) {
  //   if (filter) {
  //     return this.filters.push(filter);
  //   } else {
  //     console.info('Invalid filter to append', filter);
  //   }
  // }

  appendSearchFilter<
    T extends (
      fieldPath: string,
      values: any
    ) => IRangeFilter | IQueryStringFilter | null
  >(formatValuesCB: T, fieldPath: Parameters<T>[0], values: Parameters<T>[1]) {
    const filter = formatValuesCB(fieldPath, values);

    if (filter) {
      this.filters.push(filter);
    } else {
      console.warn('Invalid formatted search filter' + JSON.stringify(filter));
    }
  }

  //-------------------------------------------------------------------------
  //static methods
  //-------------------------------------------------------------------------

  static formatQueryStringFilter(fieldPath: string, values: IUserFilterValues) {
    try {
      DynamicSearchFilters.validateFilterValues(values);

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
      console.warn('Eror formatting String Filter', error);

      return null;
    }
  }
  //--------------------------------------------------------------------

  static formatRangeFilter(fieldPath: string, values: IRangeFilterValues) {
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
