// import { generateQueryStringFilter, generateRangeFilter } from '.';
import DynamicFieldPathAndValidValues, {
  IRangeFilterValues,
  IUserFilterValues,
  IUserFilters,
} from './DynamicFieldPathAndValidValues';

type IUserFilterValue = IUserFilterValues[0];

type IMatchQueryStringFilter =
  | IUserFilterValue
  | {
      $in: IUserFilterValue[];
    };

interface IMatchRangeFilter {
  $gte: number;
  $lte: number;
}

//
//
//

export default class DynamicMatchFilters extends DynamicFieldPathAndValidValues {
  filters: Record<string, IMatchQueryStringFilter | IMatchRangeFilter> = {};

  constructor(
    fieldsMap: DynamicMatchFilters['fieldsMap'],
    userFilters?: DynamicMatchFilters['userFilters']
  ) {
    super(fieldsMap, userFilters);
  }

  // generateDynamicFilters;

  generateFilters() {
    const { userFilters, fieldsMap } = this;

    console.log('generating userFilters', userFilters);

    if (userFilters && typeof userFilters === 'object') {
      const fields = Object.keys(fieldsMap);

      const { appendRangeFilter, appendQueryStringFilter } = this;

      fields.forEach(field => {
        // console.log({ field });
        this.appendValues(field, appendRangeFilter, appendQueryStringFilter);

        // if (Array.isArray(values) && values.length > 0) {
        //   this.appendFilter(field, values);
        // }
      });
    }

    return this.filters;
  }

  appendRangeFilter(fieldPath: string, values: IRangeFilterValues) {
    const { formatRangeFilter } = DynamicMatchFilters;

    this.appendMatchFilter(formatRangeFilter, fieldPath, values);
  }

  appendQueryStringFilter(fieldPath: string, values: IUserFilterValues) {
    //append to match filters
    const { formatQueryStringFilter } = DynamicMatchFilters;

    this.appendMatchFilter(formatQueryStringFilter, fieldPath, values);
  }

  appendMatchFilter<
    T extends (
      values: any
    ) => IMatchRangeFilter | IMatchQueryStringFilter | null
  >(formatValuesCB: T, fieldPath: string, values: Parameters<T>[0]) {
    const filter = formatValuesCB(values);

    if (filter) {
      this.filters[fieldPath] = filter;
    } else {
      console.warn('Invalid formatted match filter' + JSON.stringify(filter));
    }
  }

  //-------------------------------------------------------------------------
  //static methods
  //-------------------------------------------------------------------------

  static formatQueryStringFilter(
    values: IUserFilterValues
  ): IMatchQueryStringFilter {
    return values.length === 1 ? values[0] : { $in: [...values] };
  }
  //--------------------------------------------------------------------

  static formatRangeFilter(
    values: IRangeFilterValues
  ): IMatchRangeFilter | null {
    if (!Array.isArray(values) || values.length !== 2) {
      return null;
    }

    const min = +values[0];
    const max = +values[1];

    return { $gte: min, $lte: max };
  }

  //--------------------------------------------------------------------
}
