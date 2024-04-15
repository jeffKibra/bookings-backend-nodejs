import DynamicMatchFilters from './DynamicMatchFilters';
import DynamicSearchFilters from './DynamicSearchFilters';
import StaticFilters from './StaticFilters';
import {
  IUserFilters,
  IDynamicFiltersFieldsMap,
} from './DynamicFieldPathAndValidValues';

//
//
//

export default class Filters {
  fieldsMap: IDynamicFiltersFieldsMap;
  orgId: string;
  //

  constructor(orgId: Filters['orgId'], fieldsMap: Filters['fieldsMap']) {
    this.orgId = orgId;
    this.fieldsMap = fieldsMap;
  }

  generateSearchFilters(query: string | number, userFilters?: IUserFilters) {
    const { orgId, fieldsMap } = this;

    const staticSearchFilters = StaticFilters.generateForSearch(orgId);
    const dynamicSearchFilters = new DynamicSearchFilters(
      query,
      fieldsMap,
      userFilters
    ).generateFilters();

    console.log('dynamic search filters', dynamicSearchFilters);

    const filters = [...staticSearchFilters, ...dynamicSearchFilters];

    console.log('search filters', filters);

    return filters;
  }

  generateMatchFilters(
    userFilters?: Parameters<Filters['generateSearchFilters']>[1]
  ) {
    const { orgId, fieldsMap } = this;

    const staticMatchFilters = StaticFilters.generateForMatch(orgId);
    const dynamicMatchFilters = new DynamicMatchFilters(
      fieldsMap,
      userFilters
    ).generateFilters();

    console.log('dynamic match filters', dynamicMatchFilters);

    const filters = { ...dynamicMatchFilters, ...staticMatchFilters };

    console.log('match filters', filters);

    return filters;
  }

  generateFilters(...args: Parameters<Filters['generateSearchFilters']>) {
    const [query, userFilters] = args;

    // console.log({ args });

    let matchFilters: ReturnType<Filters['generateMatchFilters']> | null = null;
    let searchFilters: ReturnType<Filters['generateSearchFilters']> | null =
      null;

    if (query) {
      searchFilters = this.generateSearchFilters(...args);
    } else {
      matchFilters = this.generateMatchFilters(userFilters);
    }

    // console.log('search filters', searchFilters);
    // console.log('match filters', matchFilters);

    return {
      matchFilters,
      searchFilters,
    };
  }

  //--------------------------------------------------------------------
  //static methods
  //--------------------------------------------------------------------

  static generateStaticFilters(orgId: string) {
    return StaticFilters.generateFilters(orgId);
  }

  //--------------------------------------------------------------------
}
