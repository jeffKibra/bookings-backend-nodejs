import { generateQueryStringFilter, generateRangeFilter } from '.';
//

const dynamicFieldPaths = {
  rate: 'rate',
  color: 'color',
  model: 'model.name',
  make: 'model.make',
  type: 'model.type',
};
const filterFields = Object.keys(dynamicFieldPaths);

const staticFieldPaths = {
  orgId: 'metaData.orgId',
  status: 'metaData.status',
};

const fieldPaths = {
  orgId: 'metaData.orgId',
  status: 'metaData.status',
  ...dynamicFieldPaths,
};

type IFieldPaths = keyof typeof fieldPaths;
//

interface IGeneralFilter {
  path: string;
  values: (string | number | Date)[];
}

type IUserFiltersValues = (string | number | Date)[];
type IUserFilters = Record<string, IUserFiltersValues>;

interface IDynamicFilter {
  path: string;
  type: 'range' | 'normal';
}
type IDynamicFiltersOptions = Record<string, IDynamicFilter>;

export default class StaticFilters {
  static status = 0;
  static staticFieldPaths = {
    orgId: 'metaData.orgId',
    status: 'metaData.status',
  };

  //
  searchFilters: Record<string, unknown>[] = [];
  matchFilters: Record<string, unknown> = {};
  //
  orgId: string;
  //

  constructor(orgId: StaticFilters['orgId']) {
    this.orgId = orgId;
  }

  generateFilters() {
    this.generateStaticFilters();

    const { matchFilters, searchFilters } = this;

    console.log('match filters', matchFilters);
    console.log('search filters', searchFilters);

    const filters = { searchFilters, matchFilters };

    return filters;
  }

  generateStaticFilters() {
    const { query, orgId } = this;

    const { matchFilters, searchFilters } =
      StaticFilters.generateStaticFilters(orgId);

    if (query) {
      this.searchFilters = searchFilters;
    } else {
      this.matchFilters = matchFilters;
    }
  }

  //-------------------------------------------------------------------------
  //static methods
  //-------------------------------------------------------------------------
  static generateStaticFilters(orgId: string) {
    const orgIdPath = fieldPaths.orgId;
    const statusPath = fieldPaths.status;

    const searchFilters = [
      {
        text: {
          path: orgIdPath,
          query: orgId,
        },
      },
      {
        equals: {
          path: statusPath,
          value: 0,
        },
      },
    ];

    const matchFilters = {
      [orgIdPath]: orgId,
      [statusPath]: StaticFilters.status,
    };

    return {
      searchFilters,
      matchFilters,
    };
  }

  //--------------------------------------------------------------------
}
