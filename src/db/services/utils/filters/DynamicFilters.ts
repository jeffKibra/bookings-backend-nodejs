// import { generateQueryStringFilter, generateRangeFilter } from '.';
import DynamicFieldPathAndValidValues, {
  IRangeFilterValues,
  IUserFilterValues,
  // IUserFilters,
} from './DynamicFieldPathAndValidValues';

// type IUserFilterValue = IUserFilterValues[0];

// type IMatchQueryStringFilter =
//   | IUserFilterValue
//   | {
//       $in: IUserFilterValue[];
//     };

// interface IMatchRangeFilter {
//   $gte: number;
//   $lte: number;
// }

//
//
//

export default class DynamicFilters<
  TRangeFilter,
  TQueryStringFilter
> extends DynamicFieldPathAndValidValues {
  filters: Record<string, TRangeFilter | TQueryStringFilter> = {};

  // filters: Record<string, IMatchQueryStringFilter | IMatchRangeFilter> = {};
  //
  // formatRangeFilter: (values: IRangeFilterValues) => TRangeFilter;
  formatRangeFilter: (...args: any[]) => TRangeFilter;
  formatQueryStringFilter: (...args: any[]) => TQueryStringFilter;

  constructor(
    formatRangeFilter: DynamicFilters<
      TRangeFilter,
      TQueryStringFilter
    >['formatRangeFilter'],
    formatQueryStringFilter: DynamicFilters<
      TRangeFilter,
      TQueryStringFilter
    >['formatQueryStringFilter'],
    fieldsMap: DynamicFilters<TRangeFilter, TQueryStringFilter>['fieldsMap'],
    userFilters?: DynamicFilters<
      TRangeFilter,
      TQueryStringFilter
    >['userFilters']
  ) {
    super(fieldsMap, userFilters);
    //

    this.formatRangeFilter = formatRangeFilter;
    this.formatQueryStringFilter = formatQueryStringFilter;

    /**
     *  bind this to functions that are passed as callbacks
     *  to avoid losing the this context
     */
    this.appendRangeFilter = this.appendRangeFilter.bind(this);
    this.appendQueryStringFilter = this.appendQueryStringFilter.bind(this);
  }

  //--------------------------------------------------------------------

  generateFilters() {
    const { userFilters, fieldsMap } = this;

    // console.log('generating userFilters', userFilters);

    if (userFilters && typeof userFilters === 'object') {
      const fields = Object.keys(fieldsMap);

      const { appendRangeFilter, appendQueryStringFilter } = this;

      fields.forEach(field => {
        const values = userFilters[field];

        // console.log({ field });

        if (Array.isArray(values) && values.length > 0) {
          // this.appendFilter(field, values);
          this.appendValues(field, appendRangeFilter, appendQueryStringFilter);
        }
      });
    }

    return this.filters;
  }

  //--------------------------------------------------------------------

  appendRangeFilter(fieldPath: string, values: IRangeFilterValues) {
    const { formatRangeFilter } = this;

    this.appendMatchFilter(formatRangeFilter, fieldPath, values);
  }

  //--------------------------------------------------------------------

  appendQueryStringFilter(fieldPath: string, values: IUserFilterValues) {
    //append to match filters
    const { formatQueryStringFilter } = this;

    this.appendMatchFilter(formatQueryStringFilter, fieldPath, values);
  }

  //--------------------------------------------------------------------

  appendMatchFilter<
    T extends (...args: any[]) => TRangeFilter | TQueryStringFilter | null
  >(formatValuesCB: T, fieldPath: string, values: Parameters<T>[0]) {
    const filter = formatValuesCB(values, fieldPath);

    if (filter) {
      this.filters[fieldPath] = filter;
    } else {
      console.warn('Invalid formatted filter' + JSON.stringify(filter));
    }
  }

  //--------------------------------------------------------------------
}
