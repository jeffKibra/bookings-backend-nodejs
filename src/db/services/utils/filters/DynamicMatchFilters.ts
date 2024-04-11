// import { generateQueryStringFilter, generateRangeFilter } from '.';
import DynamicFieldPathAndValidValues, {
  IRangeFilterValues,
  IUserFilterValues,
  IUserFilters,
} from './DynamicFieldPathAndValidValues';
import DynamicFilters from './DynamicFilters';

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

export default class DynamicMatchFilters {
  filters: Record<string, IMatchQueryStringFilter | IMatchRangeFilter> = {};

  fieldsMap: DynamicFieldPathAndValidValues['fieldsMap'];
  userFilters?: DynamicFieldPathAndValidValues['userFilters'];

  constructor(
    fieldsMap: DynamicMatchFilters['fieldsMap'],
    userFilters?: DynamicMatchFilters['userFilters']
  ) {
    // super(fieldsMap, userFilters);

    this.fieldsMap = fieldsMap;
    this.userFilters = userFilters;
  }

  // generateDynamicFilters;

  generateFilters() {
    const { fieldsMap, userFilters } = this;
    const { formatRangeFilter, formatQueryStringFilter } = DynamicMatchFilters;

    const filters = new DynamicFilters(
      formatRangeFilter,
      formatQueryStringFilter,
      fieldsMap,
      userFilters
    ).generateFilters();

    return filters;
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

  static formatRangeFilter(values: IRangeFilterValues): IMatchRangeFilter {
    // if (!Array.isArray(values) || values.length !== 2) {
    //   return null;
    // }

    const min = +values[0];
    const max = +values[1];

    return { $gte: min, $lte: max };
  }

  //--------------------------------------------------------------------
}
