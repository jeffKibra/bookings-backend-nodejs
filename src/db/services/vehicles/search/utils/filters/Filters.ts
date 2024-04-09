import { filters } from '../../../../utils';
//

const { generateQueryStringFilter, generateRangeFilter } = filters;

const dynamicFieldPaths = {
  rate: 'rate',
  color: 'color',
  model: 'model.name',
  make: 'model.make',
  type: 'model.type',
};
const filterFields = Object.keys(dynamicFieldPaths);

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

export default class Filters {
  static status = 0;

  searchFilters: Record<string, unknown>[] = [];
  matchFilters: Record<string, unknown> = {};
  //
  orgId: string;
  userFilters?: Record<string, (string | number | Date)[]>;
  //
  query: string;

  constructor(
    orgId: string,
    query: string,
    userFilters?: Record<IFieldPaths, (string | number | Date)[]>
  ) {
    this.query = query;
    this.orgId = orgId;
    this.userFilters = userFilters;
  }

  generateFilters() {
    this.generateStaticFilters();
    this.generateDynamicFilters();

    const { matchFilters, searchFilters, query } = this;

    console.log('match filters', matchFilters);
    console.log('search filters', searchFilters);

    const filters = { searchFilters, matchFilters };

    return filters;
  }

  generateStaticFilters() {
    const { query, orgId } = this;

    const { matchFilters, searchFilters } =
      Filters.generateStaticFilters(orgId);

    if (query) {
      this.searchFilters = searchFilters;
    } else {
      this.matchFilters = matchFilters;
    }
  }

  generateDynamicFilters() {
    const { userFilters } = this;

    if (userFilters && typeof userFilters === 'object') {
      Object.keys(dynamicFieldPaths).forEach(field => {
        const values = userFilters[field];

        if (Array.isArray(values) && values.length > 0) {
          this.appendFilter(field as IFieldPaths, values);
        }
      });
    }
  }

  appendFilter(field: IFieldPaths, values: IGeneralFilter['values']) {
    if (field === 'rate') {
      //append to search filters
      this.appendRangeFilter(field, values);
    } else {
      //append to match filters
      this.appendStringFilter(field, values);
    }
  }

  appendRangeFilter(field: IFieldPaths, values: IGeneralFilter['values']) {
    const { query } = this;

    const fieldPath = fieldPaths[field];

    const filter = generateRangeFilter(fieldPath, values);

    if (filter) {
      if (query) {
        //append to search filters
        this.appendSearchFilter(filter);
      } else {
        //append to match filters
        const { gte, lte } = filter.range;
        this.appendMatchFilter(fieldPath, { $gte: gte, $lte: lte });
      }
    }
  }

  appendStringFilter(field: IFieldPaths, values: IGeneralFilter['values']) {
    const { query } = this;

    const fieldPath = fieldPaths[field];

    if (query) {
      //append to search filters
      const filter = generateQueryStringFilter(fieldPath, values);

      this.appendSearchFilter(filter);
    } else {
      //append to match filters
      const filter = values.length === 1 ? values[0] : { $in: [...values] };
      this.appendMatchFilter(fieldPath, filter);
    }
  }

  appendMatchFilter(field: string, filter: unknown) {
    this.matchFilters[field] = filter;
  }

  appendSearchFilter(filter: {}) {
    return this.searchFilters.push(filter);
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
      [statusPath]: Filters.status,
    };

    return {
      searchFilters,
      matchFilters,
    };
  }
}
